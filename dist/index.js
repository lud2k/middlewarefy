"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MiddlewareManager {
    constructor() {
        this.middlewares = [];
    }
    register(middleware) {
        const index = this.middlewares.indexOf(middleware);
        if (index === -1) {
            this.middlewares.push(middleware);
        }
    }
    unregister(middleware) {
        const index = this.middlewares.indexOf(middleware);
        if (index !== -1) {
            this.middlewares.splice(index, 1);
        }
    }
    unregisterAll() {
        this.middlewares.splice(0, this.middlewares.length);
    }
    createChain(context, index, fn) {
        if (index >= this.middlewares.length) {
            return fn.bind(context);
        }
        else {
            const middleware = this.middlewares[index];
            if (typeof middleware === 'function') {
                return middleware.bind(context, this.createChain(context, index + 1, fn));
            }
            else {
                return middleware.execute.bind(context, this.createChain(context, index + 1, fn));
            }
        }
    }
    wrap(fn) {
        const self = this;
        return function (...args) {
            return self.createChain(this, 0, fn)(...args);
        };
    }
}
exports.MiddlewareManager = MiddlewareManager;
exports.middlewarefy = (fn) => {
    const manager = new MiddlewareManager();
    const wrappedFn = manager.wrap(fn);
    wrappedFn.register = manager.register.bind(manager);
    wrappedFn.unregister = manager.unregister.bind(manager);
    wrappedFn.unregisterAll = manager.unregisterAll.bind(manager);
    return wrappedFn;
};
exports.middlewarefyObj = (obj, name) => {
    while (obj) {
        if (!obj.hasOwnProperty(name)) {
            obj = obj.prototype;
        }
        else {
            const wrappedFn = exports.middlewarefy(obj[name]);
            obj[name] = wrappedFn;
            return wrappedFn;
        }
    }
    throw new Error(`Could not middlewarefy ${name} on ${obj}`);
};
