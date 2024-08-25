import { constructor, Dictionary, INJECTION_TOKEN_METADATA_KEY, InjectionToken, ParamInfo } from './types'


export function getParamInfo(target: constructor<any>): ParamInfo[]
{
    const params: any[] = Reflect.getMetadata("design:paramtypes", target) || []
    const injectionTokens: Dictionary<InjectionToken<any>> =
        Reflect.getOwnMetadata(INJECTION_TOKEN_METADATA_KEY, target) || {}
    Object.keys(injectionTokens).forEach(key =>
    {
        params[+key] = injectionTokens[key]
    })

    return params
}


export class DelayedConstructor<T>
{
    private reflectMethods: ReadonlyArray<keyof ProxyHandler<any>> = [
        "get",
        "getPrototypeOf",
        "setPrototypeOf",
        "getOwnPropertyDescriptor",
        "defineProperty",
        "has",
        "set",
        "deleteProperty",
        "apply",
        "construct",
        "ownKeys"
    ];

    constructor(private wrap: () => constructor<T>) { }

    public createProxy(createObject: (ctor: constructor<T>) => T): T
    {
        const target: object = {}
        let init = false
        let value: T
        const delayedObject: () => T = (): T =>
        {
            if (!init)
            {
                value = createObject(this.wrap())
                init = true
            }
            return value
        }
        return new Proxy<any>(target, this.createHandler(delayedObject)) as T
    }

    private createHandler(delayedObject: () => T): ProxyHandler<object>
    {
        const handler: ProxyHandler<object> = {}
        const install = (name: keyof ProxyHandler<any>): void =>
        {
            handler[name] = (...args: any[]) =>
            {
                args[0] = delayedObject()
                const method = Reflect[name]
                return (method as any)(...args)
            }
        }
        this.reflectMethods.forEach(install)
        return handler
    }
}