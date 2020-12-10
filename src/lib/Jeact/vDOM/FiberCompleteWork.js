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
  createTextInstance,
  appendInitialChild,
  finalizeInitialChildren,
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

function appendAllChildren(parent, workInProgress, needsVisibilityToggle=false, isHidden=false){
  let node = workInProgress.child;
  if (node!==null){
    console.error('appendAllChildren1')
  }
}

export function completeWork(
  alternate,
  workInProgress,
  renderLanes
){
  const newProps = workInProgress.pendingProps;
  switch(workInProgress.tag){
    // case FunctionComponent:
    //   return null;
    // case HostRoot:{//3
    //   popHostContainer(workInProgress);
    //   const fiberRoot = workInProgress.stateNode;

    //   if (fiberRoot.pendingContext){
    //     console.error('completeWork1')
    //   }
    //   updateHostContainer(workInProgress);
    //   return null;
    // }
    case HostComponent:{//5
      popHostContext(workInProgress);
      const rootContainerInstance = getRootHostContainer();
      const type = workInProgress.type;

      if (alternate!== null){// which case?
        console.error('completeWork2')
      } else{
        const currentHostContext = getHostContext();
        const instance = createInstance(
          type,
          rootContainerInstance,
        );

        appendAllChildren(instance, workInProgress);

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
    //     console.error('HostText1')
    //   } else {
    //     if (typeof newText !== 'string'){
    //       console.error('HostText2', newText)
    //     }
    //     const rootContainerInstance = getRootHostContainer();
    //     const currentHostContext = getHostContext();
    //     workInProgress.stateNode = createTextInstance(
    //       newText,
    //       rootContainerInstance,
    //       currentHostContext,
    //       workInProgress,
    //     );
    //   }
    //   return null;
    // }
    default:
      console.error('completeWork', workInProgress)
  }
}

function updateHostContainer(workInProgress){
  const childrenUnchanged = workInProgress.firstEffect === null;
  if(childrenUnchanged){

  } else {
    console.error('updateHostContainer1')  
  }
}


