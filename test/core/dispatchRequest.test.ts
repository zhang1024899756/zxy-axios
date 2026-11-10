import dispatchRequest, { transformUrl } from '../../src/core/dispatchRequest'
import xhr from '../../src/core/xhr'
import CancelToken from '../../src/cancel/CancelToken'
import { isCancel } from '../../src/cancel/Cancel'

jest.mock('../../src/core/xhr', () => ({ __esModule: true, default: jest.fn() }))

const mockedXhr = xhr as unknown as jest.Mock

function respondWith(overrides: any = {}, data = '{"ok":true}') {
  mockedXhr.mockImplementation((config: any) =>
    Promise.resolve({
      data,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      request: {},
      ...overrides
    })
  )
}

describe('core::dispatchRequest', () => {
  beforeEach(() => {
    mockedXhr.mockReset()
  })

  describe('transformUrl', () => {
    test('serialises params', () => {
      expect(transformUrl({ url: '/user', params: { id: 1 } })).toBe('/user?id=1')
    })

    test('joins baseURL with a relative url', () => {
      expect(transformUrl({ baseURL: 'http://example.com/api', url: '/user' })).toBe(
        'http://example.com/api/user'
      )
    })

    test('keeps an absolute url untouched even when baseURL is set', () => {
      expect(
        transformUrl({ baseURL: 'http://example.com/api', url: 'http://cdn.example.com/x.js' })
      ).toBe('http://cdn.example.com/x.js')
    })
  })

  test('processes the config, delegates to xhr and returns the response', async () => {
    respondWith()
    const config: any = {
      url: '/user',
      baseURL: 'http://example.com/api',
      params: { id: 1 },
      method: 'post',
      data: { a: 1 },
      headers: { common: { Accept: 'json' }, post: { 'X-Post': '1' } },
      transformRequest: [(data: any) => JSON.stringify(data)],
      transformResponse: [(data: any) => JSON.parse(data)]
    }

    const response = await dispatchRequest(config)
    const passed = mockedXhr.mock.calls[0][0]

    expect(passed.url).toBe('http://example.com/api/user?id=1')
    expect(passed.data).toBe('{"a":1}')
    expect(passed.headers).toEqual({ Accept: 'json', 'X-Post': '1' })
    expect(response.data).toEqual({ ok: true })
  })

  test('leaves the payload untouched when no transformers are configured', async () => {
    respondWith({}, 'raw-body')

    const response = await dispatchRequest({ url: '/user', method: 'get' } as any)

    expect(mockedXhr.mock.calls[0][0].data).toBeUndefined()
    expect(response.data).toBe('raw-body')
  })

  test('rejects before sending when the cancel token is already cancelled', () => {
    const source = CancelToken.source()
    source.cancel('stop')

    let thrown: any
    try {
      dispatchRequest({ url: '/user', cancelToken: source.token } as any)
    } catch (error) {
      thrown = error
    }

    expect(isCancel(thrown)).toBe(true)
    expect(thrown.message).toBe('stop')
    expect(mockedXhr).not.toHaveBeenCalled()
  })

  test('tolerates a config without headers', async () => {
    respondWith()

    await expect(dispatchRequest({ url: '/user', method: 'get' } as any)).resolves.toBeTruthy()
    expect(mockedXhr).toHaveBeenCalledTimes(1)
  })
})
