import {
    Incomplete,
    FunctionComponent,
    SuspenseComponent,
    HostRoot,
    ShouldCapture,
    NoTimestamp,
    CaptureUpdate,
} from '@Jeact/shared/Constants';
import {
    suspenseStackCursor, 
    InvisibleParentSuspenseContext
} from '@Jeact/vDOM/FiberSuspenseContext';
import {
    getHighestPriorityLane,
    mergeLanes,
} from '@Jeact/vDOM/FiberLane';
import {
    createUpdate,
    enqueueCapturedUpdate,
} from '@Jeact/vDOM/UpdateQueue';

function createRootErrorUpdate(fiber, errorInfo, lane){
    const update = createUpdate(NoTimestamp, lane);
    update.tag = CaptureUpdate;
    update.payload = {element: null};
    update.callback = ()=>{
        debugger;
    }
    return update;
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

        value = new Error('Component suspended while rendering but no fallback UI was specified.');
    }
    //createCapturedValue()
    value = {
        value,
        sourceFiber
    }
    let wip = returnFiber;
    do{
        switch (wip.tag){
            case HostRoot:{
                const errorInfo = value;
                wip.flags |= ShouldCapture;
                const lane = getHighestPriorityLane(rootRenderLanes);
                wip.lanes = mergeLanes(wip.lanes , lane);
                const update = createRootErrorUpdate(wip, errorInfo, lane);
                enqueueCapturedUpdate(wip, update);
            }
            default:
                break;
        }
        wip = wip.return;
    } while (wip !== null);
}