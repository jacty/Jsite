import {
    Incomplete,
    FunctionComponent,
    SuspenseComponent,
    HostRoot,
    NoTimestamp,
} from '@Jeact/shared/Constants';
import {
    suspenseStackCursor, 
    InvisibleParentSuspenseContext
} from '@Jeact/vDOM/FiberSuspenseContext';
import {createUpdate} from '@Jeact/vDOM/UpdateQueue';
import {renderDidError} from '@Jeact/vDOM/FiberWorkLoop';

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
        const tag = sourceFiber.tag;
        if(
            tag === FunctionComponent 
        ){
            debugger;
        }

        // hasSuspenseContext()
        const hasInvisibleParentBoundary = 
                suspenseStackCursor.current & InvisibleParentSuspenseContext;

        // Schedule the nearest Suspense to re-render the timed out view.
        let wip = returnFiber;
        do {
            if(
                wip.tag === SuspenseComponent 
            ){debugger}

            wip = wip.return;
        } while (wip !== null);
        console.error('Component suspended while rendering but no fallback UI was specified.');
    }
    renderDidError();//update exit status
}