import defaults from '../src/defaults'

describe('defaults', () => {
  test('uses GET without a timeout', () => {
    expect(defaults.method).toBe('get')
    expect(defaults.timeout).toBe(0)
  })

  test('accepts only 2xx statuses', () => {
    const validateStatus = defaults.validateStatus!

    expect(validateStatus(200)).toBe(true)
    expect(validateStatus(204)).toBe(true)
    expect(validateStatus(199)).toBe(false)
    expect(validateStatus(300)).toBe(false)
    expect(validateStatus(500)).toBe(false)
  })

  test('ships JSON transform pipelines', () => {
    expect(Array.isArray(defaults.transformRequest)).toBe(true)
    expect(Array.isArray(defaults.transformResponse)).toBe(true)
  })

  test('sets a form Content-Type for methods with a body only', () => {
    expect(defaults.headers!.post['Content-Type']).toBe('application/x-www-form-urlencoded')
    expect(defaults.headers!.get).toEqual({})
    expect(defaults.headers!.common.Accept).toBe('application/json, text/plain, */*')
  })

  test('the default transformers serialise requests and parse responses', () => {
    const headers: any = {}
    const transformRequest = (defaults.transformRequest as any)[0]
    expect(transformRequest({ a: 1 }, headers)).toBe('{"a":1}')
    expect(headers['Content-Type']).toBe('application/json;charset=utf-8')

    const transformResponse = (defaults.transformResponse as any)[0]
    expect(transformResponse('{"a":1}')).toEqual({ a: 1 })
    expect(transformResponse('plain')).toBe('plain')
  })

  test('declares the XSRF cookie and header names', () => {
    expect(defaults.xsrfCookieName).toBe('XSRF-TOKEN')
    expect(defaults.xsrfHeaderName).toBe('X-XSRF-TOKEN')
  })
})
