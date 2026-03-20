import { useState, useEffect } from 'react'
import { MessageSquare, Send, Star, Globe, MapPin, Phone, Copy, Check, X, Mail, Instagram, Facebook, Twitter, Linkedin, Youtube, Zap, ExternalLink } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { generateWhatsAppMessage } from '../utils/promptTemplates'
import { buildWhatsAppUrl } from '../utils/phoneUtils'

function BusinessSummary({ business, lighthouse }) {
  const hasScores = lighthouse && !lighthouse.error && !lighthouse.noWebsite
  return (
    <div className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-slate-100 dark:border-gray-800">
      <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">{business.name}</h3>
      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-gray-400">
        {business.rating && (
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            {business.rating} ({business.user_ratings_total?.toLocaleString() || 0})
          </span>
        )}
        {business.vicinity && (
          <span className="flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3" />
            {business.vicinity.split(',')[0]}
          </span>
        )}
        {business.website ? (
          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <Globe className="w-3 h-3" /> Con web
          </span>
        ) : (
          <span className="flex items-center gap-1 text-red-400">
            <Globe className="w-3 h-3" /> Sin web
          </span>
        )}
      </div>
      {hasScores && (
        <div className="flex gap-1.5 mt-2">
          <ScoreMini label="Perf" score={lighthouse.performance} />
          <ScoreMini label="SEO" score={lighthouse.seo} />
          <ScoreMini label="A11y" score={lighthouse.accessibility} />
          <ScoreMini label="BP" score={lighthouse.bestPractices} />
        </div>
      )}
    </div>
  )
}

function ScoreMini({ label, score }) {
  const cls = score >= 90 ? 'badge-green' : score >= 50 ? 'badge-yellow' : 'badge-red'
  return <span className={cls}>{label} {score}</span>
}

export default function PromptPanel() {
  const { selectedBusiness, setSelectedBusiness, lighthouseData, searchQuery, userSettings } = useApp()
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)

  const business = selectedBusiness
  const lighthouse = business ? lighthouseData[business.place_id] : null
  const loc = searchQuery.location || ''
  const businessType = searchQuery.type || ''

  // Generate message when business changes
  useEffect(() => {
    if (business) {
      setMessage(generateWhatsAppMessage(business, loc, businessType, userSettings.customTemplate || ''))
    }
  }, [business?.place_id, loc, businessType, userSettings.customTemplate])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendWhatsApp = () => {
    if (!business) return
    const url = buildWhatsAppUrl(business.phone, message)
    if (!url) return
    window.open(url, '_blank')
  }

  const hasPhone = business?.phone

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-gray-950">
      {/* Header */}
      <div className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-slate-100 dark:border-gray-800 flex items-center gap-2.5 flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">Mensaje de contacto</p>
          <p className="text-[11px] text-slate-400 leading-tight">Edita y envia por WhatsApp, email o redes</p>
        </div>
        {/* Close button — visible on mobile when business is selected */}
        {business && (
          <button
            onClick={() => setSelectedBusiness(null)}
            className="lg:hidden btn-ghost"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      {!business ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-slate-300 dark:text-gray-600" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Selecciona un negocio</p>
          <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-1">del listado para preparar el mensaje de contacto</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <BusinessSummary business={business} lighthouse={lighthouse} />

          {/* Editable message */}
          <div className="p-4">
            <label className="text-xs font-medium text-slate-500 dark:text-gray-400 mb-2 block">
              Mensaje para {business.name}
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl p-3 text-sm text-slate-700 dark:text-gray-300 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
              rows={8}
              placeholder="Escribe tu mensaje..."
            />

            {/* Contact buttons row */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {/* Email — left of WhatsApp */}
              {business.email && (
                <a href={`mailto:${business.email}?subject=${encodeURIComponent('Consulta sobre servicios digitales')}&body=${encodeURIComponent(message)}`}
                  title={business.email}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 border border-rose-200 dark:border-rose-800 transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </a>
              )}

              {/* Social DMs — left of WhatsApp */}
              {business.socials?.map(s => {
                const Icon = { instagram: Instagram, facebook: Facebook, twitter: Twitter, linkedin: Linkedin, youtube: Youtube, tiktok: Zap }[s.key] || ExternalLink
                const btnStyles = {
                  instagram: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/30 border-pink-200 dark:border-pink-800',
                  facebook: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800',
                  twitter: 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 border-sky-200 dark:border-sky-800',
                  linkedin: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800',
                  youtube: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800',
                  tiktok: 'bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700 border-slate-200 dark:border-gray-700',
                }
                const dmUrl = s.key === 'instagram' ? `https://ig.me/m/${s.handle}`
                  : s.key === 'facebook' ? `https://m.me/${s.handle}`
                  : s.key === 'twitter' ? `https://x.com/messages/compose?recipient_id=${s.handle}`
                  : s.url
                return (
                  <a key={s.key} href={dmUrl} target="_blank" rel="noopener noreferrer"
                    title={`@${s.handle}`}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2.5 rounded-xl border transition-colors ${btnStyles[s.key] || ''}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {s.label}
                  </a>
                )
              })}

              {/* WhatsApp */}
              <button
                onClick={handleSendWhatsApp}
                disabled={!hasPhone}
                title={hasPhone ? 'Enviar por WhatsApp' : 'Este negocio no tiene telefono'}
                className={`flex items-center gap-1.5 text-xs font-medium px-4 py-2.5 rounded-xl transition-colors ${
                  hasPhone
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-gray-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                WhatsApp
              </button>

              {/* Copy */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>

            {!hasPhone && !business.email && !business.socials?.length && (
              <p className="text-[11px] text-amber-500 mt-2 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                Sin contacto directo — usa el boton de copiar y pegalo manualmente
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
