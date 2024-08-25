import { DelayedConstructor } from './helpers'


export type ParamInfo = TokenDescriptor | InjectionToken<any>
export const INJECTION_TOKEN_METADATA_KEY = "injectionTokens"
export const typeInfo = new Map<constructor<any>, ParamInfo[]>()
export type ResolutionType = "Single" | "All"


export type RegistrationOptions = {
    /**
     * Customize the lifecycle of the registration
     * See https://github.com/microsoft/tsyringe#available-scopes for more information
     */
    lifecycle: Lifecycle
}


/** Constructor type */
export type constructor<T> = {
    new(...args: any[]): T
}


export type InjectionToken<T = any> =
    | constructor<T>
    | string
    | symbol
    | DelayedConstructor<T>


export type Dictionary<T> = {
    [key: string]: T
}


export interface TokenDescriptor
{
    token: InjectionToken<any>
    multiple: boolean
}


export interface Disposable
{
    dispose(): Promise<void> | void
}


export interface FactoryProvider<T>
{
    useFactory: (dependencyContainer: DependencyContainer) => T
}


export interface ValueProvider<T>
{
    useValue: T
}


export interface TokenProvider<T>
{
    useToken: InjectionToken<T>
}


export interface ClassProvider<T>
{
    useClass: constructor<T> | DelayedConstructor<T>
}


export interface PreResolutionInterceptorCallback<T = any>
{
    /**
     * @param token The InjectionToken that was intercepted
     * @param resolutionType The type of resolve that was called (i.e. All or Single)
     */
    (token: InjectionToken<T>, resolutionType: ResolutionType): void
}


export type Frequency = "Always" | "Once"


export type InterceptorOptions = {
    frequency: Frequency
}


export interface PostResolutionInterceptorCallback<T = any>
{
    /**
     * @param token The InjectionToken that was intercepted
     * @param result The object that was resolved from the container
     * @param resolutionType The type of resolve that was called (i.e. All or Single)
     */
    (
        token: InjectionToken<T>,
        result: T | T[],
        resolutionType: ResolutionType
    ): void
}


export interface DependencyContainer extends Disposable
{
    register<T>(
        token: InjectionToken<T>,
        provider: ValueProvider<T>
    ): DependencyContainer
    register<T>(
        token: InjectionToken<T>,
        provider: FactoryProvider<T>
    ): DependencyContainer
    register<T>(
        token: InjectionToken<T>,
        provider: TokenProvider<T>,
        options?: RegistrationOptions
    ): DependencyContainer
    register<T>(
        token: InjectionToken<T>,
        provider: ClassProvider<T>,
        options?: RegistrationOptions
    ): DependencyContainer
    register<T>(
        token: InjectionToken<T>,
        provider: constructor<T>,
        options?: RegistrationOptions
    ): DependencyContainer

    registerSingleton<T>(
        from: InjectionToken<T>,
        to: InjectionToken<T>
    ): DependencyContainer
    registerSingleton<T>(token: constructor<T>): DependencyContainer

    registerType<T>(
        from: InjectionToken<T>,
        to: InjectionToken<T>
    ): DependencyContainer

    registerInstance<T>(
        token: InjectionToken<T>,
        instance: T
    ): DependencyContainer

    /**
     * Resolve a token into an instance
     *
     * @param token The dependency token
     * @return An instance of the dependency
     */
    resolve<T>(token: InjectionToken<T>): T
    resolveAll<T>(token: InjectionToken<T>): T[]

    /**
     * Check if the given dependency is registered
     *
     * @param token The token to check
     * @param recursive Should parent containers be checked?
     * @return Whether or not the token is registered
     */
    isRegistered<T>(token: InjectionToken<T>, recursive?: boolean): boolean

    /**
     * Clears all registered tokens
     */
    reset(): void

    clearInstances(): void
    createChildContainer(): DependencyContainer

    /**
     * Registers a callback that is called when a specific injection token is resolved
     * @param token The token to intercept
     * @param callback The callback that is called before the token is resolved
     * @param options Options for under what circumstances the callback will be called
     */
    beforeResolution<T>(
        token: InjectionToken<T>,
        callback: PreResolutionInterceptorCallback<T>,
        options?: InterceptorOptions
    ): void

    /**
     * Registers a callback that is called after a successful resolution of the token
     * @param token The token to intercept
     * @param callback The callback that is called after the token is resolved
     * @param options Options for under what circumstances the callback will be called
     */
    afterResolution<T>(
        token: InjectionToken<T>,
        callback: PostResolutionInterceptorCallback<T>,
        options?: InterceptorOptions
    ): void

    /**
     * Calls `.dispose()` on all disposable instances created by the container.
     * After calling this, the container may no longer be used.
     */
    dispose(): Promise<void> | void
}


export enum Lifecycle
{
    Transient,
    Singleton,
    ResolutionScoped,
    ContainerScoped
}


export function isDisposable(value: any): value is Disposable
{
    if (typeof value.dispose !== "function") return false

    const disposeFun: Function = value.dispose

    // `.dispose()` takes in no arguments
    if (disposeFun.length > 0)
    {
        return false
    }

    return true
}