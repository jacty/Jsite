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
import {
  precacheFiberNode,
  updateFiberProps
} from '@Jeact/vDOM/DOMComponentTree';

function appendAllChildren(parent, workInProgress){
  let node = workInProgress.child;
  while (node!==null){
    if (node.tag === HostComponent || node.tag === HostText){
      let domInstance = node.stateNode;
      parent.appendChild(domInstance);
    } else if (node.child !== null){
      /*  <DOM>
       *       <Function Component > <- childFiber
       *          <Dom></Dom>
       *       </Function Component>
       *  </DOM>
       */
      node.child.return = node;
      node = node.child;
      continue;
    }
    if (node === workInProgress) {
      return;
    }
    while (node.sibling === null){
      // when node's parent has siblings
      if (node.return === workInProgress){
        return;
      }
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
};

function bubbleProperties(completedWork){
  const didBailout = completedWork.alternate !== null && 
    completedWork.alternate.child === completedWork.child;

    let newChildLanes = NoLanes;
    let subtreeFlags = NoFlags;

  if (!didBailout){
    let child = completedWork.child;
    if (child !== null){
      console.error('x');
    }
    completedWork.subtreeFlags |= subtreeFlags;
  } else {
    console.error('x');
  }

  completedWork.childLanes = newChildLanes;
}

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
      if(workInProgress.alternate !== null && workInProgress.stateNode !== null){
        console.error('completeWork')
      }

      const instance = createElement(
        type,
        rootContainerInstance,
      );
      
      precacheFiberNode(workInProgress, instance);
      updateFiberProps(instance, newProps);

      appendAllChildren(instance, workInProgress);
      setInitialDOMProperties(instance, workInProgress) 
      
      workInProgress.stateNode = instance;
      bubbleProperties(workInProgress);
      return null;
    }
    case HostText: {//6
      const newText = newProps;
      if (workInProgress.alternate& workInProgress.stateNode!==null){
        console.error('x');
      }
      const rootContainerInstance = getRootHostContainer();
      const instance = createTextNode(
        newText,
        rootContainerInstance,
      );
      workInProgress.stateNode = instance;
      precacheFiberNode(workInProgress, instance)
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


