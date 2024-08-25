import { DelayedConstructor } from './helpers'
import { constructor, DependencyContainer } from './types'


export interface FactoryProvider<T>
{
    useFactory: (dependencyContainer: DependencyContainer) => T
}


export function isFactoryProvider<T>(provider: Provider<T>): provider is FactoryProvider<any>
{
    return !!(provider as FactoryProvider<T>).useFactory
}


export type Provider<T = any> =
    | ClassProvider<T>
    | ValueProvider<T>
    | TokenProvider<T>
    | FactoryProvider<T>


export interface ClassProvider<T>
{
    useClass: constructor<T> | DelayedConstructor<T>
}


export function isClassProvider<T>(provider: Provider<T>): provider is ClassProvider<any>
{
    return !!(provider as ClassProvider<T>).useClass
}


export interface ValueProvider<T>
{
    useValue: T
}


export function isValueProvider<T>(provider: Provider<T>): provider is ValueProvider<T>
{
    return (provider as ValueProvider<T>).useValue != undefined
}


type InjectionToken<T = any> =
    | constructor<T>
    | string
    | symbol
    | DelayedConstructor<T>



export interface TokenProvider<T>
{
    useToken: InjectionToken<T>
}


export function isTokenProvider<T>(provider: Provider<T>): provider is TokenProvider<any>
{
    return !!(provider as TokenProvider<T>).useToken
}


export function isProvider(provider: any): provider is Provider
{
    return (
        isClassProvider(provider) ||
        isValueProvider(provider) ||
        isTokenProvider(provider) ||
        isFactoryProvider(provider)
    )
}


export function isNormalToken(token?: InjectionToken<any>): token is string | symbol
{
    return typeof token === "string" || typeof token === "symbol"
}


export function isConstructorToken(token?: InjectionToken<any>): token is constructor<any> | DelayedConstructor<any>
{
    return typeof token === "function" || token instanceof DelayedConstructor
}