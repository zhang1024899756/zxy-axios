import { isDate } from '../src/helpers/util'

/**
 * Dummy test
 */
describe('Dummy test', () => {
  test('should validate Date', () => {
    expect(isDate(new Date())).toBeTruthy()
    expect(isDate(Date.now())).toBeFalsy()
  })
})
