import { useState } from 'react'
import { X, Bell, Calendar, Trash2 } from 'lucide-react'

export default function ReminderModal({ placeId, existingReminder, onSave, onRemove, onClose }) {
  const [dueDate, setDueDate] = useState(existingReminder?.dueDate?.split('T')[0] || '')
  const [note, setNote] = useState(existingReminder?.note || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!dueDate) return
    onSave(dueDate, note.trim())
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-surface-950 rounded-2xl shadow-modal border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold text-slate-800 dark:text-white">Recordatorio</h3>
          </div>
          <button onClick={onClose} className="btn-ghost"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-200 mb-1.5">
              <Calendar className="w-3.5 h-3.5 inline mr-1" />Fecha límite
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="input-field w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-200 mb-1.5">Nota (opcional)</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="input-field w-full"
              placeholder="Ej: Llamar por la mañana"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-primary flex-1">Guardar</button>
            {existingReminder && (
              <button type="button" onClick={onRemove}
                className="btn-ghost text-red-400 hover:text-red-600 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" />Eliminar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}