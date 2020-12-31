import {
  FunctionComponent,
  HostText,
  HostComponent,
  HostRoot,
  NoLanes,
  NoFlags,
  Snapshot,
} from '@Jeact/shared/Constants';
import {
  getRootHostContainer,
} from '@Jeact/vDOM/FiberHostContext';
import {
  mergeLanes
} from '@Jeact/vDOM/FiberLane';
import { 
  createTextNode, 
  createElement,
  setInitialDOMProperties,
} from '@Jeact/vDOM/DOMComponent';

function appendAllChildren(parent, workInProgress){
  let childFiber = workInProgress.child;
  while (childFiber!==null){
    if (childFiber.tag === HostComponent || childFiber.tag === HostText){
      let domInstance = childFiber.stateNode;
      parent.appendChild(domInstance);
    }

    if (childFiber.sibling === null){
        return;
    }

    childFiber = childFiber.sibling;
  }
};

export function completeWork(workInProgress,renderLanes){
  const newProps = workInProgress.pendingProps;
  switch(workInProgress.tag){
    case FunctionComponent://0
      return null;
    case HostRoot:{//3
      const fiberRoot = workInProgress.stateNode;
      const current = workInProgress.alternate;
      if (current === null || current.child === null){
        // schedule an effect to clear this container at the start of next commit. 
        workInProgress.flags |= Snapshot;
      }
      return null;
    }
    case HostComponent:{//5
      const rootContainerInstance = getRootHostContainer();
      const type = workInProgress.type;
      const instance = createElement(
        type,
        rootContainerInstance,
      );

      appendAllChildren(instance, workInProgress);
      setInitialDOMProperties(instance, workInProgress.pendingProps) 
      workInProgress.stateNode = instance;
      
      return null;
    }
    case HostText: {//6
      const newText = newProps;
      const rootContainerInstance = getRootHostContainer();
      workInProgress.stateNode = createTextNode(
        newText,
        rootContainerInstance,
      );
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


