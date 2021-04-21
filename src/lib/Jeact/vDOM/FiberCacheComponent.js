import {JEACT_CONTEXT_TYPE} from '@Jeact/shared/Constants';
import {
    pushProvider,
    popProvider
} from '@Jeact/vDOM/FiberNewContext';
import {
    createCursor,
    push,
    pop
} from '@Jeact/vDOM/FiberStack';

export const CacheContext = {
    $$typeof:JEACT_CONTEXT_TYPE,
    _currentValue: null,
    _threadCount: 0,
}
// The cache that newly mounted Cache boundaries should use. It's either 
// retrieved from the cache pool, or the result of a refresh.
let pooledCache = null;

const prevFreshCacheOnStack = createCursor(null);

export function pushCacheProvider(workInProgress, cache){
    pushProvider(workInProgress, CacheContext, cache);
}

export function popCacheProvider(workInProgress, cache){
    popProvider(CacheContext, workInProgress);
}

export function pushRootCachePool(root){
    pooledCache = root.pooledCache;
}

export function popRootCachePool(root, renderLanes){
    root.pooledCache = pooledCache;
    if(pooledCache !== null){
        root.pooledCacheLanes |= renderLanes;
    }
}

export function restoreSpawnedCachePool(
    offscreenWip,
    prevCachePool
){
    const nextParentCache = CacheContext._currentValue;
    if (nextParentCache !== prevCachePool.parent){
        return null;
    } else {
        push(prevFreshCacheOnStack, pooledCache);
        pooledCache = prevCachePool.pool;

        return prevCachePool;
    }
}

let _suspendedPooledCache = null;

export function popCachePool(workInProgress){
    _suspendedPooledCache = pooledCache;
    pooledCache = prevFreshCacheOnStack.current;
    pop(prevFreshCacheOnStack, workInProgress);
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