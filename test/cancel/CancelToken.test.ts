import CancelToken from '../../src/cancel/CancelToken'
import Cancel, { isCancel } from '../../src/cancel/Cancel'

describe('cancel::CancelToken', () => {
  test('exposes the cancel message on a Cancel instance', () => {
    const token = new CancelToken(() => undefined)
    expect(token.reason).toBeUndefined()
    expect(token.promise).toBeInstanceOf(Promise)
  })

  test('resolves the token promise with a Cancel reason', async () => {
    let cancel!: (message?: string) => void
    const token = new CancelToken(c => {
      cancel = c
    })

    cancel('stop now')

    await expect(token.promise).resolves.toBeInstanceOf(Cancel)
    expect(token.reason!.message).toBe('stop now')
    expect(isCancel(token.reason)).toBe(true)
  })

  test('ignores repeated cancellations and keeps the first reason', async () => {
    let cancel!: (message?: string) => void
    const token = new CancelToken(c => {
      cancel = c
    })

    cancel('first')
    cancel('second')

    await expect(token.promise).resolves.toBe(token.reason)
    expect(token.reason!.message).toBe('first')
  })

  test('throwIfRequested() throws only after cancellation', () => {
    let cancel!: (message?: string) => void
    const token = new CancelToken(c => {
      cancel = c
    })

    expect(() => token.throwIfRequested()).not.toThrow()

    cancel('aborted')

    let thrown: any
    try {
      token.throwIfRequested()
    } catch (e) {
      thrown = e
    }

    expect(isCancel(thrown)).toBe(true)
    expect(thrown.message).toBe('aborted')
  })

  test('source() returns a token together with its canceller', async () => {
    const source = CancelToken.source()

    expect(typeof source.cancel).toBe('function')
    expect(source.token.reason).toBeUndefined()

    source.cancel('via source')

    await expect(source.token.promise).resolves.toBe(source.token.reason)
    expect(isCancel(source.token.reason)).toBe(true)
  })

  test('isCancel() distinguishes Cancel instances from plain errors', () => {
    expect(isCancel(new Cancel('x'))).toBe(true)
    expect(isCancel(new Error('x'))).toBe(false)
    expect(isCancel(undefined)).toBe(false)
  })
})
