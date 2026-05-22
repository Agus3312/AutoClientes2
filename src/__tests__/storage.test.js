import { describe, it, expect, beforeEach } from 'vitest'
import { getWithTTL, setWithTTL, getMapWithTTL, setMapEntryWithTTL, clearMap, getMapSize } from '../utils/storage'

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getWithTTL / setWithTTL', () => {
    it('stores and retrieves a value', () => {
      setWithTTL('test-key', { name: 'test' })
      const result = getWithTTL('test-key')
      expect(result).toEqual({ name: 'test' })
    })

    it('returns null for missing keys', () => {
      expect(getWithTTL('nonexistent')).toBeNull()
    })

    it('returns null for expired entries', () => {
      const key = 'expired-key'
      // Manually set an entry with old timestamp
      const entry = { value: 'old data', timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000 } // 8 days ago
      localStorage.setItem(key, JSON.stringify(entry))
      const result = getWithTTL(key, 7 * 24 * 60 * 60 * 1000)
      expect(result).toBeNull()
    })

    it('returns value for fresh entries', () => {
      setWithTTL('fresh-key', 'fresh data')
      const result = getWithTTL('fresh-key', 7 * 24 * 60 * 60 * 1000)
      expect(result).toBe('fresh data')
    })

    it('handles corrupt JSON gracefully', () => {
      localStorage.setItem('corrupt', '{invalid json')
      expect(getWithTTL('corrupt')).toBeNull()
    })

    it('handles entries without timestamp', () => {
      localStorage.setItem('notimestamp', JSON.stringify({ value: 'test' }))
      expect(getWithTTL('notimestamp')).toBeNull()
    })
  })

  describe('getMapWithTTL', () => {
    it('returns empty object for missing key', () => {
      expect(getMapWithTTL('missing')).toEqual({})
    })

    it('retrieves a map with TTL-aware entries', () => {
      const map = {
        place1: { value: { performance: 90 }, timestamp: Date.now() },
        place2: { value: { performance: 50 }, timestamp: Date.now() },
      }
      localStorage.setItem('lh', JSON.stringify(map))
      const result = getMapWithTTL('lh')
      expect(result.place1).toEqual({ performance: 90 })
      expect(result.place2).toEqual({ performance: 50 })
    })

    it('prunes expired entries from the map', () => {
      const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000
      const map = {
        fresh: { value: { score: 90 }, timestamp: Date.now() },
        expired: { value: { score: 50 }, timestamp: eightDaysAgo },
      }
      localStorage.setItem('lh', JSON.stringify(map))
      const result = getMapWithTTL('lh', 7 * 24 * 60 * 60 * 1000)
      expect(result.fresh).toEqual({ score: 90 })
      expect(result.expired).toBeUndefined()
    })

    it('handles corrupt JSON', () => {
      localStorage.setItem('bad', 'not json')
      expect(getMapWithTTL('bad')).toEqual({})
    })

    it('handles non-object JSON', () => {
      localStorage.setItem('arr', JSON.stringify([1, 2, 3]))
      expect(getMapWithTTL('arr')).toEqual({})
    })
  })

  describe('setMapEntryWithTTL', () => {
    it('adds an entry to an empty map', () => {
      setMapEntryWithTTL('lh', 'place1', { performance: 85 })
      const result = getMapWithTTL('lh')
      expect(result.place1).toEqual({ performance: 85 })
    })

    it('updates an existing entry', () => {
      setMapEntryWithTTL('lh', 'place1', { performance: 70 })
      setMapEntryWithTTL('lh', 'place1', { performance: 95 })
      const result = getMapWithTTL('lh')
      expect(result.place1).toEqual({ performance: 95 })
    })

    it('adds multiple entries', () => {
      setMapEntryWithTTL('lh', 'p1', { seo: 80 })
      setMapEntryWithTTL('lh', 'p2', { seo: 90 })
      const result = getMapWithTTL('lh')
      expect(result.p1).toEqual({ seo: 80 })
      expect(result.p2).toEqual({ seo: 90 })
    })
  })

  describe('clearMap', () => {
    it('removes the key from localStorage', () => {
      setMapEntryWithTTL('lh', 'p1', { score: 50 })
      clearMap('lh')
      expect(getMapWithTTL('lh')).toEqual({})
      expect(localStorage.getItem('lh')).toBeNull()
    })
  })

  describe('getMapSize', () => {
    it('returns 0 for missing key', () => {
      expect(getMapSize('missing')).toBe(0)
    })

    it('returns the number of entries', () => {
      setMapEntryWithTTL('lh', 'p1', { a: 1 })
      setMapEntryWithTTL('lh', 'p2', { b: 2 })
      expect(getMapSize('lh')).toBe(2)
    })
  })
})