import { RegistryBase } from './registry'
import { PreResolutionInterceptorCallback, InterceptorOptions, PostResolutionInterceptorCallback } from './types'


export type PreResolutionInterceptor = {
    callback: PreResolutionInterceptorCallback
    options: InterceptorOptions
}


export class PreResolutionInterceptors extends RegistryBase<PreResolutionInterceptor> { }
export class PostResolutionInterceptors extends RegistryBase<PostResolutionInterceptor> { }


export type PostResolutionInterceptor = {
    callback: PostResolutionInterceptorCallback
    options: InterceptorOptions
}


export class Interceptors
{
    public preResolution: PreResolutionInterceptors = new PreResolutionInterceptors();
    public postResolution: PostResolutionInterceptors = new PostResolutionInterceptors();
}