import { constructor, Transform } from 'tsyringe/dist/typings/types'
import { getParamInfo } from './helpers'
import { InjectionToken, TokenDescriptor } from './types'
import { container } from './container'


export interface TransformDescriptor
{
    token: InjectionToken<any>
    transform: InjectionToken<Transform<any, any>>
    transformArgs: any[]
}


export function isTransformDescriptor(
    descriptor: any
): descriptor is TransformDescriptor
{
    return (
        typeof descriptor === "object" &&
        "token" in descriptor &&
        "transform" in descriptor
    )
}


export function isTokenDescriptor(
    descriptor: any
): descriptor is TokenDescriptor
{
    return (
        typeof descriptor === "object" &&
        "token" in descriptor &&
        "multiple" in descriptor
    )
}


function formatDependency(params: string | null, idx: number): string
{
    if (params === null)
    {
        return `at position #${idx}`
    }
    const argName = params.split(",")[idx].trim()
    return `"${argName}" at position #${idx}`
}


function composeErrorMessage(msg: string, e: Error, indent = "    "): string
{
    return [msg, ...e.message.split("\n").map(l => indent + l)].join("\n")
}


export function formatErrorCtor(
    ctor: constructor<any>,
    paramIdx: number,
    error: Error
): string
{
    const [, params = null] = ctor.toString().match(/constructor\(([\w, ]+)\)/) || []
    const dep = formatDependency(params, paramIdx)
    return composeErrorMessage(
        `Cannot inject the dependency ${dep} of "${ctor.name}" constructor. Reason:`,
        error
    )
}


/**
 * Class decorator factory that replaces the decorated class' constructor with
 * a parameterless constructor that has dependencies auto-resolved
 *
 * Note: Resolution is performed using the global container
 *
 * @return {Function} The class decorator
 */
export function autoInjectable(): (target: constructor<any>) => any
{
    return function (target: constructor<any>): constructor<any>
    {
        const paramInfo = getParamInfo(target)

        return class extends target
        {
            constructor(...args: any[])
            {
                const resolvedArgs = args.concat(
                    paramInfo.slice(args.length).map((type, index) =>
                    {
                        try
                        {
                            if (isTokenDescriptor(type))
                            {
                                if (isTransformDescriptor(type))
                                {
                                    return type.multiple
                                        ? container
                                            .resolve(type.transform)
                                            .transform(
                                                container.resolveAll(type.token),
                                                ...type.transformArgs
                                            )
                                        : container
                                            .resolve(type.transform)
                                            .transform(
                                                container.resolve(type.token),
                                                ...type.transformArgs
                                            )
                                } else
                                {
                                    return type.multiple
                                        ? container.resolveAll(type.token)
                                        : container.resolve(type.token)
                                }
                            } else if (isTransformDescriptor(type))
                            {
                                return container
                                    .resolve(type.transform)
                                    .transform(
                                        container.resolve(type.token),
                                        ...type.transformArgs
                                    )
                            }
                            return container.resolve(type)
                        } catch (e)
                        {
                            const argIndex = index + args.length
                            throw new Error(formatErrorCtor(target, argIndex, e as Error))
                        }
                    })
                )

                super(...resolvedArgs)

                // Use Reflect.construct to ensure the constructor of the base class is called correctly
                return Reflect.construct(target, resolvedArgs, new.target)
            }
        }
    }
}