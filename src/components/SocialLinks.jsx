import { Mail, Globe, Instagram, Facebook, Twitter, Linkedin, Youtube, Zap } from 'lucide-react'

export const SOCIAL_ICONS = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: Zap,
}

export const SOCIAL_STYLES = {
  instagram: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/30',
  facebook: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30',
  twitter: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/30',
  linkedin: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30',
  youtube: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30',
  tiktok: 'text-slate-800 dark:text-slate-300 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700',
}

export const SOCIAL_BTN_STYLES = {
  instagram: 'text-pink-500 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20',
  facebook: 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20',
  twitter: 'text-sky-500 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20',
  linkedin: 'text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20',
  youtube: 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
  tiktok: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-800',
}

export function SocialChips({ socials, email }) {
  if (!email && !socials?.length) return null
  return (
    <div className="flex gap-1 mt-1.5 flex-wrap" onClick={e => e.stopPropagation()}>
      {email && (
        <a href={`mailto:${email}`} title={email}
          className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded-full hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors">
          <Mail className="w-2.5 h-2.5" />Email
        </a>
      )}
      {socials?.map(s => {
        const Icon = SOCIAL_ICONS[s.key] || Globe
        return (
          <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" title={`${s.label}: @${s.handle}`}
            className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full transition-colors ${SOCIAL_STYLES[s.key] || 'text-slate-600 bg-slate-50 dark:text-gray-400 dark:bg-gray-800'}`}>
            <Icon className="w-2.5 h-2.5" />{s.label}
          </a>
        )
      })}
    </div>
  )
}

export function SocialActionButtons({ socials, email }) {
  return (
    <>
      {email && (
        <a
          href={`mailto:${email}`}
          onClick={e => e.stopPropagation()}
          title={`Email: ${email}`}
          className="btn-ghost text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
        >
          <Mail className="w-3.5 h-3.5" />
        </a>
      )}
      {socials?.map(s => {
        const Icon = SOCIAL_ICONS[s.key] || Globe
        const colorClass = SOCIAL_BTN_STYLES[s.key] || ''
        return (
          <a
            key={s.key}
            href={s.key === 'instagram' ? `https://ig.me/m/${s.handle}` : s.key === 'facebook' ? `https://m.me/${s.handle}` : s.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            title={`${s.label}: @${s.handle}`}
            className={`btn-ghost ${colorClass}`}
          >
            <Icon className="w-3.5 h-3.5" />
          </a>
        )
      })}
    </>
  )
}