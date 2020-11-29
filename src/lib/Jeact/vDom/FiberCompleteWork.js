import {
  FunctionComponent,
  HostText,
  HostComponent,
  Snapshot,
  HostRoot,
} from '@Jeact/shared/Constants';
import {
  getRootHostContainer,
  popHostContext,
  getHostContext,
  popHostContainer,
} from '@Jeact/vDOM/FiberHostContext';

import {
  createInstance,
  finalizeInitialChildren
} from '@Jeact/vDOM/FiberHost';


function bubbleProperties(completedWork){
  console.error('bubbleProperties');
  return;
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

function appendAllChildren(parent, workInProgress, needsVisibilityToggle, isHidden){
  let node = workInProgress.child;
  if (node!==null){
    console.error('appendAllChildren1', node)
  }
}

export function completeWork(
  workInProgress,
  renderLanes
  ){
  const current = workInProgress.alternate;
  const newProps = workInProgress.pendingProps;

  switch(workInProgress.tag){
    // case FunctionComponent:
    //   bubbleProperties(workInProgress)
    //   return null;
    case HostRoot:{//3
      popHostContainer(workInProgress);
      const fiberRoot = workInProgress.stateNode;
      if (fiberRoot.pendingContext){
        console.error('completeWork1')
      }
      if(current === null || current.child === null){
        workInProgress.flags |= Snapshot;
      }
      return null;
    }
    case HostComponent:{//5
      popHostContext(workInProgress);
      const rootContainerInstance = getRootHostContainer();
      const type = workInProgress.type;
      if (current!== null){
        console.error('completeWork2')
      } else{
        if(!newProps){
          workInProgress.stateNode === null
          ? console.error('completeWork3'):''
        }

        const currentHostContext = getHostContext();
        const instance = createInstance(
          type,
          newProps,
          rootContainerInstance,
          currentHostContext,
          workInProgress
        );
        appendAllChildren(instance, workInProgress, false, false);

        workInProgress.stateNode = instance;
        if(finalizeInitialChildren(
            instance,
            type,
            newProps, 
            rootContainerInstance
          )){
            console.error('completeWork4')
          markUpdate(workInProgress)
        }

        if(workInProgress.ref !== null){
          console.error('completeWork5')
        }
      }
      return null;
    }
    // case HostText: {
    //   const newText = newProps;
    //   if(current){
    //     console.error('HostText')
    //   } else {

    //   }
    //   console.error('HostText', workInProgress.stateNode);
    // }
    default:
      console.error('completeWork', workInProgress.tag)
  }
}


