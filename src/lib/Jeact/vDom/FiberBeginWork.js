import {
  includesSomeLane,
} from '@Jeact/vDom/FiberLane';
import {
  hasContextChanged,
} from '@Jeact/vDom/FiberContext';
import {
  prepareToReadContext
} from '@Jeact/vDom/FiberNewContext';
import { renderWithHooks } from '@Jeact/vDom/FiberHooks';
import {
  pushHostContext,
  pushHostContainer
} from '@Jeact/vDom/FiberHostContext';
import {
//   __ENV__,
  HostRoot,
//   NoLanes,
  IndeterminateComponent,
  FunctionComponent,
  PerformedWork,
  HostComponent,
  HostText,
} from '@Jeact/shared/Constants';
import {
  mountChildFibers,
  reconcileChildFibers,
} from '@Jeact/vDom/ChildFiber';
import {
  cloneUpdateQueue,
  processUpdateQueue,
} from '@Jeact/vDom/UpdateQueue';
import {
  markSkippedUpdateLanes,
} from '@Jeact/vDom/FiberWorkLoop';

let didReceiveUpdate = false;

export function reconcileChildren(current, workInProgress, nextChildren, renderLanes){
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

function updateFunctionComponent(
  current,
  workInProgress,
  Component,
  nextProps,
  renderLanes
  ){
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
    console.error('updateFunctionComponent')
  };
  workInProgress.flags |= PerformedWork;

  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}

function pushHostRootContext(workInProgress){
  const root = workInProgress.stateNode;

  if(root.pendingContext){
    console.error('pushHostRootContext1');
  }
  // push and pop Stacks.
  pushHostContainer(workInProgress, root.containerInfo);
}

function updateHostRoot(current, workInProgress, renderLanes){
  pushHostRootContext(workInProgress);

  const updateQueue = workInProgress.updateQueue;
  const nextProps = workInProgress.pendingProps;
  const prevState = workInProgress.memoizedState;
  const prevChildren = prevState !== null ? prevState.element : null;

  cloneUpdateQueue(current, workInProgress);//Why?
  processUpdateQueue(workInProgress, nextProps, null, renderLanes);

  const nextState = workInProgress.memoizedState;

  const nextChildren = nextState.element;
  if (nextChildren === prevChildren){
    console.error('updateHostRoot1')
  }
  const root = workInProgress.stateNode;

  reconcileChildren(current, workInProgress, nextChildren, renderLanes);

  return workInProgress.child;
}

function updateHostComponent(
  current,
  workInProgress,
  renderLanes
){
  const type = workInProgress.type;
  const nextProps = workInProgress.pendingProps;
  const prevProps = current !== null ? current.memoizedProps : null;

  let nextChildren = nextProps.children;
  const isDirectTextChild = shouldSetTextContent(type, nextProps);
  if (isDirectTextChild){
    console.error('updateHostComponent1')
  } else if(prevProps !== null && shouldSetTextContent(type, prevProps)){
    console.error('updateHostComponent2')
  }
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}

function updateHostText(current, workInProgress){
  return null;
}

function mountIndeterminateComponent(
  _current,
  workInProgress,
  Component,
  renderLanes,
  ){

  if (_current !== null){
    console.error('mountIndeterminateComponent1')
  }

  const props = workInProgress.pendingProps;
  let context;
  prepareToReadContext(workInProgress, renderLanes);
  let value = renderWithHooks(
    null,
    workInProgress,
    Component,
    props,
    context,
    renderLanes,
  );

  workInProgress.flags |= PerformedWork;
  workInProgress.tag = FunctionComponent;
  reconcileChildren(null, workInProgress, value, renderLanes);

  return workInProgress.child;
}

function bailoutOnAlreadyFinishedWork(
  current,
  workInProgress,
  renderLanes,
  ){

  if (current !== null){
    // Reuse previous dependencies
    workInProgress.dependencies = current.dependencies;
  }

  markSkippedUpdateLanes(workInProgress.lanes);
  console.error('bailoutOnAlreadyFinishedWork', workInProgress);
  return;
  // Check if the children have any pending work.
  if (!includesSomeLane(renderLanes, workInProgress.childLanes)){
    // The children don't have any work either. We can skip  them.
    // TODO: Once we add back resuming, we should check if the children are
    // a work-in-progress set. If so, we need to transfer their effects.
    return null;
  } else{
    console.error('bailoutOnAlreadyFinishedWork1')
  }
}

export function beginWork(alternate, workInProgress, renderLanes){
  const updateLanes = workInProgress.lanes;
  if (alternate !== null){
    const oldProps = alternate.memoizedProps;
    const newProps = workInProgress.pendingProps;

    if (oldProps !== newProps || hasContextChanged()){
      console.error('beginWork1')
    } else if(!includesSomeLane(renderLanes, updateLanes)){
      console.error('beginWork2');
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
  switch (workInProgress.tag){
    case IndeterminateComponent:{//2
      return mountIndeterminateComponent(
        alternate,
        workInProgress,
        workInProgress.type,
        renderLanes,
      );
    }
    case FunctionComponent:{//0
      console.error('FunctionComponent')
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
      // find child of root
      return updateHostRoot(alternate, workInProgress, renderLanes);
    case HostComponent:
      return updateHostComponent(alternate, workInProgress, renderLanes);
    case HostText:
      return updateHostText(alternate, workInProgress);
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