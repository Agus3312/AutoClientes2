import { describe, it, expect } from 'vitest'
import { extractContactInfo } from '../utils/socialExtractor'

describe('extractContactInfo', () => {
  it('extracts email from mailto link', () => {
    const html = '<a href="mailto:info@restaurant.com">Contact us</a>'
    const result = extractContactInfo(html)
    expect(result.email).toBe('info@restaurant.com')
  })

  it('extracts email from plain text when no mailto', () => {
    const html = '<p>Contact: hello@gym.com.ar for info</p>'
    const result = extractContactInfo(html)
    expect(result.email).toBe('hello@gym.com.ar')
  })

  it('filters out asset-like emails (.png, .woff)', () => {
    const html = '<link href="fonts/icon.woff2" /> <p>real@business.com</p>'
    const result = extractContactInfo(html)
    expect(result.email).toBe('real@business.com')
  })

  it('extracts Instagram profile', () => {
    const html = '<a href="https://www.instagram.com/mi_negocio/">IG</a>'
    const result = extractContactInfo(html)
    expect(result.socials).toContainEqual(
      expect.objectContaining({ key: 'instagram', handle: 'mi_negocio' })
    )
  })

  it('extracts Facebook page', () => {
    const html = '<a href="https://www.facebook.com/mi.negocio/">FB</a>'
    const result = extractContactInfo(html)
    expect(result.socials).toContainEqual(
      expect.objectContaining({ key: 'facebook', handle: 'mi.negocio' })
    )
  })

  it('extracts multiple social networks', () => {
    const html = `
      <a href="https://www.instagram.com/mi_negocio/">IG</a>
      <a href="https://www.facebook.com/mi.negocio/">FB</a>
      <a href="https://x.com/mi_negocio">X</a>
    `
    const result = extractContactInfo(html)
    expect(result.socials.length).toBeGreaterThanOrEqual(3)
    const keys = result.socials.map(s => s.key)
    expect(keys).toContain('instagram')
    expect(keys).toContain('facebook')
    expect(keys).toContain('twitter')
  })

  it('ignores generic social handles (share, login, etc)', () => {
    const html = `
      <a href="https://www.facebook.com/sharer/"></a>
      <a href="https://www.instagram.com/explore/"></a>
      <a href="https://x.com/login"></a>
    `
    const result = extractContactInfo(html)
    expect(result.socials).toHaveLength(0)
  })

  it('extracts LinkedIn company page', () => {
    const html = '<a href="https://www.linkedin.com/company/acme-corp/">Jobs</a>'
    const result = extractContactInfo(html)
    expect(result.socials).toContainEqual(
      expect.objectContaining({ key: 'linkedin', handle: 'acme-corp' })
    )
  })

  it('returns empty results for null/undefined html', () => {
    expect(extractContactInfo(null).email).toBeNull()
    expect(extractContactInfo(null).socials).toHaveLength(0)
    expect(extractContactInfo(undefined).email).toBeNull()
  })

  it('returns empty results for empty string', () => {
    const result = extractContactInfo('')
    expect(result.email).toBeNull()
    expect(result.socials).toHaveLength(0)
  })

  it('only returns first match per social network', () => {
    const html = `
      <a href="https://www.instagram.com/negocio1/"></a>
      <a href="https://www.instagram.com/negocio2/"></a>
    `
    const result = extractContactInfo(html)
    const igSocials = result.socials.filter(s => s.key === 'instagram')
    expect(igSocials).toHaveLength(1)
    expect(igSocials[0].handle).toBe('negocio1')
  })
})