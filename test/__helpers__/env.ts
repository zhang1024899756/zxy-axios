/**
 * Test environment helpers.
 *
 * The library targets browsers (XMLHttpRequest, document.cookie, <a> url parsing)
 * while jest runs in the node environment, so the browser surface used by the
 * source is stubbed here instead of pulling in jsdom.
 */

class FakeAnchorElement {
  protocol = ''
  host = ''

  setAttribute(name: string, value: string): void {
    if (name === 'href') {
      const parsed = new URL(value, 'http://localhost/')
      this.protocol = parsed.protocol
      this.host = parsed.host
    }
  }
}

export interface DomStubs {
  cookie: string
}

/** Install `document` / `window` stubs and return a handle to mutate cookie. */
export function installDom(href = 'http://localhost:3000/app', cookie = ''): DomStubs {
  const stubs: DomStubs = { cookie }
  const documentStub: any = {
    createElement: () => new FakeAnchorElement()
  }
  Object.defineProperty(documentStub, 'cookie', {
    get: () => stubs.cookie,
    set: (value: string) => {
      stubs.cookie = value
    }
  })
  ;(global as any).document = documentStub
  ;(global as any).window = { location: { href } }
  return stubs
}

export function uninstallDom(): void {
  delete (global as any).document
  delete (global as any).window
}

/**
 * A minimal XMLHttpRequest stand-in. Tests drive it manually via
 * respond() / failNetwork() / failTimeout() instead of doing real I/O.
 */
export class FakeXMLHttpRequest {
  static instances: FakeXMLHttpRequest[] = []

  method = ''
  url = ''
  async = false
  status = 0
  statusText = ''
  readyState = 0
  response: any = null
  responseText = ''
  responseType = ''
  timeout = 0
  withCredentials = false
  aborted = false
  sent = false
  body: any = null
  requestHeaders: Record<string, string> = {}
  responseHeadersRaw = ''
  upload: { onprogress: ((e: any) => void) | null } = { onprogress: null }

  onreadystatechange: (() => void) | null = null
  onerror: (() => void) | null = null
  ontimeout: (() => void) | null = null
  onprogress: ((e: any) => void) | null = null

  constructor() {
    FakeXMLHttpRequest.instances.push(this)
  }

  open(method: string, url: string, async: boolean): void {
    this.method = method
    this.url = url
    this.async = async
    this.readyState = 1
  }

  setRequestHeader(name: string, value: string): void {
    this.requestHeaders[name] = value
  }

  getAllResponseHeaders(): string {
    return this.responseHeadersRaw
  }

  send(body?: any): void {
    this.sent = true
    this.body = body === undefined ? null : body
  }

  abort(): void {
    this.aborted = true
  }

  // --- helpers for tests -------------------------------------------------

  respond(status: number, body = '', headersRaw = '', withReadyStateEvent = true): void {
    this.status = status
    this.statusText = String(status)
    this.responseText = body
    this.response = body
    this.responseHeadersRaw = headersRaw
    this.readyState = 4
    if (withReadyStateEvent && this.onreadystatechange) {
      this.onreadystatechange()
    }
  }

  failNetwork(): void {
    if (this.onerror) {
      this.onerror()
    }
  }

  failTimeout(): void {
    if (this.ontimeout) {
      this.ontimeout()
    }
  }
}

export function installXhr(): void {
  FakeXMLHttpRequest.instances = []
  ;(global as any).XMLHttpRequest = FakeXMLHttpRequest
}

export function uninstallXhr(): void {
  delete (global as any).XMLHttpRequest
}

/** Let the microtask queue drain so promise callbacks run. */
export function flushPromises(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

export function lastXhr(): FakeXMLHttpRequest {
  const list = FakeXMLHttpRequest.instances
  return list[list.length - 1]
}
