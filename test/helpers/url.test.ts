import { buildURL, isAbsoluteURL, combineURL, isURLSameOrigin } from '../../src/helpers/url'
import { installDom, uninstallDom } from '../__helpers__/env'

describe('helpers::url', () => {
  afterEach(() => {
    uninstallDom()
  })

  describe('buildURL', () => {
    test('returns the url untouched when there are no params', () => {
      expect(buildURL('/api/user')).toBe('/api/user')
      expect(buildURL('/api/user', undefined)).toBe('/api/user')
      expect(buildURL('/api/user', null)).toBe('/api/user')
    })

    test('serialises a plain object', () => {
      expect(buildURL('/api', { id: 1, name: 'zxy' })).toBe('/api?id=1&name=zxy')
    })

    test('skips null and undefined values', () => {
      expect(buildURL('/api', { a: null, b: undefined, c: 0, d: false })).toBe(
        '/api?c=0&d=false'
      )
    })

    test('serialises arrays with a [] suffix', () => {
      expect(buildURL('/api', { foo: ['bar', 'baz'] })).toBe('/api?foo[]=bar&foo[]=baz')
    })

    test('serialises Date values as ISO strings', () => {
      const date = new Date(Date.UTC(2019, 3, 1, 5, 55, 39, 30))
      expect(buildURL('/api', { date })).toBe('/api?date=2019-04-01T05:55:39.030Z')
    })

    test('serialises nested objects as JSON', () => {
      expect(buildURL('/api', { filter: { a: 1 } })).toBe('/api?filter=%7B%22a%22:1%7D')
    })

    test('does not JSON-stringify plain string params', () => {
      // Regression guard: isPlainObject() used to accept strings, so a string param
      // came out as the URL-encoded JSON literal %22abc%22 instead of abc.
      expect(buildURL('/api', { name: 'abc' })).toBe('/api?name=abc')
      expect(buildURL('/api', { name: 'a b' })).toBe('/api?name=a+b')
      expect(buildURL('/api', { name: 'a&b' })).toBe('/api?name=a%26b')
    })

    test('keeps reserved characters readable', () => {
      expect(buildURL('/api', { q: 'a@b:c$d,e' })).toBe('/api?q=a@b:c$d,e')
    })

    test('drops the hash fragment before appending params', () => {
      expect(buildURL('/api#section', { a: 1 })).toBe('/api?a=1')
    })

    test('appends with & when the url already has a query string', () => {
      expect(buildURL('/api?x=1', { y: 2 })).toBe('/api?x=1&y=2')
    })

    test('uses a custom paramsSerializer when provided', () => {
      const paramsSerializer = (params: any) => 'serialized=' + params.a
      expect(buildURL('/api', { a: 1 }, paramsSerializer)).toBe('/api?serialized=1')
    })

    test('supports URLSearchParams params', () => {
      expect(buildURL('/api', new URLSearchParams('a=1&b=2'))).toBe('/api?a=1&b=2')
    })
  })

  describe('isAbsoluteURL', () => {
    test('recognises absolute urls', () => {
      expect(isAbsoluteURL('http://example.com')).toBe(true)
      expect(isAbsoluteURL('https://example.com/a/b')).toBe(true)
      expect(isAbsoluteURL('//example.com/a')).toBe(true)
    })

    test('rejects relative urls', () => {
      expect(isAbsoluteURL('/api/user')).toBe(false)
      expect(isAbsoluteURL('api/user')).toBe(false)
    })
  })

  describe('combineURL', () => {
    test('joins a base url and a relative path, collapsing slashes', () => {
      expect(combineURL('http://example.com/api/', '/user')).toBe('http://example.com/api/user')
      expect(combineURL('http://example.com/api', 'user')).toBe('http://example.com/api/user')
      expect(combineURL('http://example.com/api///', '///user')).toBe(
        'http://example.com/api/user'
      )
    })

    test('returns the base url when there is no relative part', () => {
      expect(combineURL('http://example.com/api')).toBe('http://example.com/api')
    })
  })

  describe('isURLSameOrigin', () => {
    test('compares protocol and host with the current location', () => {
      installDom('http://localhost:3000/app')
      expect(isURLSameOrigin('http://localhost:3000/other')).toBe(true)
      expect(isURLSameOrigin('https://localhost:3000/other')).toBe(false)
      expect(isURLSameOrigin('http://example.com/other')).toBe(false)
    })

    test('returns false instead of throwing outside a browser', () => {
      uninstallDom()
      expect(isURLSameOrigin('http://example.com')).toBe(false)
    })
  })
})
