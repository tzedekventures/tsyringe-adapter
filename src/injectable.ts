import { constructor, typeInfo } from "./types"
import { getParamInfo } from './helpers'

/**
 * Class decorator factory that allows the class' dependencies to be injected
 * at runtime.
 *
 * @return {Function} The class decorator
 */
export function injectable<T>(): (target: constructor<T>) => void
{
    return function (target: constructor<T>): void
    {
        typeInfo.set(target, getParamInfo(target))
    }
}

