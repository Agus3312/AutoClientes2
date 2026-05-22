/**
 * localStorage utility with TTL and LRU eviction.
 *
 * Each entry is stored as: { value: any, timestamp: number }
 * - TTL: entries older than `maxAgeMs` are treated as expired and evicted.
 * - LRU: when storage exceeds `maxEntries`, the oldest accessed entries are removed.
 * - Auto-cleanup: corrupt JSON or expired entries are pruned on read.
 */

const DEFAULT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
const DEFAULT_MAX_ENTRIES = 200

function parseEntry(raw) {
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed.timestamp !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

/**
 * Get an item from localStorage with TTL check.
 * Returns null if expired or missing.
 */
export function getWithTTL(key, maxAgeMs = DEFAULT_MAX_AGE_MS) {
  const raw = localStorage.getItem(key)
  if (!raw) return null

  const entry = parseEntry(raw)
  if (!entry) {
    localStorage.removeItem(key)
    return null
  }

  const age = Date.now() - entry.timestamp
  if (age > maxAgeMs) {
    localStorage.removeItem(key)
    return null
  }

  return entry.value
}

/**
 * Set an item in localStorage with a timestamp.
 */
export function setWithTTL(key, value) {
  const entry = { value, timestamp: Date.now() }
  try {
    localStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // Storage full — run eviction and retry
    evictOldest(key)
    try {
      localStorage.setItem(key, JSON.stringify(entry))
    } catch {
      // Still full, give up silently
    }
  }
}

/**
 * Get an entire stored map (like lighthouse data) with TTL per entry.
 * Expired entries are pruned automatically.
 */
export function getMapWithTTL(key, maxAgeMs = DEFAULT_MAX_AGE_MS) {
  const raw = localStorage.getItem(key)
  if (!raw) return {}

  let map
  try {
    map = JSON.parse(raw)
  } catch {
    localStorage.removeItem(key)
    return {}
  }

  if (typeof map !== 'object' || map === null) {
    localStorage.removeItem(key)
    return {}
  }

  // Prune expired entries
  const now = Date.now()
  let changed = false
  for (const [id, entry] of Object.entries(map)) {
    if (!entry || typeof entry !== 'object' || typeof entry.timestamp !== 'number') {
      delete map[id]
      changed = true
      continue
    }
    if (now - entry.timestamp > maxAgeMs) {
      delete map[id]
      changed = true
    }
  }

  if (changed) {
    try { localStorage.setItem(key, JSON.stringify(map)) } catch { /* ignore */ }
  }

  // Return only values (strip timestamps) for backward compatibility
  const result = {}
  for (const [id, entry] of Object.entries(map)) {
    result[id] = entry.value
  }
  return result
}

/**
 * Set a single entry in a stored map with timestamp.
 */
export function setMapEntryWithTTL(mapKey, entryKey, value) {
  let map
  const raw = localStorage.getItem(mapKey)
  try {
    map = raw ? JSON.parse(raw) : {}
  } catch {
    map = {}
  }

  if (!map[entryKey] || typeof map[entryKey] !== 'object') {
    map[entryKey] = {}
  }
  map[entryKey] = { value, timestamp: Date.now() }

  // Enforce max entries (LRU eviction)
  const entries = Object.entries(map)
  if (entries.length > 200) {
    // Sort by timestamp, remove oldest
    entries.sort((a, b) => (a[1]?.timestamp || 0) - (b[1]?.timestamp || 0))
    const toRemove = entries.length - 150 // keep 150 after eviction
    for (let i = 0; i < toRemove; i++) {
      delete map[entries[i][0]]
    }
  }

  try {
    localStorage.setItem(mapKey, JSON.stringify(map))
  } catch {
    evictOldest(mapKey)
    try { localStorage.setItem(mapKey, JSON.stringify(map)) } catch { /* ignore */ }
  }
}

/**
 * Evict the oldest entries from a map in localStorage when storage is full.
 */
function evictOldest(key) {
  const raw = localStorage.getItem(key)
  if (!raw) return

  let map
  try { map = JSON.parse(raw) } catch { return }
  if (typeof map !== 'object') return

  const entries = Object.entries(map)
  if (entries.length <= 10) return

  entries.sort((a, b) => {
    const ta = typeof a[1] === 'object' && a[1]?.timestamp ? a[1].timestamp : 0
    const tb = typeof b[1] === 'object' && b[1]?.timestamp ? b[1].timestamp : 0
    return ta - tb
  })

  // Remove oldest 25%
  const toRemove = Math.ceil(entries.length * 0.25)
  for (let i = 0; i < toRemove; i++) {
    delete map[entries[i][0]]
  }

  try { localStorage.setItem(key, JSON.stringify(map)) } catch { /* give up */ }
}

/**
 * Clear all entries from a stored map.
 */
export function clearMap(key) {
  localStorage.removeItem(key)
}

/**
 * Get the count of entries in a stored map.
 */
export function getMapSize(key) {
  const raw = localStorage.getItem(key)
  if (!raw) return 0
  try {
    const map = JSON.parse(raw)
    return typeof map === 'object' ? Object.keys(map).length : 0
  } catch {
    return 0
  }
}