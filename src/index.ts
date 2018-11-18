
type Arguments<T> = T extends (...args: infer A) => any ? A : never;
type Fn = (...args: any[]) => any
type MiddlewareFn<T extends Fn> = (next: T, ...args: Arguments<T>) => ReturnType<T>
interface IMiddlewarefiedProps<T extends Fn> {
    register(middleware: IMiddleware<T>): void
    unregister(middleware: IMiddleware<T>): void
    unregisterAll(): void
}
type Middlewarefied<T extends Fn> = T & IMiddlewarefiedProps<T>

export interface IMiddlewareClass<T extends Fn> {
    execute: MiddlewareFn<T>
}

export type IMiddleware<T extends Fn> = IMiddlewareClass<T> | MiddlewareFn<T>

export class MiddlewareManager<T extends Fn> {
    middlewares: IMiddleware<T>[]

    constructor() {
        this.middlewares = []
    }

    register(middleware: IMiddleware<T>) {
        const index = this.middlewares.indexOf(middleware)
        if (index === -1) {
            this.middlewares.push(middleware)
        }
    }

    unregister(middleware: IMiddleware<T>) {
        const index = this.middlewares.indexOf(middleware)
        if (index !== -1) {
            this.middlewares.splice(index, 1)
        }
    }

    unregisterAll() {
        this.middlewares.splice(0, this.middlewares.length)
    }

    createChain(context: any, index: number, fn: T): T {
        if (index >= this.middlewares.length) {
            return fn.bind(context)
        } else {
            const middleware = this.middlewares[index]
            if (typeof middleware === 'function') {
                return (middleware as MiddlewareFn<T>).bind(
                    context, this.createChain(context, index+1, fn))
            } else {
                return (middleware as IMiddlewareClass<T>).execute.bind(
                    context, this.createChain(context, index+1, fn))
            }
        }
    }

    wrap(fn: T): T {
        const self = this
        return function(...args: any[]): any {
            return self.createChain(this, 0, fn)(...args)
        } as T
    }
}

export const middlewarefy = <T extends Fn> (fn: T): Middlewarefied<T> => {
    const manager = new MiddlewareManager<T>()
    const wrappedFn = manager.wrap(fn) as Middlewarefied<T>
    wrappedFn.register = manager.register.bind(manager)
    wrappedFn.unregister = manager.unregister.bind(manager)
    wrappedFn.unregisterAll = manager.unregisterAll.bind(manager)
    return wrappedFn
}

export const middlewarefyObj = <T extends Fn> (obj: any, name: string): Middlewarefied<T> => {
    while (obj) {
        if (!obj.hasOwnProperty(name)) {
            obj = obj.prototype
        } else {
            const wrappedFn = middlewarefy<T>(obj[name])
            obj[name] = wrappedFn
            return wrappedFn
        }
    }
    throw new Error(`Could not middlewarefy ${name} on ${obj}`)
}
