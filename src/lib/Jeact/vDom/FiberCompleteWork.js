import {
  FunctionComponent,
  HostText,
  HostComponent,
//   NoFlags,
//   NoLanes,
  HostRoot,
} from '@Jeact/shared/Constants';
import {
  getRootHostContainer
//   popHostContainer
} from '@Jeact/vDom/FiberHostContext';
// import {
//   mergeLanes
// } from './JeactFiberLane';
import {
  createElement
} from '@Jeact/vDom/DOMComponent';


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
  while (node!==null){
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
      const fiberRoot = workInProgress.stateNode;
      if (fiberRoot.pendingContext){
        console.error('completeWork1')
      }
      return null;
    }
    case HostComponent:{
      const rootContainerInstance = getRootHostContainer();
      const type = workInProgress.type;
      if (current!== null){
        console.error('completedWork2')
      } else{
        const instance = createInstance(
          type,
          newProps,
          rootContainerInstance,
          'currentHostContext',
          workInProgress
        );

        appendAllChildren(instance, workInProgress, false, false);
        workInProgress.stateNode = instance;
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

export function createInstance(
  type,
  props, 
  rootContainerInstance,
  hostContext,
  interalInstancedHandle
){
  const domElement = createElement(
    type,
    props,
    rootContainerInstance,
    'parentNamespace'
  )

  return domElement;
}