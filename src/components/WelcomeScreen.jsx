import { useState } from 'react'
import { Zap, Search, BarChart3, MessageSquare, ArrowRight } from 'lucide-react'

const STEPS = [
  { icon: Search, title: 'Busca negocios', desc: 'Encuentra negocios locales por zona y rubro usando Google Maps' },
  { icon: BarChart3, title: 'Analiza su web', desc: 'Lighthouse analiza automaticamente la performance y SEO de cada sitio' },
  { icon: MessageSquare, title: 'Contactalos', desc: 'Genera mensajes de WhatsApp personalizados y haceles seguimiento' },
]

export default function WelcomeScreen() {
  const [visible, setVisible] = useState(() => !localStorage.getItem('ac_onboarded'))

  if (!visible) return null

  const handleStart = () => {
    localStorage.setItem('ac_onboarded', 'true')
    setVisible(false)
  }

  return (
    <div className="fixed inset-0 z-[200] bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center animate-fade-in">
        {/* Logo */}
        <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Zap className="w-8 h-8 text-white fill-white" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">
          Auto<span className="text-indigo-200">Clientes</span>
        </h1>
        <p className="text-indigo-200 text-sm mb-10">
          Encontra negocios que necesitan tu servicio web
        </p>

        {/* Steps */}
        <div className="space-y-4 mb-10">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-start gap-4 text-left bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <step.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{step.title}</p>
                <p className="text-xs text-indigo-200 mt-0.5">{step.desc}</p>
              </div>
              <span className="text-white/30 font-bold text-lg mt-1">{i + 1}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleStart}
          className="bg-white text-indigo-700 font-bold text-sm px-8 py-3 rounded-xl shadow-lg hover:bg-indigo-50 transition-colors flex items-center gap-2 mx-auto"
        >
          Empezar
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
