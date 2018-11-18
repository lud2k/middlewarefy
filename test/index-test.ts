import { describe, it } from 'mocha'
import { expect } from 'chai'
import { middlewarefy, middlewarefyObj } from '../dist/index.js'

describe('middlewarefy', () => {
    it('returns a function that works like the original function', () => {
        const fn = function(n: string): string {
            return n
        }

        const result = middlewarefy(fn)
        expect(result('5')).to.equal('5')
    })

    it('registers and unregisters a middleware', () => {
        const fn = function(n: string): string {
            return n
        }

        const middleware = function(next: (n: string) => string, n: string): string {
            return next('n='+n)
        }

        const result = middlewarefy(fn)
        result.register(middleware)
        expect(result('5')).to.equal('n=5')
        result.unregister(middleware)
        expect(result('5')).to.equal('5')
    })

    it('registers two middlewares', () => {
        const fn = function(n: string): string {
            return n
        }

        const middleware1 = function(next: (n: string) => string, n: string): string {
            return next('n1='+n)
        }

        const middleware2 = function(next: (n: string) => string, n: string): string {
            return next('n2='+n)
        }

        const result = middlewarefy(fn)
        result.register(middleware1)
        expect(result('5')).to.equal('n1=5')
        result.register(middleware2)
        expect(result('5')).to.equal('n2=n1=5')
        result.unregister(middleware1)
        expect(result('5')).to.equal('n2=5')
        result.unregister(middleware2)
        expect(result('5')).to.equal('5')
    })

    it('clears all middlewares', () => {
        const fn = function(n: string): string {
            return n
        }

        const middleware1 = function(next: (n: string) => string, n: string): string {
            return next('n1='+n)
        }

        const middleware2 = function(next: (n: string) => string, n: string): string {
            return next('n2='+n)
        }

        const result = middlewarefy(fn)
        result.register(middleware1)
        result.register(middleware2)
        expect(result('5')).to.equal('n2=n1=5')
        result.unregisterAll()
        expect(result('5')).to.equal('5')
    })

    it('ignores registering the same middleware more than once', () => {
        const fn = function(n: string): string {
            return n
        }

        const middleware = function(next: (n: string) => string, n: string): string {
            return next('n1='+n)
        }

        const result = middlewarefy(fn)
        result.register(middleware)
        result.register(middleware)
        expect(result('5')).to.equal('n1=5')
        result.unregister(middleware)
        expect(result('5')).to.equal('5')
    })

    it('keeps the context of the caller', () => {
        const obj = {
            val: 'val',
            fn: middlewarefy(function(n: string): string {
                return `${this.val}-${n}`
            })
        }

        const middleware = function(next: (n: string) => string, n: string): string {
            return next('n='+n)
        }

        obj.fn = middlewarefy(obj.fn)
        obj.fn.register(middleware)
        expect(obj.fn('5')).to.equal('val-n=5')
        obj.fn.unregister(middleware)
        expect(obj.fn('5')).to.equal('val-5')
    })

    it('works with arrow functions', () => {
        const fn = function(n: string): string {
            return n
        }

        const middleware = (next: (n: string) => string, n: string): string => {
            return next('n='+n)
        }

        const result = middlewarefy(fn)
        result.register(middleware)
        expect(result('5')).to.equal('n=5')
        result.unregister(middleware)
        expect(result('5')).to.equal('5')
    })

    it('works with async functions', async () => {
        const fn = async function(n: string): Promise<string> {
            return Promise.resolve(n)
        }

        const middleware = async (next: (n: string) => Promise<string>, n: string): Promise<string> => {
            const ret = await next(n)
            return 'n=' + ret
        }

        const result = middlewarefy(fn)
        result.register(middleware)
        expect(await result('5')).to.equal('n=5')
        result.unregister(middleware)
        expect(await result('5')).to.equal('5')
    })

    it('works on classes', async () => {
        class Test {
            val(n: string): string { return n }
            fn(n: string): string {
                return this.val(n)
            }
        }

        type Fn = (n: string) => string

        const middleware = function(next: (n: string) => string, n: string): string {
            return next('n='+n)
        }

        const test = new Test()
        const middlewarefied = middlewarefyObj<Fn>(Test, 'fn')
        middlewarefied.register(middleware)
        expect(test.fn('5')).to.equal('n=5')
        middlewarefied.unregister(middleware)
        expect(test.fn('5')).to.equal('5')
    })
})
