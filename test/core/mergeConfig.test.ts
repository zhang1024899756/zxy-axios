import mergeConfig from '../../src/core/mergeConfig'

describe('core::mergeConfig', () => {
  test('custom config wins over defaults', () => {
    const merged = mergeConfig({ timeout: 0, method: 'get' }, { timeout: 1000 })
    expect(merged.timeout).toBe(1000)
    expect(merged.method).toBe('get')
  })

  test('keeps defaults for keys missing from the custom config', () => {
    const merged = mergeConfig(
      { baseURL: 'http://example.com', headers: { common: { Accept: 'json' } } },
      { url: '/api' }
    )

    expect(merged.baseURL).toBe('http://example.com')
    expect(merged.url).toBe('/api')
    expect(merged.headers).toEqual({ common: { Accept: 'json' } })
  })

  test('url, params and data prefer the custom config', () => {
    const merged = mergeConfig(
      { url: '/default', params: { a: 1 }, data: { from: 'default' } },
      { url: '/custom', params: { b: 2 }, data: { from: 'custom' } }
    )

    expect(merged.url).toBe('/custom')
    expect(merged.params).toEqual({ b: 2 })
    expect(merged.data).toEqual({ from: 'custom' })
  })

  test('deep merges headers', () => {
    const merged: any = mergeConfig(
      { headers: { common: { Accept: 'json' }, get: { 'X-Default': '1' } } },
      { headers: { get: { 'X-Custom': '2' } } }
    )

    expect(merged.headers).toEqual({
      common: { Accept: 'json' },
      get: { 'X-Default': '1', 'X-Custom': '2' }
    })
  })

  test('deep merges headers when only the defaults carry headers', () => {
    const merged: any = mergeConfig({ headers: { common: { Accept: 'json' } } }, {})
    expect(merged.headers).toEqual({ common: { Accept: 'json' } })
  })

  test('a non-object headers value wins outright', () => {
    const merged: any = mergeConfig({ headers: { common: { Accept: 'json' } } }, {
      headers: 'raw-value'
    } as any)
    expect(merged.headers).toBe('raw-value')
  })

  test('keeps the default value for keys the custom config omits', () => {
    const merged: any = mergeConfig({ timeout: 0, method: 'get' }, { url: '/api' } as any)
    expect(merged.method).toBe('get')
    expect(merged.timeout).toBe(0)
  })

  test('tolerates a missing custom config', () => {
    const merged: any = mergeConfig({ url: '/api', headers: { common: { Accept: 'json' } } })
    expect(merged.url).toBe('/api')
    expect(merged.headers).toEqual({ common: { Accept: 'json' } })
  })

  test('returns a fresh object without prototype', () => {
    const config1 = { url: '/api' }
    const merged = mergeConfig(config1, {})
    expect(merged).not.toBe(config1)
    expect(Object.getPrototypeOf(merged)).toBe(null)
  })
})
