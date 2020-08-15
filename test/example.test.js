const assert = require('assert');
const chai = require('chai');
const expect = chai.expect

describe('Simple Math Test', () => {
  it('Should return 2', () => {
    expect(1+1).to.equal(2);
  })
  it('Should return 9', () => {
    assert.equal(3 * 3, 9);
  })
})

