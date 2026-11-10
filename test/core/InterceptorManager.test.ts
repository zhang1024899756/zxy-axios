import InterceptorManager from '../../src/core/InterceptorManager'

describe('core::InterceptorManager', () => {
  test('use() registers interceptors and returns their id', () => {
    const manager = new InterceptorManager<string>()
    const first = manager.use(val => val + '!')

    expect(first).toBe(0)
    expect(manager.use(val => val + '?', () => 'rejected')).toBe(1)
  })

  test('forEach() visits only live interceptors', () => {
    const manager = new InterceptorManager<string>()
    const seen: string[] = []

    manager.use(() => {
      seen.push('a')
      return ''
    })
    manager.use(() => {
      seen.push('b')
      return ''
    })
    manager.eject(0)

    manager.forEach(interceptor => interceptor.resolved('x'))

    expect(seen).toEqual(['b'])
  })

  test('eject() is idempotent and ignores unknown ids', () => {
    const manager = new InterceptorManager<string>()
    const id = manager.use(val => val)

    manager.eject(id)
    expect(() => manager.eject(id)).not.toThrow()
    expect(() => manager.eject(99)).not.toThrow()

    const seen: number[] = []
    manager.forEach(() => seen.push(1))
    expect(seen).toEqual([])
  })
})
