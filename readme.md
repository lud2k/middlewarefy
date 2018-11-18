[![typescript version](https://img.shields.io/badge/TypeScript-3.1.6-green.svg?style=flat-square)](https://www.typescriptlang.org/)

Middlewarefy makes it easy to make your code more extensible by allowing adding
middlewares to any function.

This library works great with TypeScript projects. Everything is typed so that
you get autocompletion and type checking. Make sure you are using at least
TypeScript 3.1.6!

## QuickStart

### Installation

```bash
npm install --save middlewarefy
```

### Usage 

#### TypeScript

```typescript
import { middlewarefy } from 'middlewarefy'

const fn = middlewarefy((n: string): string => {
    return n
})

fn.register((next: (n: string) => string, n: string): string => {
    return next('n='+n)
})

const result = fn('5')
// result is 'n=5'
```

#### JavaScript

```javascript
const { middlewarefy } = require('middlewarefy')

const fn = middlewarefy((n) => {
    return n
})

fn.register((next, n) => {
    return next('n='+n)
})

const result = fn('5')
// result is 'n=5'
```

#### On a class

```typescript
import { middlewarefyObj } from 'middlewarefy'

class Test {
    val(n: string): string { return n }
    fn(n: string): string {
        return this.val(n)
    }
}

// Prototype of the function that will be middlewarefied to keep type safety
type Fn = (n: string) => string

const middleware = function(next: Fn, n: string): string {
    return next('n='+n)
}

const middlewarefied = middlewarefyObj<Fn>(Test, 'fn')
middlewarefied.register(middleware)

const test = new Test()
const result = test.fn('5')
// result is 'n=5'
```

## API

#### middlewarefy(fn)

Wraps the given function in a Middlewarefied object.

```typescript
import { middlewarefy } from 'middlewarefy'

const fn = middlewarefy((n: string): string => {
    return n
})
```

#### middlewarefyObj(target, name)

Finds the function named {name} on the given object. Wraps it and returns
a Middlewarefied object. If the function is not found, an error is thrown.

```typescript
import { middlewarefyObj } from 'middlewarefy'

class Test {
    fn(n: string): string {
        return n
    }
}

// Prototype of the function that will be middlewarefied to keep type safety
type Fn = (n: string) => string

const fn = middlewarefyObj<Fn>(Test, 'fn')
```

#### Middlewarefied.register(middleware)

Registers a middleware. A middleware can only be registered once. Any call
with an existing middleware will be ignored.

#### Middlewarefied.unregister(middleware)

Unregisters a middleware.
If the middleware was not registered, nothing happens.

#### Middlewarefied.unregisterAll()

Unregisters all middlewares.

## Development

#### Building

This project needs to be built because it uses TypeScript.
Use the following command to build this project:

`npm run build`

#### Testing

This project uses mocha and chai for its unit tests.
Use the following command to run all the tests:

`npm run test`

## License

This project is licensed under the terms of the [MIT license](https://github.com/lud2k/code-review-stats/blob/master/LICENSE).