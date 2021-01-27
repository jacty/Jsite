import {
  __ENV__,
  HostRoot,
  HostText,
  HostComponent,
  FunctionComponent,
  NoLanes,
  PerformedWork,
  Ref,
} from '@Jeact/shared/Constants';
import {
  CurrentOwner
} from '@Jeact/shared/internals';
import {
  includesSomeLane,
} from '@Jeact/vDOM/FiberLane';
import {
  reconcileChildFibers,
} from '@Jeact/vDOM/ChildFiber';
import {
  processUpdateQueue,
} from '@Jeact/vDOM/UpdateQueue';
import {renderWithHooks} from '@Jeact/vDOM/FiberHooks';
import { pushHostContainer } from '@Jeact/vDOM/FiberHostContext';
import { shouldSetTextContent } from '@Jeact/vDOM/DOMComponent';
let didReceiveUpdate = false;

function markRef(current, workInProgress){
  const ref = workInProgress.ref;
  if(
      (current === null && ref!== null) ||
      (current !== null && current.ref !== ref)
  ){
    workInProgress.flags |= Ref;
  } 
}

function updateFunctionComponent(alternate,workInProgress,renderLanes){

  let nextChildren = renderWithHooks(
    alternate,
    workInProgress,
    renderLanes,
  );
  
  if(alternate!==null){
    console.error('updateFunctionComponent1')
  }

  workInProgress.flags |= PerformedWork;
  workInProgress.child = reconcileChildFibers(
      workInProgress,
      alternate,
      nextChildren,
      renderLanes,
      alternate
    );

  return workInProgress.child;
}

function updateHostRoot(current, workInProgress, renderLanes){
  // push host container like div#root into stack, so we can get it to refer in any depth when we are reconcile fiber children.
  pushHostContainer(workInProgress);
  const prevState = workInProgress.memoizedState;
  const prevChildren = prevState !== null ? prevState.element : null;

  //update wip.lanes, wip.memoizedState;
  processUpdateQueue(workInProgress, renderLanes);
  const nextChildren = workInProgress.memoizedState;

  workInProgress.child = reconcileChildFibers(
      workInProgress,
      current,
      nextChildren,
      renderLanes,
      current
  );
  return workInProgress.child;
}

function updateHostComponent(alternate, workInProgress,renderLanes){
  const type = workInProgress.type;
  const nextProps = workInProgress.pendingProps;
  const prevProps = alternate !== null ? alternate.memoizedProps : null;

  let nextChildren = nextProps.children;
  const isDirectTextChild = shouldSetTextContent(type, nextProps);
  if (isDirectTextChild){
    // Handle direct text node in host environment to avoid another traversing.
    nextChildren = null;
  } else if(prevProps !== null && shouldSetTextContent(type, prevProps)) {
    console.error('updateHostComponent1')
  }
  // markRef(alternate, workInProgress);
  
  workInProgress.child = reconcileChildFibers(
      workInProgress,
      alternate,
      nextChildren,
      renderLanes,
      alternate
    );

  return workInProgress.child;
}
// Iterate from parent fibers to child fibers(including sibling fibers) to build the whole fiber chain.
export function beginWork(current, workInProgress, renderLanes){
  const updateLanes = workInProgress.lanes;
  if(current!==null){
    const oldProps = current.memoizedProps;
    const newProps = workInProgress.pendingProps;
    if(oldProps !== newProps){
      console.log('beginWork1')
    } else if(!includesSomeLane(renderLanes, updateLanes)){
      console.log('beginWork2');
    }
  }
  switch (workInProgress.tag){
    case FunctionComponent://0
      return updateFunctionComponent(current,workInProgress,renderLanes);
    case HostRoot://3
      return updateHostRoot(current, workInProgress, renderLanes);
    case HostComponent://5
      return updateHostComponent(current, workInProgress, renderLanes);
    case HostText://6
      return null;
    default:
      console.error('beginWork4', workInProgress);
  }
}

