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

export function popCacheProvider(workInProgress, cache){
    // popProvider(CacheContext, workInProgress);
}

export function pushRootCachePool(root){
    pooledCache = root.pooledCache;
}

let _suspendedPooledCache = null;

export function popRootCachePool(root, renderLanes){
    root.pooledCache = pooledCache;
    if(pooledCache !== null){
        root.pooledCacheLanes |= renderLanes;
    }
}

export function getSuspendedCachePool(){
    let pool = pooledCache;
    if(pool === null){
        debugger;
    }
    return {
        parent: CacheContext._currentValue,
        pool,
    }
}