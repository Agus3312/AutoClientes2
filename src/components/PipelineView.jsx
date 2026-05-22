import { useState } from 'react'
import { X, MapPin, Star, ExternalLink, Phone, Trash2, StickyNote, Bell, ChevronRight, ChevronLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatPhoneForWhatsApp } from '../utils/phoneUtils'
import ReminderModal from './ReminderModal'
import NotesEditor from './NotesEditor'

const COLUMNS = [
  { status: 'contacted',  label: 'Contactados',  icon: '✉️', accent: 'brand',  bgCol: 'bg-brand-50 dark:bg-brand-950/30', borderCol: 'border-brand-200 dark:border-brand-900/40', badge: 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300' },
  { status: 'responded',  label: 'Respondieron',  icon: '💬', accent: 'emerald', bgCol: 'bg-emerald-50 dark:bg-emerald-950/30', borderCol: 'border-emerald-200 dark:border-emerald-900/40', badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' },
  { status: 'interested', label: 'Interesados', icon: '🎯', accent: 'amber',   bgCol: 'bg-amber-50 dark:bg-amber-950/30', borderCol: 'border-amber-200 dark:border-amber-900/40', badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' },
]

function formatRelativeTime(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `hace ${days}d`
}

export default function PipelineView() {
  const {
    trackedBusinesses, contactStatuses, contactTimestamps,
    showInteresados, setShowInteresados,
    cycleContactStatus, clearContactStatus,
    getNotes, setNotes, getReminder, setReminder, completeReminder, removeReminder,
  } = useApp()

  const [selectedCard, setSelectedCard] = useState(null)
  const [showReminder, setShowReminder] = useState(null) // placeId or null
  const [mobileCol, setMobileCol] = useState(0) // for mobile column swipe

  if (!showInteresados) return null

  const handleRemove = (business) => {
    clearContactStatus(business.place_id)
    if (selectedCard?.place_id === business.place_id) setSelectedCard(null)
  }

  const handleCycle = (business) => {
    cycleContactStatus(business)
  }

  const getBusinessByPlaceId = (placeId) => trackedBusinesses.find(b => b.place_id === placeId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowInteresados(false)} />

      <div className="relative w-full h-full sm:h-[85vh] max-w-5xl bg-white dark:bg-surface-950 rounded-2xl sm:rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-sm shadow-brand-500/25">
              <span className="text-white text-sm">📥</span>
            </div>
            <div>
              <h2 className="font-display font-bold text-slate-800 dark:text-white">Pipeline</h2>
              <p className="text-[11px] text-slate-400 dark:text-gray-500 -mt-0.5">{trackedBusinesses.length} negocios en seguimiento</p>
            </div>
          </div>
          <button onClick={() => setShowInteresados(false)} className="btn-ghost">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile column tabs */}
        <div className="flex sm:hidden border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          {COLUMNS.map((col, i) => {
            const count = trackedBusinesses.filter(b => contactStatuses[b.place_id] === col.status).length
            return (
              <button key={col.status} onClick={() => setMobileCol(i)}
                className={`flex-1 py-2.5 text-center text-xs font-semibold transition-colors ${
                  mobileCol === i ? `text-brand-600 dark:text-brand-400 border-b-2 border-brand-500` : 'text-slate-400 dark:text-gray-500'
                }`}
              >
                {col.icon} {col.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Kanban columns */}
        <div className="flex-1 overflow-hidden flex">
          {/* Desktop: all 3 columns */}
          <div className="hidden sm:flex flex-1 gap-3 p-4 overflow-hidden">
            {COLUMNS.map(col => {
              const items = trackedBusinesses.filter(b => contactStatuses[b.place_id] === col.status)
              return (
                <div key={col.status} className="flex-1 flex flex-col min-w-0">
                  <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-xl ${col.bgCol} ${col.borderCol} border`}>
                    <span className="text-sm">{col.icon}</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-gray-300 uppercase tracking-wider">{col.label}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${col.badge}`}>{items.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    {items.length === 0 && (
                      <div className="text-center py-8 text-slate-300 dark:text-gray-600 text-xs">
                        Arrastra o mueve negocios aquí
                      </div>
                    )}
                    {items.map(b => (
                      <PipelineCard
                        key={b.place_id}
                        business={b}
                        col={col}
                        timestamps={contactTimestamps[b.place_id]}
                        notes={getNotes(b.place_id)}
                        reminder={getReminder(b.place_id)}
                        onCycle={handleCycle}
                        onRemove={handleRemove}
                        onExpand={setSelectedCard}
                        onReminder={setShowReminder}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mobile: single column at a time */}
          <div className="sm:hidden flex-1 flex flex-col overflow-hidden">
            {COLUMNS.map((col, i) => {
              if (i !== mobileCol) return null
              const items = trackedBusinesses.filter(b => contactStatuses[b.place_id] === col.status)
              return (
                <div key={col.status} className="flex-1 overflow-y-auto p-3 space-y-2">
                  {/* Nav arrows */}
                  <div className="flex items-center justify-between mb-2">
                    <button onClick={() => setMobileCol(Math.max(0, i - 1))} disabled={i === 0}
                      className="btn-ghost disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.badge}`}>{items.length}</span>
                    <button onClick={() => setMobileCol(Math.min(2, i + 1))} disabled={i === 2}
                      className="btn-ghost disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                  {items.length === 0 && (
                    <div className="text-center py-12 text-slate-300 dark:text-gray-600 text-xs">
                      Sin negocios en esta etapa
                    </div>
                  )}
                  {items.map(b => (
                    <PipelineCard
                      key={b.place_id}
                      business={b}
                      col={col}
                      timestamps={contactTimestamps[b.place_id]}
                      notes={getNotes(b.place_id)}
                      reminder={getReminder(b.place_id)}
                      onCycle={handleCycle}
                      onRemove={handleRemove}
                      onExpand={setSelectedCard}
                      onReminder={setShowReminder}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        {/* Expanded card detail */}
        {selectedCard && (
          <CardDetail
            business={selectedCard}
            timestamps={contactTimestamps?.[selectedCard.place_id]}
            notes={getNotes(selectedCard.place_id)}
            reminder={getReminder(selectedCard.place_id)}
            status={contactStatuses[selectedCard.place_id]}
            onClose={() => setSelectedCard(null)}
            onCycle={() => cycleContactStatus(selectedCard)}
            onRemove={() => { handleRemove(selectedCard) }}
            onSetNotes={text => setNotes(selectedCard.place_id, text)}
            onSetReminder={(date, note) => { setReminder(selectedCard.place_id, date, note); setShowReminder(null) }}
            onCompleteReminder={() => completeReminder(selectedCard.place_id)}
            onRemoveReminder={() => removeReminder(selectedCard.place_id)}
            onOpenReminder={() => setShowReminder(selectedCard.place_id)}
          />
        )}

        {/* Reminder modal */}
        {showReminder && (
          <ReminderModal
            placeId={showReminder}
            existingReminder={getReminder(showReminder)}
            onSave={(date, note) => { setReminder(showReminder, date, note); setShowReminder(null) }}
            onRemove={() => { removeReminder(showReminder); setShowReminder(null) }}
            onClose={() => setShowReminder(null)}
          />
        )}
      </div>
    </div>
  )
}

function PipelineCard({ business, col, timestamps, notes, reminder, onCycle, onRemove, onExpand, onReminder }) {
  const hasNotes = notes && notes.trim().length > 0
  const hasReminder = reminder && !reminder.completed
  return (
    <div className={`group p-3 rounded-xl border ${col.borderCol} ${col.bgCol} hover:shadow-card-hover transition-all cursor-pointer`}
      onClick={() => onExpand(business)}
    >
      <div className="flex items-start gap-2.5">
        {business.photos?.[0]?.photo_reference ? (
          <img
            src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=60&photo_reference=${business.photos[0].photo_reference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`}
            alt={business.name}
            className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-9 h-9 bg-white/80 dark:bg-surface-800 rounded-lg flex items-center justify-center flex-shrink-0 text-sm">
            {col.icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-slate-800 dark:text-white line-clamp-1">{business.name}</p>
          {business.rating && (
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-[11px] text-slate-500">{business.rating}</span>
            </div>
          )}
          {business.vicinity && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-300" />
              <span className="text-[11px] text-slate-400 line-clamp-1">{business.vicinity}</span>
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/40 dark:border-surface-700/40">
        {/* Advance status */}
        <button onClick={e => { e.stopPropagation(); onCycle(business) }}
          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/70 dark:bg-surface-800/70 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors"
          title="Avanzar estado"
        >
          →
        </button>
        {/* Notes indicator */}
        {hasNotes && (
          <span className="text-[10px] text-brand-500" title="Tiene notas"><StickyNote className="w-3 h-3" /></span>
        )}
        {/* Reminder indicator */}
        {hasReminder && (
          <button onClick={e => { e.stopPropagation(); onReminder(business.place_id) }}
            className="text-[10px] text-amber-500 hover:text-amber-600 flex items-center gap-0.5"
            title={`Recordatorio: ${reminder.dueDate}`}
          >
            <Bell className="w-3 h-3" />
          </button>
        )}
        {/* Timestamp */}
        {timestamps?.[col.status] && (
          <span className="ml-auto text-[9px] text-slate-400 dark:text-gray-500">
            {formatRelativeTime(timestamps[col.status])}
          </span>
        )}
        {/* Link + remove */}
        <a href={`https://www.google.com/maps/place/?q=place_id:${business.place_id}`} target="_blank" rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="ml-auto btn-ghost p-0.5" title="Maps"
        >
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
        <button onClick={e => { e.stopPropagation(); onRemove(business) }}
          className="btn-ghost p-0.5 text-red-400 hover:text-red-600" title="Quitar"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

function CardDetail({ business, timestamps, notes, reminder, status, onClose, onCycle, onRemove, onSetNotes, onCompleteReminder, onRemoveReminder, onOpenReminder }) {
  const STATUS_LABELS = { contacted: 'Contactado', responded: 'Respondió', interested: 'Interesado' }
  return (
    <div className="absolute inset-0 z-50 bg-white dark:bg-surface-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
        <button onClick={onClose} className="btn-ghost"><X className="w-4 h-4" /></button>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-slate-900 dark:text-white line-clamp-1">{business.name}</h3>
          {status && <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400">{STATUS_LABELS[status]}</span>}
        </div>
        <button onClick={onCycle} className="btn-primary text-sm">Avanzar →</button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Business info */}
        <div className="card-flat p-4 space-y-2">
          {business.vicinity && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-300">
              <MapPin className="w-4 h-4 text-slate-400" />{business.vicinity}
            </div>
          )}
          {business.phone && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-300">
              <Phone className="w-4 h-4 text-slate-400" />{business.phone}
              <a href={`https://wa.me/${formatPhoneForWhatsApp(business.phone)}`} target="_blank" rel="noopener noreferrer"
                className="ml-auto text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">WhatsApp</a>
            </div>
          )}
          {business.rating && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-300">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />{business.rating} ({business.user_ratings_total?.toLocaleString() || 0} reseñas)
            </div>
          )}
          {timestamps && Object.entries(timestamps).map(([key, iso]) => (
            <div key={key} className="text-[11px] text-slate-400">
              <strong>{STATUS_LABELS[key] || key}</strong>: {new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </div>
          ))}
        </div>

        {/* Notes */}
        <NotesEditor placeId={business.place_id} notes={notes} onSetNotes={onSetNotes} />

        {/* Reminder */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-gray-200 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-500" />Recordatorio
            </h4>
            {reminder && !reminder.completed && (
              <div className="flex gap-1.5">
                <button onClick={onCompleteReminder} className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-700">Completar</button>
                <button onClick={onRemoveReminder} className="text-[10px] font-semibold text-red-400 hover:text-red-600">Eliminar</button>
              </div>
            )}
          </div>
          {reminder && !reminder.completed ? (
            <div className="card-flat p-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  {new Date(reminder.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </p>
                {reminder.note && <p className="text-[11px] text-slate-500">{reminder.note}</p>}
              </div>
            </div>
          ) : reminder?.completed ? (
            <div className="card-flat p-3 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              ✅ Recordatorio completado
            </div>
          ) : (
            <button
              onClick={onOpenReminder}
              className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium"
            >
              + Añadir recordatorio
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button onClick={onRemove} className="text-sm text-red-400 hover:text-red-600 font-medium">
            Quitar del seguimiento
          </button>
        </div>
      </div>
    </div>
  )
}