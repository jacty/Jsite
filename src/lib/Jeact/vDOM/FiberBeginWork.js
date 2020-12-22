import {
  __ENV__,
  HostRoot,
  HostText,
  HostComponent,
  FunctionComponent,
  NoLanes,
  PerformedWork,
} from '@Jeact/shared/Constants';
import {
  CurrentOwner
} from '@Jeact/shared/internals';
import {
  includesSomeLane,
} from '@Jeact/vDOM/FiberLane';
import {
  pushHostContext,
  pushHostContainer
} from '@Jeact/vDOM/FiberHostContext';
import {
  reconcileChildFibers,
} from '@Jeact/vDOM/ChildFiber';
import {
  processUpdateQueue,
} from '@Jeact/vDOM/UpdateQueue';
import {renderWithHooks} from '@Jeact/vDOM/FiberHooks';

let didReceiveUpdate = false;


function updateFunctionComponent(
  alternate,
  workInProgress,
  Component,
  nextProps,
  renderLanes
){

  let nextChildren = renderWithHooks(
    alternate,
    workInProgress,
    Component,
    nextProps,
    null,
    renderLanes,
  );

  if (alternate!==null){
    console.error('updateFunctionComponent2')
  };

  workInProgress.flags |= PerformedWork;
  workInProgress.child = reconcileChildFibers(
      workInProgress,
      alternate === null ? alternate : alternate.child,
      nextChildren,
      renderLanes,
    );

  return workInProgress.child;
}

function updateHostRoot(alternate, workInProgress, renderLanes){
  pushHostContainer(workInProgress);
  const prevState = workInProgress.memoizedState;
  const prevChildren = prevState !== null ? prevState.element : null;

  //update wip.lanes, wip.memoizedState;
  processUpdateQueue(workInProgress, renderLanes);
  const nextState = workInProgress.memoizedState;
  const nextChildren = nextState.element;

  workInProgress.child = reconcileChildFibers(
      workInProgress,
      alternate === null ? alternate : alternate.child,
      nextChildren,
      renderLanes,
  );
  return workInProgress.child;
}

function updateHostComponent(alternate, workInProgress,renderLanes){
  pushHostContext(workInProgress);

  const type = workInProgress.type;
  const nextProps = workInProgress.pendingProps;
  const prevProps = alternate !== null ? alternate.memoizedProps : null;

  let nextChildren = nextProps.children;
  const isDirectTextChild = shouldSetTextContent(type, nextProps);

  if (isDirectTextChild){
    nextChildren = null;
  } else if(prevProps !== null && shouldSetTextContent(type, prevProps)){
    console.error('updateHostComponent2')
  }

  workInProgress.child = reconcileChildFibers(
      workInProgress,
      alternate === null ? alternate : alternate.child,
      nextChildren,
      renderLanes,
    );

  return workInProgress.child;
}

function updateHostText(current, workInProgress){
  return null;
}

export function beginWork(alternate, workInProgress, renderLanes){
  const updateLanes = workInProgress.lanes;

  if (alternate !== null){
    const oldProps = alternate.memoizedProps;
    const newProps = workInProgress.pendingProps;
    if (
      oldProps !== newProps || 
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
  switch (workInProgress.tag){
    case FunctionComponent:{//0
      const Component = workInProgress.type;
      const props = workInProgress.pendingProps;
      return updateFunctionComponent(
        alternate,
        workInProgress,
        Component,
        props,
        renderLanes,
      );
    }
    case HostRoot://3
      return updateHostRoot(alternate, workInProgress, renderLanes);
    case HostComponent://5
      return updateHostComponent(alternate, workInProgress, renderLanes);
    case HostText://6
      return updateHostText(workInProgress);
    default:
      console.error('beginWork4', workInProgress);
  }
}

function shouldSetTextContent(type, props){
  return (
    typeof props.children === 'string' ||
    typeof props.children === 'number' ||
    (typeof props.dangerouslySetInnerHTML === 'object' &&
      props.dangerouslySetInnerHTML !== null &&
      props.dangerouslySetInnerHTML.__html != null)
  );
}