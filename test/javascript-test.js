const { expect } = require('chai')
const { middlewarefy } = require('../dist/index.js')

describe('javascript', () => {
    it('works without typescript', () => {
      const fn = (n) => {
        return n
      }

      const middleware = function(next, n) {
        return next('n='+n)
      }

      const result = middlewarefy(fn)
      result.register(middleware)
      expect(result('5')).to.equal('n=5')
      result.unregister(middleware)
      expect(result('5')).to.equal('5')
    })
})
