import {createCursor} from '@Jeact/vDOM/FiberStack';

const DefaultSuspenseContext = 0b00;

// The Suspense Context is split into two parts. The lower bits is inherited 
// deeply down the subtree. The upper bits only affect this immediate suspense 
// boundary and gets reset each new boundary.
export const SubtreeSuspenseContextMask = 0b01;

// InvisibleParentSuspenseContext indicates that one of our parent Suspense 
// boundaries is not currently showing visible main content.
// Either because it is already showing a fallback or is not mounted at all.
// We can use this to determine if it is desirable to trigger a fallback at
// the parent. If not, then we might need to trigger undesirable boundaries
// and/or suspend the commit to avoid hiding the parent content. 
export const InvisibleParentSuspenseContext = 0b01;

export const ForceSuspenseFallback = 0b10;
export const suspenseStackCursor = createCursor(DefaultSuspenseContext);

export function hasSuspenseContext(
    parentContext,
    flag
){
    return (parentContext & flag) !== 0;
}

export function setDefaultShallowSuspenseContext(
    parentContext
){
    return parentContext & SubtreeSuspenseContextMask;
}

export function addSubtreeSuspenseContext(
    parentContext,
    subtreeContext
){
    return parentContext | subtreeContext;
}

export function shouldCaptureSuspense(
    workInProgress,
    hasInvisibleParent
){
    const nextState = workInProgress.memoizedState;
    if (nextState !== null){
        debugger;
        return false;
    }
    const props = workInProgress.memoizedProps;
    if(props.fallback === undefined){
        return false;
    }

    if (props.avoid !== true){
        return true;
    }

    // If it's a boundary we should avoid, then we prefer to bubble up to the 
    // parent boundary if it is currently invisible.
    if (hasInvisibleParent){
        return false;
    }
    // If the parent is not able to handle it, we must handle it.
    return true;
}
