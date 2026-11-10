import { processHeaders, parseHeaders, flattenHeaders } from '../../src/helpers/headers'

describe('helpers::headers', () => {
  describe('processHeaders', () => {
    test('normalises the casing of Content-Type', () => {
      const headers = processHeaders({ 'content-type': 'text/plain' }, 'body')
      expect(headers['Content-Type']).toBe('text/plain')
      expect(headers['content-type']).toBeUndefined()
    })

    test('adds a JSON Content-Type for plain object payloads', () => {
      const headers = processHeaders({} as any, { a: 1 })
      expect(headers['Content-Type']).toBe('application/json;charset=utf-8')
    })

    test('does not override an existing Content-Type', () => {
      const headers = processHeaders({ 'Content-Type': 'text/plain' }, { a: 1 })
      expect(headers['Content-Type']).toBe('text/plain')
    })

    test('does not add a JSON Content-Type for strings', () => {
      // Regression guard: a string body used to be treated as a JSON payload.
      const headers = processHeaders({} as any, 'a=1')
      expect(headers['Content-Type']).toBeUndefined()
    })

    test('returns the headers untouched when they are missing', () => {
      expect(processHeaders(undefined, { a: 1 })).toBeUndefined()
    })
  })

  describe('parseHeaders', () => {
    test('parses a raw header block into lower-cased keys', () => {
      const parsed = parseHeaders('Content-Type: application/json\r\nX-Custom: 1')
      expect(parsed).toEqual({ 'content-type': 'application/json', 'x-custom': '1' })
    })

    test('keeps colons that appear inside a header value', () => {
      // Regression guard: splitting on every ":" truncated values such as URLs.
      const parsed = parseHeaders('location: http://example.com/a:b\r\n')
      expect(parsed.location).toBe('http://example.com/a:b')
    })

    test('returns an empty object for an empty header block', () => {
      expect(parseHeaders('')).toEqual({})
    })

    test('ignores blank lines', () => {
      const parsed = parseHeaders('a: 1\r\n\r\nb: 2')
      expect(parsed).toEqual({ a: '1', b: '2' })
    })
  })

  describe('flattenHeaders', () => {
    test('merges common, method and one-off headers into a flat object', () => {
      const headers = {
        common: { Accept: 'application/json' },
        get: { 'X-Get': '1' },
        'X-Custom': '2'
      }

      expect(flattenHeaders(headers, 'get')).toEqual({
        Accept: 'application/json',
        'X-Get': '1',
        'X-Custom': '2'
      })
    })

    test('returns the input untouched when headers are missing', () => {
      expect(flattenHeaders(undefined, 'get')).toBeUndefined()
    })
  })
})
