import{
 HostRoot,
 ContentReset,
 HostComponent,
} from '@Jeact/shared/Constants';
import {
    appendChildToContainer
} from '@Jeact/vDOM/FiberHost';

export function commitBeforeMutationEffectOnFiber(finishedWork){
  switch(finishedWork.tag){
    case HostRoot:{
      return;
    }
  }
  console.error('commitBeforeMutationEffectOnFiber', finishedWork.tag);
}

function getHostParentFiber(fiber){
    let parent = fiber.return;
    while (parent!== null){
        if (isHostParent(parent)){
            return parent;
        }
        parent = parent.return;
    }
}

function isHostParent(fiber){
    return fiber.tag === HostRoot;
}

function getHostSibling(fiber){
    let node = fiber;
    // siblings: while(true){
        while (node.sibling === null){
            if(node.return === null || isHostParent(node.return)){
                return null;
            }
            node = node.return;
        }
        console.error('getHostSibling1', node)
        // node.sibling.return = node.return;
        // node = node.sibling;
    // }
}

export function commitPlacement(finishedWork){
    const parentFiber = getHostParentFiber(finishedWork);

    let parent;
    let isContainer;
    const parentStateNode = parentFiber.stateNode;
    switch(parentFiber.tag){
        case HostRoot:
            parent = parentStateNode.containerInfo;
            isContainer = true;
            break;
        default:
            console.error('commitPlacement1', parentFiber.tag);
    }
    if (parentFiber.flags & ContentReset){
        console.error('commitPlacement2')
    }
    const before = getHostSibling(finishedWork);
    if(isContainer){
        insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
    } else {
        console.error('commitPlacement3');
    }
}

function insertOrAppendPlacementNodeIntoContainer(node, before, parent){
    const tag = node.tag;
    const isHost = tag === HostComponent || console.error('insertOrAppendPlacementNodeIntoContainer1');
    if (isHost){
        const stateNode = isHost ? node.stateNode : console.error('insertOrAppendPlacementNodeIntoContainer2');
        if (before){
            console.error('insertOrAppendPlacementNodeIntoContainer3')
        } else {
            appendChildToContainer(parent, stateNode);
        }
    } else {
        console.error('insertOrAppendPlacementNodeIntoContainer4');
    }
}