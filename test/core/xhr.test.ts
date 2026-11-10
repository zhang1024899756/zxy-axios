import xhr from '../../src/core/xhr'
import CancelToken from '../../src/cancel/CancelToken'
import {
  installDom,
  uninstallDom,
  installXhr,
  uninstallXhr,
  lastXhr,
  flushPromises
} from '../__helpers__/env'

describe('core::xhr', () => {
  beforeEach(() => {
    installXhr()
    installDom('http://localhost:3000/app')
  })

  afterEach(() => {
    uninstallXhr()
    uninstallDom()
  })

  test('opens, sends and resolves with a 2xx response', async () => {
    const promise = xhr({ url: '/api', method: 'get', headers: {} } as any)
    const request = lastXhr()

    expect(request.method).toBe('GET')
    expect(request.url).toBe('/api')
    expect(request.async).toBe(true)
    expect(request.sent).toBe(true)

    request.respond(200, '{"a":1}', 'content-type: application/json\r\nx-id: 7\r\n')

    const response = await promise
    expect(response.status).toBe(200)
    expect(response.data).toBe('{"a":1}')
    expect(response.headers).toEqual({ 'content-type': 'application/json', 'x-id': '7' })
    expect(response.request).toBe(request)
  })

  test('ignores readystatechange events before the request is finished', async () => {
    let settled = false
    const promise = xhr({ url: '/api', headers: {} } as any)
    promise.then(
      () => (settled = true),
      () => (settled = true)
    )
    const request = lastXhr()

    request.readyState = 3
    request.onreadystatechange!()
    await flushPromises()
    expect(settled).toBe(false)

    request.respond(204)
    await promise
    expect(settled).toBe(true)
  })

  test('ignores a finished request that reports status 0', async () => {
    let settled = false
    const promise = xhr({ url: '/api', headers: {} } as any)
    promise.then(
      () => (settled = true),
      () => (settled = true)
    )
    const request = lastXhr()

    request.readyState = 4
    request.status = 0
    request.onreadystatechange!()
    await flushPromises()
    expect(settled).toBe(false)

    request.respond(200)
    await promise
  })

  test('rejects with an AxiosError when validateStatus rejects the status', async () => {
    const promise = xhr({
      url: '/api',
      headers: {},
      validateStatus: (status: number) => status >= 200 && status < 300
    } as any)
    lastXhr().respond(500, 'oops')

    await expect(promise).rejects.toMatchObject({
      message: 'Request failed with status code 500',
      isAxiosError: true,
      code: null
    })
  })

  test('accepts every status when no validateStatus is supplied', async () => {
    const promise = xhr({ url: '/api', headers: {} } as any)
    lastXhr().respond(500, 'oops')

    await expect(promise).resolves.toMatchObject({ status: 500 })
  })

  test('rejects with "Network Error" when the request fails', async () => {
    const promise = xhr({ url: '/api', headers: {} } as any)
    lastXhr().failNetwork()

    await expect(promise).rejects.toMatchObject({ message: 'Network Error', isAxiosError: true })
  })

  test('configures the timeout and rejects with ECONNABORTED', async () => {
    const promise = xhr({ url: '/api', headers: {}, timeout: 50 } as any)
    const request = lastXhr()

    expect(request.timeout).toBe(50)
    request.failTimeout()

    await expect(promise).rejects.toMatchObject({
      message: 'Timeout of 50 ms exceeded',
      code: 'ECONNABORTED'
    })
  })

  test('applies responseType and withCredentials', async () => {
    const promise = xhr({
      url: '/api',
      headers: {},
      responseType: 'json',
      withCredentials: true
    } as any)
    const request = lastXhr()

    expect(request.responseType).toBe('json')
    expect(request.withCredentials).toBe(true)

    request.respond(200, '{"a":1}')
    const response = await promise
    expect(response.data).toBe('{"a":1}')
  })

  test('aborts the request and rejects when the cancel token fires', async () => {
    const source = CancelToken.source()
    const promise = xhr({ url: '/api', headers: {}, cancelToken: source.token } as any)
    const request = lastXhr()
    const rejection = expect(promise).rejects.toMatchObject({ message: 'stop' })

    source.cancel('stop')
    await flushPromises()

    expect(request.aborted).toBe(true)
    await rejection
  })

  test('attaches the XSRF header when a matching cookie exists', async () => {
    installDom('http://localhost:3000/app', 'XSRF-TOKEN=abc123')

    const promise = xhr({
      url: '/api',
      headers: {},
      withCredentials: true,
      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN'
    } as any)
    const request = lastXhr()

    expect(request.requestHeaders['X-XSRF-TOKEN']).toBe('abc123')

    request.respond(200)
    await promise
  })

  test('does not attach the XSRF header when the cookie is missing', async () => {
    const promise = xhr({
      url: '/api',
      headers: {},
      withCredentials: true,
      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN'
    } as any)
    const request = lastXhr()

    expect(request.requestHeaders['X-XSRF-TOKEN']).toBeUndefined()

    request.respond(200)
    await promise
  })

  test('drops Content-Type for FormData bodies so the browser can add the boundary', async () => {
    if (typeof FormData === 'undefined') {
      return
    }

    const promise = xhr({
      url: '/api',
      method: 'post',
      headers: { 'Content-Type': 'multipart/form-data' },
      data: new FormData()
    } as any)
    const request = lastXhr()

    expect(request.requestHeaders['Content-Type']).toBeUndefined()

    request.respond(200)
    await promise
  })

  test('drops Content-Type when there is no request body', async () => {
    const promise = xhr({
      url: '/api',
      method: 'get',
      headers: { 'Content-Type': 'application/json' },
      data: null
    } as any)
    const request = lastXhr()

    expect(request.requestHeaders['Content-Type']).toBeUndefined()

    request.respond(200)
    await promise
  })

  test('sends basic auth credentials', async () => {
    const promise = xhr({
      url: '/api',
      headers: {},
      auth: { username: 'user', password: 'pass' }
    } as any)
    const request = lastXhr()

    // Regression guard: the Authorization header used to be written after the
    // setRequestHeader loop, so it never reached the request.
    expect(request.requestHeaders.Authorization).toBe(
      'Basic ' + Buffer.from('user:pass').toString('base64')
    )

    request.respond(200)
    await promise
  })

  test('wires the download and upload progress handlers', async () => {
    const onDownloadProgress = jest.fn()
    const onUploadProgress = jest.fn()

    const promise = xhr({
      url: '/api',
      method: 'post',
      headers: {},
      data: 'x',
      onDownloadProgress,
      onUploadProgress
    } as any)
    const request = lastXhr()

    expect(request.onprogress).toBe(onDownloadProgress)
    expect(request.upload.onprogress).toBe(onUploadProgress)

    request.respond(200)
    await promise
  })

  test('honours a custom validateStatus', async () => {
    const promise = xhr({ url: '/api', headers: {}, validateStatus: () => true } as any)
    lastXhr().respond(503)

    await expect(promise).resolves.toMatchObject({ status: 503 })
  })
})
