import axios from '../src/index'
import instance from '../src/axios'

describe('index entry point', () => {
  test('re-exports the default instance', () => {
    expect(axios).toBe(instance)
  })

  test('exposes the behaviour of the underlying instance', () => {
    expect(typeof (axios as any).request).toBe('function')
    expect(axios.getUri({ url: '/api', params: { a: 1 } } as any)).toBe('/api?a=1')
  })
})
