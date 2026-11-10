import transform from '../../src/core/transform'

describe('core::transform', () => {
  test('returns the data untouched when there is no transformer', () => {
    expect(transform({ a: 1 }, {})).toEqual({ a: 1 })
    expect(transform('raw', {})).toBe('raw')
  })

  test('applies a single transformer', () => {
    const result = transform('raw', { id: 1 }, (data: any, headers: any) => data + ':' + headers.id)
    expect(result).toBe('raw:1')
  })

  test('applies an array of transformers in order', () => {
    const calls: string[] = []
    const result = transform(
      'start',
      {},
      [
        (data: any) => {
          calls.push('first')
          return data + '-1'
        },
        (data: any) => {
          calls.push('second')
          return data + '-2'
        }
      ]
    )

    expect(result).toBe('start-1-2')
    expect(calls).toEqual(['first', 'second'])
  })
})
