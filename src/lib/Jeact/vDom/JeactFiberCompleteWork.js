import {
  IndeterminateComponent,
  FunctionComponent,
  NoFlags,
  NoLanes,
  HostRoot,
} from '../shared/Constants';
import {
  popHostContainer
} from './JeactFiberHostContext';
import { resetWorkInProgressVersions } from './JeactMutableSource';
import {
  mergeLanes
} from './JeactFiberLane';
function updateHostContainer(){

};
function bubbleProperties(completedWork){
  const didBailout =
    completedWork.alternate !== null &&
    completedWork.alternate.child === completedWork.child;

  let newChildLanes = NoLanes;
  let subtreeFlags = NoFlags;

  if (!didBailout){
    let child = completedWork.child;
    if(child!==null){
      newChildLanes = mergeLanes(
        newChildLanes,
        mergeLanes(child.lanes, child.childLanes),
      );

      subtreeFlags |= child.subtreeFlags;
      subtreeFlags |= child.flags;

      child = child.sibling;
    }
    completedWork.subtreeFlags |= subtreeFlags;
  } else {
    console.error('bubbleProperties1')
  }

  completedWork.childLanes = newChildLanes;

  return didBailout;
}

export function completeWork(
  current,
  workInProgress,
  renderLanes
  ){
  const newProps = workInProgress.pendingProps;

  switch(workInProgress.tag){
    case IndeterminateComponent:
    case FunctionComponent:
      bubbleProperties(workInProgress)
      return null;
    case HostRoot:{
      popHostContainer(workInProgress);
      resetWorkInProgressVersions()
      const fiberRoot = workInProgress.stateNode;
      if (fiberRoot.pendingContext){
        console.error('completeWork1')
      }
      updateHostContainer(current, workInProgress);
      bubbleProperties(workInProgress)
      return null;
    }
    default:
      console.error('completeWork', workInProgress.tag, HostRoot)
  }
}
