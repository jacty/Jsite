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


function updateFunctionComponent(alternate,workInProgress,renderLanes){

  let nextChildren = renderWithHooks(
    alternate,
    workInProgress,
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
  const prevState = workInProgress.memoizedState;
  const prevChildren = prevState !== null ? prevState.element : null;

  //update wip.lanes, wip.memoizedState;
  processUpdateQueue(workInProgress, renderLanes);
  const nextChildren = workInProgress.memoizedState;

  workInProgress.child = reconcileChildFibers(
      workInProgress,
      alternate === null ? alternate : alternate.child,
      nextChildren,
      renderLanes,
  );
  return workInProgress.child;
}

function updateHostComponent(alternate, workInProgress,renderLanes){
  const type = workInProgress.type;
  const nextProps = workInProgress.pendingProps;
  const prevProps = alternate !== null ? alternate.memoizedProps : null;

  let nextChildren = nextProps.children;

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
    if (oldProps !== newProps){
      console.error('beginWork1', workInProgress)
    }
  }  

  switch (workInProgress.tag){
    case FunctionComponent:{//0
      return updateFunctionComponent(
        alternate,
        workInProgress,
        renderLanes,
      );
    }
    case HostRoot://3
      return updateHostRoot(alternate, workInProgress, renderLanes);
    case HostComponent://5
      return updateHostComponent(alternate, workInProgress, renderLanes);
    // case HostText://6
    //   return updateHostText(workInProgress);
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