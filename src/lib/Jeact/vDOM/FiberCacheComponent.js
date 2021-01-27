import {JEACT_CONTEXT_TYPE} from '@Jeact/shared/Constants';
import {pushProvider} from '@Jeact/vDOM/FiberNewContext';

export const CacheContext = {
    $$typeof:JEACT_CONTEXT_TYPE,
    Consumer: null,
    Provider: null,
    _calculatedChangedBits: null,
    _currentValue: null,
    _threadCount: 0,
}
// The cache that newly mounted Cache boundaries should use. It's either 
// retrieved from the cache pool, or the result of a refresh.
let pooledCache = null;

export function pushCacheProvider(workInProgress, cache){
    pushProvider(workInProgress, CacheContext, cache);
}

export function pushRootCachePool(root){
    pooledCache = root.pooledCache;
}