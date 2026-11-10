import axios from '../src/axios'
import Axios from '../src/core/Axios'
import CancelToken from '../src/cancel/CancelToken'
import Cancel, { isCancel } from '../src/cancel/Cancel'
import xhr from '../src/core/xhr'

jest.mock('../src/core/xhr', () => ({ __esModule: true, default: jest.fn() }))

const mockedXhr = xhr as unknown as jest.Mock

function respondWith(data = '{}') {
  mockedXhr.mockImplementation((config: any) =>
    Promise.resolve({ data, status: 200, statusText: 'OK', headers: {}, config, request: {} })
  )
}

describe('axios', () => {
  beforeEach(() => {
    mockedXhr.mockReset()
  })

  test('exposes the documented instance and static API', () => {
    const instanceMethods = [
      'request',
      'get',
      'delete',
      'head',
      'options',
      'post',
      'put',
      'patch',
      'getUri',
      'create',
      'all',
      'spread'
    ]

    instanceMethods.forEach(name => {
      expect(typeof (axios as any)[name]).toBe('function')
    })

    expect(typeof (axios as any).interceptors.request.use).toBe('function')
    expect(typeof (axios as any).interceptors.response.use).toBe('function')
    expect(axios.CancelToken).toBe(CancelToken)
    expect(axios.Cancel).toBe(Cancel)
    expect(axios.isCancel).toBe(isCancel)
    expect(axios.Axios).toBe(Axios)
  })

  test('supports both request signatures', async () => {
    respondWith()

    await axios({ url: '/a', method: 'post' } as any)
    expect(mockedXhr.mock.calls[0][0].url).toBe('/a')
    expect(mockedXhr.mock.calls[0][0].method).toBe('post')

    await axios('/b', { method: 'get' })
    expect(mockedXhr.mock.calls[1][0].url).toBe('/b')
    expect(mockedXhr.mock.calls[1][0].method).toBe('get')
  })

  test('applies the default JSON response transformer', async () => {
    respondWith('{"a":1}')

    const response = await axios.get('/api')
    expect(response.data).toEqual({ a: 1 })
  })

  test('post() sets the method, serialises the body and adds a JSON Content-Type', async () => {
    respondWith()

    await axios.post('/p', { a: 1 })
    const config = mockedXhr.mock.calls[0][0]

    expect(config.method).toBe('post')
    expect(config.data).toBe('{"a":1}')
    expect(config.headers['Content-Type']).toBe('application/json;charset=utf-8')
  })

  test('the bodyless helpers never send a payload', async () => {
    respondWith()

    await axios.get('/g')
    await axios.delete('/d')
    await axios.head('/h')
    await axios.options('/o')

    expect(mockedXhr.mock.calls.map((call: any) => call[0].method)).toEqual([
      'get',
      'delete',
      'head',
      'options'
    ])
  })

  test('create() merges the given config over the defaults', async () => {
    respondWith()

    const instance = axios.create({
      baseURL: 'http://example.com/api',
      headers: { 'X-App': 'demo' }
    })
    await instance.get('/user', { params: { id: 1 } })
    const config = mockedXhr.mock.calls[0][0]

    expect(config.url).toBe('http://example.com/api/user?id=1')
    expect(config.headers['X-App']).toBe('demo')
  })

  test('getUri() resolves baseURL and params', () => {
    expect(axios.getUri({ url: '/api', params: { a: 1 } } as any)).toBe('/api?a=1')

    const instance = axios.create({ baseURL: 'http://example.com/api' })
    expect(instance.getUri({ url: '/user', params: { id: 2 } } as any)).toBe(
      'http://example.com/api/user?id=2'
    )
  })

  test('runs request and response interceptors in order', async () => {
    respondWith('{}')
    const order: string[] = []
    const instance = axios.create()

    instance.interceptors.request.use(config => {
      order.push('request')
      config.headers['X-Test'] = '1'
      return config
    })
    instance.interceptors.response.use(response => {
      order.push('response')
      response.data = { wrapped: response.data }
      return response
    })

    const response: any = await instance.get('/api')

    expect(order).toEqual(['request', 'response'])
    expect(mockedXhr.mock.calls[0][0].headers['X-Test']).toBe('1')
    expect(response.data).toEqual({ wrapped: {} })
  })

  test('eject() removes an interceptor', async () => {
    respondWith('{}')
    const instance = axios.create()
    const handler = jest.fn((config: any) => config)

    const id = instance.interceptors.request.use(handler)
    instance.interceptors.request.eject(id)

    await instance.get('/api')
    expect(handler).not.toHaveBeenCalled()
  })

  test('all() and spread() behave like the axios helpers', async () => {
    await expect(axios.all([Promise.resolve(1), Promise.resolve(2)])).resolves.toEqual([1, 2])

    const spread = (axios as any).spread((a: number, b: number) => a + b)
    expect(spread([1, 2])).toBe(3)
  })
})
