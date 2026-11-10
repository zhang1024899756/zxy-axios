import cookie from '../../src/helpers/cookie'
import { installDom, uninstallDom } from '../__helpers__/env'

describe('helpers::cookie', () => {
  let dom: { cookie: string }

  beforeEach(() => {
    dom = installDom('http://localhost/', 'a=1; XSRF-TOKEN=token-123')
  })

  afterEach(() => {
    uninstallDom()
  })

  test('reads a cookie value by name', () => {
    expect(cookie.read('XSRF-TOKEN')).toBe('token-123')
    expect(cookie.read('a')).toBe('1')
  })

  test('returns null for a missing cookie', () => {
    expect(cookie.read('missing')).toBeNull()
  })

  test('decodes url-encoded values', () => {
    dom.cookie = 'token=a%20b'
    expect(cookie.read('token')).toBe('a b')
  })

  test('does not confuse a cookie with one that ends in the same name', () => {
    dom.cookie = 'OTHER-XSRF-TOKEN=bad; XSRF-TOKEN=good'
    expect(cookie.read('XSRF-TOKEN')).toBe('good')
  })
})
