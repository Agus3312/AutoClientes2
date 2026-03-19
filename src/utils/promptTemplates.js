/**
 * Generador de mensajes de WhatsApp dinámicos orientados a venta de SaaS.
 */

// Map of business types → SaaS opportunities
const BUSINESS_TYPES = {
  gym: {
    label: 'gimnasio',
    saas: 'sistema que organiza socios, cobra cuotas automaticamente y envia rutinas por app',
    pain: 'tener todo anotado en planillas, perseguir a los que deben cuotas y no saber cuantos socios activos tienen realmente',
  },
  restaurant: {
    label: 'restaurante',
    saas: 'sistema que organiza pedidos, mesas y delivery desde un solo lugar con menu digital QR',
    pain: 'tener pedidos por WhatsApp mezclados con los del local, perder comandas y no saber que se vendio en el dia',
  },
  cafe: {
    label: 'cafeteria',
    saas: 'sistema de pedidos con QR, programa de fidelidad digital y control de stock',
    pain: 'anotar pedidos a mano, no saber que clientes vuelven y quedarse sin stock sin darse cuenta',
  },
  bakery: {
    label: 'panaderia',
    saas: 'sistema de pedidos anticipados, catalogo digital y control de produccion diaria',
    pain: 'recibir pedidos por WhatsApp sin orden, producir de mas o de menos y no tener registro de nada',
  },
  dentist: {
    label: 'consultorio dental',
    saas: 'sistema de turnos online, recordatorios automaticos por WhatsApp y ficha digital de pacientes',
    pain: 'atender el telefono todo el dia para dar turnos, que los pacientes falten sin avisar y buscar fichas en carpetas',
  },
  doctor: {
    label: 'consultorio',
    saas: 'sistema de turnos online, historia clinica digital y recordatorios automaticos',
    pain: 'pasar mas tiempo organizando turnos por telefono que atendiendo pacientes, y tener todo en papel',
  },
  lawyer: {
    label: 'estudio juridico',
    saas: 'sistema de gestion de casos, portal de clientes y facturacion automatica',
    pain: 'perder el hilo de los expedientes, que los clientes llamen preguntando como va su caso y facturar a mano',
  },
  accounting: {
    label: 'estudio contable',
    saas: 'portal de clientes para subir documentos, alertas de vencimientos y facturacion automatizada',
    pain: 'recibir fotos de facturas por WhatsApp, buscar documentos entre miles de mensajes y olvidar vencimientos',
  },
  beauty_salon: {
    label: 'salon de belleza',
    saas: 'sistema de reservas online 24/7, recordatorios automaticos y gestion de agenda del equipo',
    pain: 'tener la agenda en papel, que la gente cancele a ultimo momento y perder turnos que podrian haber dado a otro',
  },
  hair_care: {
    label: 'peluqueria',
    saas: 'sistema de turnos online, recordatorios por WhatsApp y historial de servicios por cliente',
    pain: 'no saber que turnos tienen libres sin revisar la agenda, contestar WhatsApp todo el dia y que se pisen los horarios',
  },
  spa: {
    label: 'spa',
    saas: 'sistema de reserva de tratamientos, paquetes digitales, gift cards online y gestion de salas',
    pain: 'coordinar salas y profesionales a mano, no llevar control de paquetes vendidos y perder reservas por no contestar rapido',
  },
  car_repair: {
    label: 'taller mecanico',
    saas: 'sistema de turnos, seguimiento de reparaciones en tiempo real y presupuestos digitales',
    pain: 'que los clientes llamen 10 veces preguntando si ya esta listo, no tener registro de que se le hizo a cada auto y armar presupuestos a mano',
  },
  car_dealer: {
    label: 'concesionaria',
    saas: 'CRM automotor, cotizador online y seguimiento automatico de leads',
    pain: 'que les escriban interesados y se olviden de hacerles seguimiento, perder ventas por desorganizacion',
  },
  real_estate_agency: {
    label: 'inmobiliaria',
    saas: 'CRM inmobiliario, publicacion automatica en portales y matching de propiedades con clientes',
    pain: 'publicar la misma propiedad en 5 portales a mano, no saber que cliente busca que y perder consultas',
  },
  store: {
    label: 'tienda',
    saas: 'sistema de inventario, punto de venta digital y tienda online integrada',
    pain: 'no saber que tienen en stock hasta que lo buscan, anotar ventas en cuaderno y no tener numeros claros del negocio',
  },
  clothing_store: {
    label: 'tienda de ropa',
    saas: 'catalogo digital, control de stock por talle/color y tienda online con envios',
    pain: 'subir todo a Instagram uno por uno, que pregunten por un talle y no saber si queda, y perder ventas por no poder vender directo',
  },
  electronics_store: {
    label: 'tienda de electronica',
    saas: 'sistema de ventas con control de garantias, stock y reparaciones',
    pain: 'no tener registro de garantias, que el cliente venga con un ticket de hace 6 meses y no encontrar nada',
  },
  pet_store: {
    label: 'pet shop',
    saas: 'tienda online, turnos de peluqueria canina y recordatorios automaticos de vacunas',
    pain: 'no poder avisarle a los clientes cuando les toca la proxima vacuna o desparasitacion de su mascota, y perder esas ventas',
  },
  veterinary_care: {
    label: 'veterinaria',
    saas: 'sistema de turnos, historial clinico digital de mascotas y recordatorios de vacunas automaticos',
    pain: 'buscar la ficha de cada mascota entre carpetas, que los dueños no se acuerden las vacunas y gestionar turnos por telefono todo el dia',
  },
  school: {
    label: 'institucion educativa',
    saas: 'plataforma de gestion academica, comunicacion con padres y cobro de cuotas online',
    pain: 'que los grupos de WhatsApp con padres sean un caos, perseguir morosos uno por uno y no tener un canal de comunicacion ordenado',
  },
  lodging: {
    label: 'alojamiento',
    saas: 'motor de reservas directo, channel manager y check-in digital',
    pain: 'actualizar disponibilidad en cada plataforma a mano, tener reservas en Booking y en WhatsApp sin cruzar y que se pisen',
  },
  pharmacy: {
    label: 'farmacia',
    saas: 'sistema de gestion de stock, pedidos online y recordatorios de medicacion para clientes',
    pain: 'enterarse que un producto se agoto cuando el cliente lo pide, no controlar vencimientos y perder ventas recurrentes',
  },
  insurance_agency: {
    label: 'aseguradora',
    saas: 'CRM de polizas, cotizador online automatico y alertas de renovacion',
    pain: 'enterarse que una poliza vencio porque el cliente llamo enojado, y no tener un sistema que avise antes',
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

  return `Buenas! Estuve viendo lo que hacen y me pareció muy interesante. Me dedico a desarrollar páginas web y también herramientas para organizar y mejorar procesos en negocios. Si en algún momento quieren potenciar eso, puedo darles una mano 🙂`
}
