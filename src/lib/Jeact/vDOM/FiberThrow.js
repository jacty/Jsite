import {
    Incomplete,
    FunctionComponent,
    SuspenseComponent,
    ShouldCapture,
} from '@Jeact/shared/Constants';
import {
    suspenseStackCursor, 
    InvisibleParentSuspenseContext,
    shouldCaptureSuspense,
} from '@Jeact/vDOM/FiberSuspenseContext';
import {
    renderDidError,
    pingSuspendedRoot,
} from '@Jeact/vDOM/FiberWorkLoop';

function attachPingListener(root, wakeable, lanes){
    let pingCache = root.pingCache;
    let threadIDs;
    if (pingCache === null){
        pingCache = root.pingCache = new WeakMap();
        threadIDs = new Set();
        pingCache.set(wakeable, threadIDs);
    } else {
        threadIDs = pingCache.get(wakeable);
        if(threadIDs === undefined){
            threadIDs = new Set();
            pingCache.set(wakeable, threadIDs);
        }
    }
    if (!threadIDs.has(lanes)){
        threadIDs.add(lanes);
        const ping = pingSuspendedRoot.bind(null, root, wakeable, lanes);
        wakeable.then(ping, ping);
    }
}

export function throwException(
    root, 
    returnFiber, 
    sourceFiber,
    value,
    rootRenderLanes
){
    sourceFiber.flags |= Incomplete;
    
    if(
        value !==null &&
        typeof value === 'object' &&
        typeof value.then === 'function'
    ){
        const wakeable = value;

        // hasSuspenseContext()
        const hasInvisibleParent = 
                (suspenseStackCursor.current & 
                InvisibleParentSuspenseContext) !== 0;
        // Schedule the nearest Suspense to re-render the timed out view.
        let wip = returnFiber;
        do {
            if(
                wip.tag === SuspenseComponent &&
                shouldCaptureSuspense(
                    wip, 
                    hasInvisibleParent
                )
            ){
                // Found the nearest boundary.
                //
                // Stash the promise.
                const wakeables = wip.updateQueue;
                if (wakeables === null){
                    const updateQueue = new Set();
                    updateQueue.add(wakeable)
                    wip.updateQueue = updateQueue;
                } else {
                    wakeables.add(wakeable);
                }

                attachPingListener(root, wakeable, rootRenderLanes);

                wip.flags |= ShouldCapture;
                wip.lanes = rootRenderLanes;

                return;
            }

            wip = wip.return;
        } while (wip !== null);
        console.error('Component suspended while rendering but no fallback UI was specified.');
    }
    renderDidError();//update exit status
}