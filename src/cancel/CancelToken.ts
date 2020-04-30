import { CancelExecutor, CancelTokenSource, Canceler } from '../type'
import Cancel from './Cancel'

interface ResolvePromise {
  (reason?: Cancel): void
}

// CancelToken 构造函数内部，实例化一个 pending 状态的 Promise 对象，
// 然后用一个 resolvePromise 变量指向 resolve 函数。
// 接着执行 executor 函数，传入一个 cancel 函数，
// 在 cancel 函数内部，会调用 resolvePromise 把 Promise 对象从 pending 状态变为 resolved 状态
export default class CancelToken {
  promise: Promise<Cancel>
  reason?: Cancel

  constructor(executor: CancelExecutor) {
    let resolvePromise: ResolvePromise
    this.promise = new Promise<Cancel>(resolve => {
      resolvePromise = resolve
    })

    executor(message => {
      if (this.reason) {
        return
      }
      this.reason = new Cancel(message)
      resolvePromise(this.reason)
    })
  }

  throwIfRequested(): void {
    if (this.reason) {
      throw this.reason
    }
  }

  static source(): CancelTokenSource {
    let cancel!: Canceler
    const token = new CancelToken(c => {
      cancel = c
    })
    return {
      cancel,
      token
    }
  }
}
