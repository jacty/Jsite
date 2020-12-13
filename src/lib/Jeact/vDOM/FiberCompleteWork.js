import {
  FunctionComponent,
  HostText,
  HostComponent,
  HostRoot,
  NoLanes,
  NoFlags,
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
import {
  mergeLanes
} from '@Jeact/vDOM/FiberLane';


function bubbleProperties(completedWork){

  const didBailout =
    completedWork.alternate !== null &&
    completedWork.alternate.child === completedWork.child;

  let newChildLanes = NoLanes;
  let subtreeFlags = NoFlags;

  if (!didBailout){
    let child = completedWork.child;
    while(child!==null){
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
  while (node!==null){
    if (node.tag === HostComponent || node.tag === HostText){
      let instance = node.stateNode;
      appendInitialChild(parent, instance);
    } else if (node.child !== null){
      console.error('appendAllChildren1')
    }
    if (node === workInProgress){
      return;
    }
    while (node.sibling === null){
      if (node.return === null || node.return === workInProgress){
        return;
      }
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
};

export function completeWork(
  alternate,
  workInProgress,
  renderLanes
){
  const newProps = workInProgress.pendingProps;
  switch(workInProgress.tag){
    case FunctionComponent://0
      return null;
    case HostRoot:{//3
      popHostContainer(workInProgress);
      const fiberRoot = workInProgress.stateNode;
      if (fiberRoot.pendingContext){
        console.error('completeWork1')
      }
      bubbleProperties(workInProgress);
      return null;
    }
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
      }
      return null;
    }
    case HostText: {
      const newText = newProps;
      if(alternate){
        console.error('HostText1')
      } else {
        const rootContainerInstance = getRootHostContainer();
        const currentHostContext = getHostContext();
        workInProgress.stateNode = createTextInstance(
          newText,
          rootContainerInstance,
          currentHostContext,
          workInProgress,
        );
      }
      bubbleProperties(workInProgress);
      return null;
    }
    default:
      console.error('completeWork', workInProgress)
  }
}

function updateHostContainer(workInProgress){
  const root = workInProgress.stateNode;
  const childrenUnchanged = workInProgress.firstEffect === null;
  if(childrenUnchanged){
    console.error('updateHostContainer2')
  } else {
    const container = root.containerInfo;
    const newChildSet = createContainerChildSet(container);
    console.error('updateHostContainer1')  
  }
}


