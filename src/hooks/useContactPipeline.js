import { useState, useCallback, useEffect, useMemo } from 'react'

const STATUS_KEY = 'ac_contact_statuses'
const TRACKED_KEY = 'ac_tracked'
const TIMESTAMPS_KEY = 'ac_contact_timestamps'
const NOTES_KEY = 'ac_contact_notes'
const REMINDERS_KEY = 'ac_contact_reminders'

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback } catch { return fallback }
}

function saveJSON(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)) } catch { /* storage full */ }
}

export function useContactPipeline() {
  // Status: null → contacted → responded → interested → (closed | null)
  const [contactStatuses, setContactStatuses] = useState(() => loadJSON(STATUS_KEY, {}))
  const [trackedBusinesses, setTrackedBusinesses] = useState(() => loadJSON(TRACKED_KEY, []))

  // Timestamps: when each status was set
  const [contactTimestamps, setContactTimestamps] = useState(() => loadJSON(TIMESTAMPS_KEY, {}))

  // Notes per business
  const [contactNotes, setContactNotes] = useState(() => loadJSON(NOTES_KEY, {}))

  // Reminders: { [place_id]: { dueDate: ISO, note: string, completed: bool } }
  const [contactReminders, setContactReminders] = useState(() => loadJSON(REMINDERS_KEY, {}))

  // Persist all state changes
  useEffect(() => { saveJSON(STATUS_KEY, contactStatuses) }, [contactStatuses])
  useEffect(() => { saveJSON(TRACKED_KEY, trackedBusinesses) }, [trackedBusinesses])
  useEffect(() => { saveJSON(TIMESTAMPS_KEY, contactTimestamps) }, [contactTimestamps])
  useEffect(() => { saveJSON(NOTES_KEY, contactNotes) }, [contactNotes])
  useEffect(() => { saveJSON(REMINDERS_KEY, contactReminders) }, [contactReminders])

  const cycleContactStatus = useCallback((business) => {
    const order = [null, 'contacted', 'responded', 'interested']
    setContactStatuses(prev => {
      const current = prev[business.place_id] || null
      const idx = order.indexOf(current)
      const next = order[(idx + 1) % order.length]
      const updated = { ...prev }
      if (next === null) {
        delete updated[business.place_id]
        setTrackedBusinesses(p => p.filter(b => b.place_id !== business.place_id))
        setContactTimestamps(p => { const t = { ...p }; delete t[business.place_id]; return t })
      } else {
        updated[business.place_id] = next
        setTrackedBusinesses(p => {
          if (p.some(b => b.place_id === business.place_id)) return p
          return [...p, business]
        })
        setContactTimestamps(p => ({
          ...p,
          [business.place_id]: { ...p[business.place_id], [next]: new Date().toISOString() },
        }))
      }
      return updated
    })
  }, [])

  const clearContactStatus = useCallback((placeId) => {
    setContactStatuses(prev => { const updated = { ...prev }; delete updated[placeId]; return updated })
    setTrackedBusinesses(p => p.filter(b => b.place_id !== placeId))
    setContactTimestamps(prev => { const updated = { ...prev }; delete updated[placeId]; return updated })
    setContactNotes(prev => { const updated = { ...prev }; delete updated[placeId]; return updated })
    setContactReminders(prev => { const updated = { ...prev }; delete updated[placeId]; return updated })
  }, [])

  const getContactStatus = useCallback((placeId) => contactStatuses[placeId] || null, [contactStatuses])

  // Notes
  const getNotes = useCallback((placeId) => contactNotes[placeId] || '', [contactNotes])
  const setNotes = useCallback((placeId, text) => {
    setContactNotes(prev => ({ ...prev, [placeId]: text }))
  }, [])

  // Reminders
  const getReminder = useCallback((placeId) => contactReminders[placeId] || null, [contactReminders])
  const setReminder = useCallback((placeId, dueDate, note) => {
    setContactReminders(prev => ({
      ...prev,
      [placeId]: { dueDate, note, completed: false, createdAt: new Date().toISOString() },
    }))
  }, [])
  const completeReminder = useCallback((placeId) => {
    setContactReminders(prev => ({
      ...prev,
      [placeId]: prev[placeId] ? { ...prev[placeId], completed: true } : null,
    }))
  }, [])
  const removeReminder = useCallback((placeId) => {
    setContactReminders(prev => { const updated = { ...prev }; delete updated[placeId]; return updated })
  }, [])

  // Upcoming reminders (not completed, due date in the future or today)
  const upcomingReminders = useMemo(() => {
    const now = new Date().toISOString().split('T')[0]
    return Object.entries(contactReminders)
      .filter(([, r]) => r && !r.completed && r.dueDate >= now)
      .sort(([, a], [, b]) => a.dueDate.localeCompare(b.dueDate))
      .map(([placeId, r]) => ({ placeId, ...r }))
  }, [contactReminders])

  // Derived counts
  const trackedCounts = useMemo(() => ({
    contacted: trackedBusinesses.filter(b => contactStatuses[b.place_id] === 'contacted').length,
    responded: trackedBusinesses.filter(b => contactStatuses[b.place_id] === 'responded').length,
    interested: trackedBusinesses.filter(b => contactStatuses[b.place_id] === 'interested').length,
    total: trackedBusinesses.length,
  }), [trackedBusinesses, contactStatuses])

  return {
    contactStatuses,
    trackedBusinesses,
    setTrackedBusinesses,
    cycleContactStatus,
    clearContactStatus,
    getContactStatus,
    trackedCounts,
    // Timestamps
    contactTimestamps,
    // Notes
    getNotes,
    setNotes,
    // Reminders
    getReminder,
    setReminder,
    completeReminder,
    removeReminder,
    upcomingReminders,
  }
}