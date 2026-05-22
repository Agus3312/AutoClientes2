import { describe, it, expect } from 'vitest'
import { detectSaasFromAudits, getScoreColor, getScoreLabel } from '../utils/lighthouseApi'

describe('detectSaasFromAudits', () => {
  it('detects Shopify from network requests', () => {
    const audits = {
      'network-requests': {
        details: {
          items: [
            { url: 'https://cdn.shopify.com/some-script.js' },
          ]
        }
      }
    }
    const result = detectSaasFromAudits(audits)
    expect(result).toContainEqual(expect.objectContaining({ name: 'Shopify' }))
  })

  it('detects multiple SaaS tools', () => {
    const audits = {
      'network-requests': {
        details: {
          items: [
            { url: 'https://cdn.shopify.com/script.js' },
            { url: 'https://connect.facebook.net/en_US/fbevents.js' },
          ]
        }
      }
    }
    const result = detectSaasFromAudits(audits)
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result).toContainEqual(expect.objectContaining({ name: 'Shopify' }))
    expect(result).toContainEqual(expect.objectContaining({ name: 'Facebook Pixel' }))
  })

  it('detects from third-party-summary entity field', () => {
    const audits = {
      'third-party-summary': {
        details: {
          items: [
            { entity: 'Calendly' },
          ]
        }
      }
    }
    const result = detectSaasFromAudits(audits)
    expect(result).toContainEqual(expect.objectContaining({ name: 'Calendly' }))
  })

  it('does not duplicate same tool', () => {
    const audits = {
      'network-requests': {
        details: {
          items: [
            { url: 'https://cdn.shopify.com/a.js' },
            { url: 'https://cdn.shopify.com/b.js' },
          ]
        }
      }
    }
    const result = detectSaasFromAudits(audits)
    const shopifyCount = result.filter(r => r.name === 'Shopify').length
    expect(shopifyCount).toBe(1)
  })

  it('returns empty array for null audits', () => {
    expect(detectSaasFromAudits(null)).toEqual([])
  })

  it('returns empty array for undefined audits', () => {
    expect(detectSaasFromAudits(undefined)).toEqual([])
  })

  it('detects Google Analytics and Facebook Pixel from network requests', () => {
    const audits = {
      'network-requests': {
        details: {
          items: [
            { url: 'https://www.googletagmanager.com/gtag/js?id=UA-123' },
            { url: 'https://connect.facebook.net/en_US/fbevents.js' },
          ]
        }
      }
    }
    const result = detectSaasFromAudits(audits)
    expect(result).toContainEqual(expect.objectContaining({ name: 'Google Analytics' }))
    expect(result).toContainEqual(expect.objectContaining({ name: 'Facebook Pixel' }))
  })
})

describe('getScoreColor', () => {
  it('returns green for 90+', () => {
    expect(getScoreColor(90)).toBe('green')
    expect(getScoreColor(100)).toBe('green')
  })

  it('returns yellow for 50-89', () => {
    expect(getScoreColor(50)).toBe('yellow')
    expect(getScoreColor(89)).toBe('yellow')
  })

  it('returns red for below 50', () => {
    expect(getScoreColor(49)).toBe('red')
    expect(getScoreColor(0)).toBe('red')
  })
})

describe('getScoreLabel', () => {
  it('returns Excelente for 90+', () => {
    expect(getScoreLabel(90)).toBe('Excelente')
    expect(getScoreLabel(100)).toBe('Excelente')
  })

  it('returns Mejorable for 50-89', () => {
    expect(getScoreLabel(50)).toBe('Mejorable')
    expect(getScoreLabel(89)).toBe('Mejorable')
  })

  it('returns Deficiente for below 50', () => {
    expect(getScoreLabel(49)).toBe('Deficiente')
    expect(getScoreLabel(0)).toBe('Deficiente')
  })
})