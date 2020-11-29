import {
  __ENV__,
  HostRoot,
  HostComponent,
  FunctionComponent,
  NoLanes,
  PerformedWork,
} from '@Jeact/shared/Constants';
import {
  includesSomeLane,
} from '@Jeact/vDOM/FiberLane';
import {
  hasContextChanged,
} from '@Jeact/vDOM/FiberContext';
import {
  prepareToReadContext
} from '@Jeact/vDOM/FiberNewContext';
import {
  pushHostContext,
  pushHostContainer
} from '@Jeact/vDOM/FiberHostContext';
import {
  mountChildFibers,
  reconcileChildFibers,
} from '@Jeact/vDOM/ChildFiber';
import {
  processUpdateQueue,
  cloneUpdateQueue,
} from '@Jeact/vDOM/UpdateQueue';
import {renderWithHooks} from '@Jeact/vDOM/FiberHooks';

let didReceiveUpdate = false;

export function reconcileChildren(workInProgress, nextChildren, renderLanes){
  const current = workInProgress.alternate;
  if (current === null){
    // If this is a fresh new component that hasn't been rendered yet, we
    // won't update its child set by applying minimal side-effects. Instead,
    // we will add them all to the child before it gets rendered. That means
    // we can optimize this reconciliation pass by not tracking side-effects.
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderLanes,
    );
  } else {
    // If the current child is the same as the work in progress, it means that
    // we haven't yet started any work on these children. Therefore, we use the
    // clone algorithm to create a copy of all the current children.

    // If we had any progressed work already, that is invalid at this point so
    // let's throw it out.
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
      renderLanes,
    );
  }
}

function markRef(current, workInProgress){
  const ref = workInProgress.ref;
  if (
    (current === null && ref !== null) ||
    (current !== null && current.ref !== ref)
  ){
    workInProgress.flags |= Ref;
  }
}

function updateFunctionComponent(
  current,
  workInProgress,
  Component,
  nextProps,
  renderLanes
  ){
  if (__ENV__){
    if (workInProgress.type !== workInProgress.elementType){
      console.error('updateFunctionComponent1');
    }
  }
  let context;
  prepareToReadContext(workInProgress, renderLanes);
  let nextChildren = renderWithHooks(
    current,
    workInProgress,
    Component,
    nextProps,
    context,
    renderLanes,
    )

  if (current!==null){
    console.error('updateFunctionComponent2')
  };

  workInProgress.flags |= PerformedWork;
  reconcileChildren(workInProgress, nextChildren, renderLanes);

  return workInProgress.child;
}

function updateHostRoot(workInProgress, renderLanes){
  const root = workInProgress.stateNode;
  pushHostContainer(workInProgress);
  const nextProps = workInProgress.pendingProps;
  const prevState = workInProgress.memoizedState;
  const prevChildren = prevState !== null ? prevState.element : null;
  //To make updateQueue in wip and wip.alternate point to different objects in memory. but why?
  cloneUpdateQueue(workInProgress);
  //update wip.lanes, wip.memoizedState;
  processUpdateQueue(workInProgress, nextProps, null, renderLanes);
  const nextState = workInProgress.memoizedState;
  const nextChildren = nextState.element;
  if (nextChildren === prevChildren){
    console.error('updateHostRoot1')
  }
  reconcileChildren(workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}

function updateHostComponent(workInProgress,renderLanes){
  pushHostContext(workInProgress);

  const current = workInProgress.alternate; 

  const type = workInProgress.type;
  const nextProps = workInProgress.pendingProps;
  const prevProps = current !== null ? current.memoizedProps : null;

  let nextChildren = nextProps.children;
  const isDirectTextChild = shouldSetTextContent(type, nextProps);

  if (isDirectTextChild){
    nextChildren = null;
  } else if(prevProps !== null && shouldSetTextContent(type, prevProps)){
    console.error('updateHostComponent2')
  }
  markRef(current, workInProgress);

  reconcileChildren(workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}


export function beginWork(workInProgress, renderLanes){
  const alternate = workInProgress.alternate;
  const updateLanes = workInProgress.lanes;
  if (__ENV__){
    if(workInProgress._debugNeedsRemount){
      console.error('beginWork1')
    }
  }
  if (alternate !== null){
    const oldProps = alternate.memoizedProps;
    const newProps = workInProgress.pendingProps;
    if (
      oldProps !== newProps || 
      hasContextChanged() ||
      // Force a re-render if the implementation changed due to hot reload:
      (__ENV__ ? workInProgress.type !== alternate.type : false)
      ){
      console.error('beginWork1', workInProgress)
    } else if(!includesSomeLane(renderLanes, updateLanes)){
      console.error('beginWork2', workInProgress);
      return;
      didReceiveUpdate = false;
      // This fiber does not have any pending work. Bailout without entering
      // the begin phase. There's still some bookkeeping we that needs to be
      // done in this optimized path, mostly pushing stuff on the stack.
      switch (workInProgress.tag){
        case HostRoot:
          pushHostRootContext(workInProgress);
          break;
        default:
          console.error('beginWork3', workInProgress.tag)
      }
      return bailoutOnAlreadyFinishedWork(alternate, workInProgress, renderLanes);
    } else {
      // An update was scheduled on this fiber, but there are no new props
      // nor legacy context. Set this to false. If an update queue or context
      // consumer produces a changed value, it will set this to true.
      // Otherwise, the component will assume the children have not changed
      // and bail out.
      didReceiveUpdate = false;
    }
  } else {
    didReceiveUpdate = false;
  }
   
  workInProgress.lanes = NoLanes; // Why?   

  switch (workInProgress.tag){
    // case IndeterminateComponent:{//2
    //   return mountIndeterminateComponent(
    //     alternate,
    //     workInProgress,
    //     workInProgress.type,
    //     renderLanes,
    //   );
    // }
    case FunctionComponent:{//0
      const Component = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      const resolvedProps =
        workInProgress.elementType === Component
        ? unresolvedProps
        : resolveDefaultProps(Component, unresolvedProps);
      return updateFunctionComponent(
        alternate,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes,
      );
    }
    case HostRoot://3
      return updateHostRoot(workInProgress, renderLanes);
    case HostComponent://5
      return updateHostComponent(workInProgress, renderLanes);
    // case HostText:
      // return updateHostText(alternate, workInProgress);
    default:
      console.error('beginWork4', workInProgress.tag);
  }
}

function shouldSetTextContent(type, props){
  return (
    type === 'textarea' ||
    type === 'option' ||
    type === 'noscript' ||
    typeof props.children === 'string' ||
    typeof props.children === 'number' ||
    (typeof props.dangerouslySetInnerHTML === 'object' &&
      props.dangerouslySetInnerHTML !== null &&
      props.dangerouslySetInnerHTML.__html != null)
  );
}