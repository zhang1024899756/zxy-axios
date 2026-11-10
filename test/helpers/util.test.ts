import {
  isDate,
  isObject,
  isPlainObject,
  extend,
  deepMerge,
  isFormData,
  isURLSearchParams
} from '../../src/helpers/util'

describe('helpers::util', () => {
  describe('isDate', () => {
    test('recognises Date instances', () => {
      expect(isDate(new Date())).toBe(true)
    })

    test('rejects everything else', () => {
      expect(isDate(Date.now())).toBe(false)
      expect(isDate('2020-01-01')).toBe(false)
      expect(isDate(null)).toBe(false)
      expect(isDate(undefined)).toBe(false)
    })
  })

  describe('isObject', () => {
    test('only accepts plain objects', () => {
      expect(isObject({})).toBe(true)
      expect(isObject(new Date())).toBe(false)
      expect(isObject([])).toBe(false)
      expect(isObject('abc')).toBe(false)
      expect(isObject(null)).toBe(false)
    })
  })

  describe('isPlainObject', () => {
    test('accepts plain objects, including null-prototype objects', () => {
      expect(isPlainObject({})).toBe(true)
      expect(isPlainObject({ a: 1 })).toBe(true)
      expect(isPlainObject(Object.create(null))).toBe(true)
      // 基于 Object.prototype.toString 判定，class 实例同样是 [object Object]
      expect(isPlainObject(new (class Foo {})())).toBe(true)
    })

    test('rejects arrays and dates', () => {
      expect(isPlainObject([])).toBe(false)
      expect(isPlainObject(new Date())).toBe(false)
    })

    test('rejects strings and other primitives', () => {
      // Regression guard: strings used to be reported as plain objects, which made
      // buildURL()/transformRequest() JSON-stringify them ("abc" -> "\"abc\"").
      expect(isPlainObject('abc')).toBe(false)
      expect(isPlainObject('')).toBe(false)
      expect(isPlainObject(1)).toBe(false)
      expect(isPlainObject(true)).toBe(false)
      expect(isPlainObject(null)).toBe(false)
      expect(isPlainObject(undefined)).toBe(false)
    })
  })

  describe('extend', () => {
    test('copies own and inherited enumerable properties onto the target', () => {
      const from: any = Object.create({ inherited: 1 })
      from.own = 2

      const to: any = { a: 1 }
      const result = extend(to, from)

      expect(result).toBe(to)
      expect(result.a).toBe(1)
      expect(result.own).toBe(2)
      expect(result.inherited).toBe(1)
    })
  })

  describe('deepMerge', () => {
    test('merges nested plain objects without mutating the inputs', () => {
      const config1 = { headers: { common: { Accept: 'application/json' } }, timeout: 100 }
      const config2 = { headers: { common: { 'X-Token': 'abc' }, get: { 'X-Get': '1' } }, url: '/x' }

      const merged: any = deepMerge(config1, config2)

      expect(merged.timeout).toBe(100)
      expect(merged.url).toBe('/x')
      expect(merged.headers.common).toEqual({ Accept: 'application/json', 'X-Token': 'abc' })
      expect(merged.headers.get).toEqual({ 'X-Get': '1' })
      expect(config1.headers.common).toEqual({ Accept: 'application/json' })
    })

    test('later arguments win for primitives, arrays and non-plain objects', () => {
      const arr = [1, 2]
      const merged: any = deepMerge({ a: 1, list: [9], date: new Date(0) } as any, {
        a: 2,
        list: arr,
        date: new Date(1)
      } as any)

      expect(merged.a).toBe(2)
      expect(merged.list).toBe(arr)
    })

    test('ignores falsy arguments', () => {
      const merged = deepMerge(null as any, undefined as any, { a: 1 } as any)
      expect(merged).toEqual({ a: 1 })
    })

    test('returns an object with no prototype', () => {
      const merged = deepMerge({ a: 1 })
      expect(Object.getPrototypeOf(merged)).toBe(null)
    })
  })

  describe('isFormData', () => {
    test('recognises FormData instances', () => {
      if (typeof FormData === 'undefined') {
        return
      }
      expect(isFormData(new FormData())).toBe(true)
      expect(isFormData({})).toBe(false)
      expect(isFormData('a=1')).toBe(false)
    })

    test('handles undefined input', () => {
      expect(isFormData(undefined)).toBe(false)
    })
  })

  describe('isURLSearchParams', () => {
    test('recognises URLSearchParams instances', () => {
      expect(isURLSearchParams(new URLSearchParams('a=1'))).toBe(true)
      expect(isURLSearchParams({})).toBe(false)
      expect(isURLSearchParams('a=1')).toBe(false)
    })
  })
})
