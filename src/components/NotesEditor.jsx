import { useState, useEffect, useRef } from 'react'
import { StickyNote } from 'lucide-react'

export default function NotesEditor({ placeId, notes, onSetNotes }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(notes || '')
  const textareaRef = useRef(null)

  useEffect(() => { setText(notes || '') }, [notes])

  const handleSave = () => {
    onSetNotes(text.trim())
    setEditing(false)
  }

  const handleStartEdit = () => {
    setText(notes || '')
    setEditing(true)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  if (editing) {
    return (
      <div>
        <h4 className="text-sm font-semibold text-slate-700 dark:text-gray-200 flex items-center gap-1.5 mb-2">
          <StickyNote className="w-4 h-4 text-brand-500" />Notas
        </h4>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          className="input-field w-full min-h-[100px] text-sm resize-y"
          placeholder="Escribe notas sobre este negocio..."
        />
        <div className="flex gap-2 mt-2">
          <button onClick={handleSave} className="btn-primary text-sm">Guardar</button>
          <button onClick={() => setEditing(false)} className="btn-ghost text-sm">Cancelar</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-700 dark:text-gray-200 flex items-center gap-1.5 mb-2">
        <StickyNote className="w-4 h-4 text-brand-500" />Notas
      </h4>
      {notes ? (
        <div
          onClick={handleStartEdit}
          className="cursor-pointer card-flat p-3 text-sm text-slate-700 dark:text-gray-200 whitespace-pre-wrap hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
        >
          {notes}
        </div>
      ) : (
        <button
          onClick={handleStartEdit}
          className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium"
        >
          + Añadir notas
        </button>
      )}
    </div>
  )
}