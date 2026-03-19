/**
 * Generador de mensajes de WhatsApp dinámicos orientados a venta de SaaS.
 */

// Map of business types → SaaS opportunities
const BUSINESS_TYPES = {
  gym: {
    label: 'gimnasio',
    saas: 'sistema de gestion de socios, cobro automatico de cuotas y rutinas personalizadas por app',
    pain: 'gestionar socios y cobros manualmente',
  },
  restaurant: {
    label: 'restaurante',
    saas: 'sistema de pedidos online, menu digital con QR, y gestion de delivery propio',
    pain: 'depender de apps de delivery que cobran comisiones altas',
  },
  cafe: {
    label: 'cafeteria',
    saas: 'sistema de pedidos con QR, programa de fidelidad digital y gestion de stock',
    pain: 'perder clientes recurrentes por no tener un programa de fidelidad',
  },
  bakery: {
    label: 'panaderia',
    saas: 'sistema de pedidos anticipados, catalogo digital y gestion de produccion diaria',
    pain: 'perder ventas por no aceptar pedidos anticipados',
  },
  dentist: {
    label: 'consultorio dental',
    saas: 'sistema de turnos online, recordatorios automaticos por WhatsApp y ficha digital de pacientes',
    pain: 'perder tiempo con llamadas para agendar turnos y pacientes que no asisten',
  },
  doctor: {
    label: 'consultorio',
    saas: 'sistema de turnos online, historia clinica digital y recordatorios automaticos',
    pain: 'gestionar turnos por telefono y tener carpetas fisicas de pacientes',
  },
  lawyer: {
    label: 'estudio juridico',
    saas: 'sistema de gestion de casos, portal de clientes y facturacion automatica',
    pain: 'hacer seguimiento manual de expedientes y perder tiempo en tareas administrativas',
  },
  accounting: {
    label: 'estudio contable',
    saas: 'portal de clientes para subir documentos, alertas de vencimientos y facturacion automatizada',
    pain: 'recibir documentos por WhatsApp y perder tiempo organizandolos',
  },
  beauty_salon: {
    label: 'salon de belleza',
    saas: 'sistema de reservas online 24/7, recordatorios automaticos y gestion de agenda del equipo',
    pain: 'perder reservas fuera de horario y tener cancelaciones de ultimo momento',
  },
  hair_care: {
    label: 'peluqueria',
    saas: 'sistema de turnos online, recordatorios por WhatsApp y historial de servicios por cliente',
    pain: 'gestionar la agenda manualmente y perder clientes por no tener turnos disponibles visibles',
  },
  spa: {
    label: 'spa',
    saas: 'sistema de reserva de tratamientos, paquetes digitales, gift cards online y gestion de salas',
    pain: 'no poder vender gift cards ni paquetes fuera del local',
  },
  car_repair: {
    label: 'taller mecanico',
    saas: 'sistema de turnos, seguimiento de reparaciones en tiempo real y presupuestos digitales',
    pain: 'que los clientes llamen constantemente preguntando si ya esta listo su auto',
  },
  car_dealer: {
    label: 'concesionaria',
    saas: 'CRM automotor, cotizador online y seguimiento automatico de leads',
    pain: 'perder leads por no hacer seguimiento a tiempo',
  },
  real_estate_agency: {
    label: 'inmobiliaria',
    saas: 'CRM inmobiliario, publicacion automatica en portales y matching de propiedades con clientes',
    pain: 'publicar manualmente en cada portal y perder leads',
  },
  store: {
    label: 'tienda',
    saas: 'sistema de inventario, punto de venta digital y tienda online integrada',
    pain: 'no saber que productos tienen en stock y perder ventas por no vender online',
  },
  clothing_store: {
    label: 'tienda de ropa',
    saas: 'catalogo digital, sistema de tallas inteligente y tienda online con envios',
    pain: 'mostrar productos solo por Instagram sin poder vender directo',
  },
  electronics_store: {
    label: 'tienda de electronica',
    saas: 'e-commerce con comparador de productos, gestion de garantias y sistema de reparaciones',
    pain: 'gestionar garantias y reparaciones en papel',
  },
  pet_store: {
    label: 'pet shop',
    saas: 'tienda online, turnos de peluqueria canina y recordatorios de vacunas/desparasitacion',
    pain: 'no poder recordarle a los clientes cuando les toca la proxima vacuna de su mascota',
  },
  veterinary_care: {
    label: 'veterinaria',
    saas: 'sistema de turnos, historial clinico digital de mascotas y recordatorios de vacunas automaticos',
    pain: 'gestionar fichas en papel y que los dueños olviden las vacunas',
  },
  school: {
    label: 'institucion educativa',
    saas: 'plataforma de gestion academica, comunicacion con padres y cobro de cuotas online',
    pain: 'comunicarse con los padres por grupos de WhatsApp desorganizados',
  },
  lodging: {
    label: 'alojamiento',
    saas: 'motor de reservas directo, channel manager y check-in digital',
    pain: 'pagar comisiones altas a Booking/Airbnb en cada reserva',
  },
  pharmacy: {
    label: 'farmacia',
    saas: 'sistema de gestion de stock, pedidos online y recordatorios de medicacion para clientes',
    pain: 'no saber que productos estan por vencer o agotarse',
  },
  insurance_agency: {
    label: 'aseguradora',
    saas: 'CRM de polizas, cotizador online automatico y alertas de renovacion',
    pain: 'perder renovaciones por no hacer seguimiento a tiempo',
  },
}

function detectBusinessType(business, searchType = '') {
  const search = searchType.toLowerCase()
  for (const [key, val] of Object.entries(BUSINESS_TYPES)) {
    if (search.includes(key) || search.includes(val.label)) return val
  }
  const types = business.types || []
  for (const t of types) {
    if (BUSINESS_TYPES[t]) return BUSINESS_TYPES[t]
  }
  const nameLower = (business.name || '').toLowerCase()
  for (const [, val] of Object.entries(BUSINESS_TYPES)) {
    if (nameLower.includes(val.label)) return val
  }
  return null
}

export function generateWhatsAppMessage(business, searchLocation = '', searchType = '', customTemplate = '') {
  // If user has a custom template, use it with placeholder replacement
  if (customTemplate) {
    const detected = detectBusinessType(business, searchType)
    return customTemplate
      .replace(/\{nombre\}/g, business.name || '')
      .replace(/\{rubro\}/g, detected?.label || 'negocio')
      .replace(/\{ubicacion\}/g, business.vicinity || searchLocation || '')
      .replace(/\{rating\}/g, business.rating || '')
      .replace(/\{resenas\}/g, business.user_ratings_total || '0')
      .replace(/\{saas\}/g, detected?.saas || 'herramientas digitales para gestionar mejor su negocio')
      .replace(/\{dolor\}/g, detected?.pain || 'perder tiempo en tareas manuales')
  }

  const detected = detectBusinessType(business, searchType)
  const label = detected?.label || 'negocio'
  const pain = detected?.pain || 'gestionar todo manualmente y perder tiempo en tareas que se pueden automatizar'
  const saas = detected?.saas || 'herramientas digitales que ayudan a automatizar y hacer crecer el negocio'

  let msg = `Buenas! Vi su ${label} en Google Maps y los contacto porque trabajo con negocios del rubro.\n`
  msg += `Muchos nos cuentan que el mayor problema es ${pain}.\n`
  msg += `Nosotros ofrecemos ${saas}.\n`
  msg += `Les interesaria que les muestre como funciona en 5 minutos? Sin compromiso.`

  return msg
}
