import { describe, it, expect } from 'vitest'
import { formatPhoneForWhatsApp, buildWhatsAppUrl } from '../utils/phoneUtils'

describe('formatPhoneForWhatsApp', () => {
  it('formats international number with +', () => {
    expect(formatPhoneForWhatsApp('+54 9 11 5555-1234')).toBe('5491155551234')
  })

  it('formats international number without +', () => {
    expect(formatPhoneForWhatsApp('5491155551234')).toBe('5491155551234')
  })

  it('handles Argentine mobile with leading 0', () => {
    expect(formatPhoneForWhatsApp('+54 011 5555-1234')).toBe('5491155551234')
  })

  it('adds 9 for Argentine mobile numbers without it', () => {
    expect(formatPhoneForWhatsApp('+54 11 5555-1234')).toBe('5491155551234')
  })

  it('handles Spanish international number', () => {
    expect(formatPhoneForWhatsApp('+34 912 345 678')).toBe('34912345678')
  })

  it('handles local number without country code', () => {
    const result = formatPhoneForWhatsApp('01155551234')
    expect(result).toBeTruthy()
    expect(result).toMatch(/^\d+$/)
  })

  it('returns empty for null input', () => {
    expect(formatPhoneForWhatsApp(null)).toBe('')
  })

  it('returns empty for undefined input', () => {
    expect(formatPhoneForWhatsApp(undefined)).toBe('')
  })

  it('returns empty for empty string', () => {
    expect(formatPhoneForWhatsApp('')).toBe('')
  })

  it('handles Mexican number', () => {
    expect(formatPhoneForWhatsApp('+52 55 1234 5678')).toBe('525512345678')
  })

  it('strips all non-digit characters except leading +', () => {
    expect(formatPhoneForWhatsApp('+54 (011) 5555-1234')).toBe('5491155551234')
  })
})

describe('buildWhatsAppUrl', () => {
  it('builds basic URL with phone number', () => {
    const url = buildWhatsAppUrl('+5491155551234')
    expect(url).toBe('https://wa.me/5491155551234')
  })

  it('builds URL with message', () => {
    const url = buildWhatsAppUrl('+5491155551234', 'Hola!')
    expect(url).toContain('https://wa.me/5491155551234')
    expect(url).toContain('?text=')
    expect(url).toContain(encodeURIComponent('Hola!'))
  })

  it('returns empty string for null phone', () => {
    expect(buildWhatsAppUrl(null)).toBe('')
  })

  it('returns empty string for empty phone', () => {
    expect(buildWhatsAppUrl('')).toBe('')
  })
})