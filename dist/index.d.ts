declare type Arguments<T> = T extends (...args: infer A) => any ? A : never;
declare type Fn = (...args: any[]) => any;
declare type MiddlewareFn<T extends Fn> = (next: T, ...args: Arguments<T>) => ReturnType<T>;
interface IMiddlewarefiedProps<T extends Fn> {
    register(middleware: IMiddleware<T>): void;
    unregister(middleware: IMiddleware<T>): void;
    unregisterAll(): void;
}
declare type Middlewarefied<T extends Fn> = T & IMiddlewarefiedProps<T>;
export interface IMiddlewareClass<T extends Fn> {
    execute: MiddlewareFn<T>;
}
export declare type IMiddleware<T extends Fn> = IMiddlewareClass<T> | MiddlewareFn<T>;
export declare class MiddlewareManager<T extends Fn> {
    middlewares: IMiddleware<T>[];
    constructor();
    register(middleware: IMiddleware<T>): void;
    unregister(middleware: IMiddleware<T>): void;
    unregisterAll(): void;
    createChain(context: any, index: number, fn: T): T;
    wrap(fn: T): T;
}
export declare const middlewarefy: <T extends Fn>(fn: T) => Middlewarefied<T>;
export declare const middlewarefyObj: <T extends Fn>(obj: any, name: string) => Middlewarefied<T>;
export {};
