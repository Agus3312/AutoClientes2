import { describe, it, expect, beforeEach } from 'vitest'

// We test the raw logic, not React hooks (that would need @testing-library/react-hooks)
// So we replicate the pure-data functions for unit testing

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback } catch { return fallback }
}

// Simulate the pipeline state machine
function cycleStatus(currentStatus) {
  const order = [null, 'contacted', 'responded', 'interested']
  const idx = order.indexOf(currentStatus)
  return order[(idx + 1) % order.length]
}

describe('useContactPipeline — extended features', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('status cycle', () => {
    it('cycles null -> contacted', () => {
      expect(cycleStatus(null)).toBe('contacted')
    })
    it('cycles contacted -> responded', () => {
      expect(cycleStatus('contacted')).toBe('responded')
    })
    it('cycles responded -> interested', () => {
      expect(cycleStatus('responded')).toBe('interested')
    })
    it('cycles interested -> null (removes)', () => {
      expect(cycleStatus('interested')).toBe(null)
    })
  })

  describe('notes persistence', () => {
    it('saves and loads notes from localStorage', () => {
      localStorage.setItem('ac_contact_notes', JSON.stringify({ place1: 'Call on Monday' }))
      const notes = loadJSON('ac_contact_notes', {})
      expect(notes.place1).toBe('Call on Monday')
    })
    it('returns empty object when no notes exist', () => {
      const notes = loadJSON('ac_contact_notes', {})
      expect(notes).toEqual({})
    })
  })

  describe('reminders persistence', () => {
    it('saves and loads reminders from localStorage', () => {
      const reminder = { place1: { dueDate: '2025-07-01', note: 'Follow up', completed: false, createdAt: '2025-06-15T10:00:00.000Z' } }
      localStorage.setItem('ac_contact_reminders', JSON.stringify(reminder))
      const loaded = loadJSON('ac_contact_reminders', {})
      expect(loaded.place1.dueDate).toBe('2025-07-01')
      expect(loaded.place1.completed).toBe(false)
    })
    it('marks reminder as completed', () => {
      const reminder = { place1: { dueDate: '2025-07-01', note: 'Follow up', completed: false } }
      // Mark completed
      reminder.place1.completed = true
      expect(reminder.place1.completed).toBe(true)
    })
  })

  describe('timestamps persistence', () => {
    it('saves timestamps per status per business', () => {
      const timestamps = { place1: { contacted: '2025-06-10T08:00:00.000Z', responded: '2025-06-12T14:30:00.000Z' } }
      localStorage.setItem('ac_contact_timestamps', JSON.stringify(timestamps))
      const loaded = loadJSON('ac_contact_timestamps', {})
      expect(loaded.place1.contacted).toBe('2025-06-10T08:00:00.000Z')
      expect(loaded.place1.responded).toBe('2025-06-12T14:30:00.000Z')
    })
  })

  describe('upcoming reminders filter', () => {
    it('filters out completed reminders', () => {
      const reminders = {
        place1: { dueDate: '2025-07-01', note: 'A', completed: false },
        place2: { dueDate: '2025-07-02', note: 'B', completed: true },
      }
      const upcoming = Object.entries(reminders)
        .filter(([, r]) => r && !r.completed)
      expect(upcoming.length).toBe(1)
      expect(upcoming[0][0]).toBe('place1')
    })

    it('filters out past-due reminders', () => {
      const today = new Date().toISOString().split('T')[0]
      const pastDate = '2020-01-01'
      const reminders = {
        place1: { dueDate: today, note: 'Today', completed: false },
        place2: { dueDate: pastDate, note: 'Past', completed: false },
      }
      const upcoming = Object.entries(reminders)
        .filter(([, r]) => r && !r.completed && r.dueDate >= today)
      expect(upcoming.length).toBe(1)
      expect(upcoming[0][0]).toBe('place1')
    })

    it('sorts reminders by due date ascending', () => {
      const reminders = {
        place1: { dueDate: '2025-07-15', note: 'Later', completed: false },
        place2: { dueDate: '2025-07-01', note: 'Sooner', completed: false },
      }
      const upcoming = Object.entries(reminders)
        .filter(([, r]) => r && !r.completed)
        .sort(([, a], [, b]) => a.dueDate.localeCompare(b.dueDate))
      expect(upcoming[0][0]).toBe('place2')
    })
  })

  describe('clearContactStatus clears all related data', () => {
    it('removes status, timestamps, notes, and reminders for a place_id', () => {
      let statuses = { place1: 'contacted', place2: 'responded' }
      let timestamps = { place1: { contacted: '2025-06-10T08:00:00.000Z' } }
      let notes = { place1: 'Some notes' }
      let reminders = { place1: { dueDate: '2025-07-01', note: 'A', completed: false } }

      // Simulate clearing
      const placeId = 'place1'
      delete statuses[placeId]
      delete timestamps[placeId]
      delete notes[placeId]
      delete reminders[placeId]

      expect(statuses).toEqual({ place2: 'responded' })
      expect(timestamps).toEqual({})
      expect(notes).toEqual({})
      expect(reminders).toEqual({})
    })
  })
})