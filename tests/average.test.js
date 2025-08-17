// const { test, describe } = require('node:test')
const assert = require('node:assert')

const average = require('../utils/for_testing').average

describe('average', () => {
  test('of one value is the value itself', () => {
    // assert.strictEqual(average([1]), 1)
    expect(average([1])).toBe(1)
  })

  test('of many is calculated right', () => {
    // assert.strictEqual(average([1, 2, 3, 4, 5, 6]), 3.5)
    expect(average([1,2,3,4,5,6])).toBe(3.5)
  })

  test('of empty array is zero', () => {
    // assert.strictEqual(average([]), 0)
    expect(average([])).toBe(0)
  })
})