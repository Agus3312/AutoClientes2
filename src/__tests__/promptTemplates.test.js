import { describe, it, expect } from 'vitest'
import { generateWhatsAppMessage } from '../utils/promptTemplates'

describe('generateWhatsAppMessage', () => {
  const baseBusiness = {
    name: 'Dr. Martinez',
    vicinity: 'Córdoba, Argentina',
    rating: 4.5,
    user_ratings_total: 120,
  }

  it('generates personalized message for dentist via searchType', () => {
    const msg = generateWhatsAppMessage(baseBusiness, 'Córdoba', 'dentista')
    expect(msg).toContain('Dr. Martinez')
    expect(msg).toContain('consultorio dental')
    expect(msg).toContain('turnos online')
    expect(msg).not.toContain('restaurante')
  })

  it('generates personalized message for gym', () => {
    const msg = generateWhatsAppMessage(baseBusiness, 'Buenos Aires', 'gimnasio')
    expect(msg).toContain('gimnasio')
    expect(msg).toContain('socios')
    expect(msg).not.toContain('restaurante')
  })

  it('generates personalized message for restaurant', () => {
    const msg = generateWhatsAppMessage(baseBusiness, 'Madrid', 'restaurante')
    expect(msg).toContain('restaurante')
    expect(msg).toContain('pedidos')
  })

  it('generates personalized message for veterinary', () => {
    const msg = generateWhatsAppMessage(baseBusiness, 'Barcelona', 'veterinaria')
    expect(msg).toContain('veterinaria')
    expect(msg).toContain('turnos')
    expect(msg).not.toContain('restaurante')
  })

  it('falls back to generic message when type not recognized', () => {
    const msg = generateWhatsAppMessage(baseBusiness, 'Sevilla', 'astrologo')
    expect(msg).toContain('Dr. Martinez')
    expect(msg).toContain('herramientas digitales')
    expect(msg).toContain('perder tiempo en tareas manuales')
  })

  it('matches business type via name when searchType empty', () => {
    const business = { ...baseBusiness, name: 'Peluqueria Estilo' }
    const msg = generateWhatsAppMessage(business, 'Sevilla', '')
    expect(msg).toContain('peluqueria')
    expect(msg).toContain('turnos online')
  })

  it('matches business type via Google Maps types array', () => {
    const business = { ...baseBusiness, types: ['veterinary_care'] }
    const msg = generateWhatsAppMessage(business, 'Lima', '')
    expect(msg).toContain('veterinaria')
  })

  it('handles Spanish accented chars in searchType', () => {
    const msg = generateWhatsAppMessage(baseBusiness, 'México', 'peluquería')
    expect(msg).toContain('peluqueria')
  })

  it('handles Spanish accented chars in business name', () => {
    const business = { ...baseBusiness, name: 'Cafetería del Centro' }
    const msg = generateWhatsAppMessage(business, 'Bogotá', 'cafetería')
    expect(msg).toContain('cafeteria')
    expect(msg).toContain('QR')
  })

  it('uses custom template with placeholder replacement', () => {
    const template = 'Hola {nombre}, te ofrezco {saas} para {rubro}. Problema: {dolor}.'
    const msg = generateWhatsAppMessage(baseBusiness, 'Córdoba', 'dentista', template)
    expect(msg).toBe('Hola Dr. Martinez, te ofrezco sistema de turnos online, recordatorios automaticos por WhatsApp y ficha digital de pacientes para consultorio dental. Problema: atender el telefono todo el dia para dar turnos, que los pacientes falten sin avisar y buscar fichas en carpetas.')
  })

  it('custom template falls back to defaults for unknown type', () => {
    const template = 'Hola {nombre}, rubro: {rubro}, saas: {saas}, dolor: {dolor}.'
    const msg = generateWhatsAppMessage(baseBusiness, 'Sevilla', 'astrologo', template)
    expect(msg).toContain('Hola Dr. Martinez')
    expect(msg).toContain('rubro: negocio')
    expect(msg).toContain('herramientas digitales')
  })
})