import { transformRequest, transformResponse } from '../../src/helpers/data'

describe('helpers::data', () => {
  describe('transformRequest', () => {
    test('serialises plain objects to JSON strings', () => {
      expect(transformRequest({ a: 1, b: 'x' })).toBe('{"a":1,"b":"x"}')
    })

    test('leaves strings untouched', () => {
      // Regression guard: strings used to be JSON-stringified into "\"abc\"".
      expect(transformRequest('a=1&b=2')).toBe('a=1&b=2')
    })

    test('leaves FormData and other non-plain values untouched', () => {
      if (typeof FormData !== 'undefined') {
        const form = new FormData()
        expect(transformRequest(form)).toBe(form)
      }
      expect(transformRequest(null)).toBeNull()
      expect(transformRequest(undefined)).toBeUndefined()
      expect(transformRequest(1)).toBe(1)
    })
  })

  describe('transformResponse', () => {
    test('parses a JSON string', () => {
      expect(transformResponse('{"a":1}')).toEqual({ a: 1 })
    })

    test('leaves invalid JSON untouched', () => {
      expect(transformResponse('not json')).toBe('not json')
    })

    test('passes non-string payloads through', () => {
      const blob = { fake: 'blob' }
      expect(transformResponse(blob)).toBe(blob)
      expect(transformResponse(undefined)).toBeUndefined()
    })
  })
})
