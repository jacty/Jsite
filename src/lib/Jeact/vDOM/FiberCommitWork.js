import{
 HostRoot,
 HostText,
 HostComponent,
} from '@Jeact/shared/Constants';

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
    return (
        fiber.tag === HostRoot ||
        fiber.tag === HostComponent
        );
}

function getHostSibling(fiber){
    let node = fiber;
    while (true){
        while(node.sibling === null){
            if (node.return === null || isHostParent(node.return)){
                return null;
            }
            node = node.return;
        }
        node.sibling.return = node.return;
        node = node.sibling;
    }
    console.error('getHostSibling');
}

export function commitPlacement(finishedWork){
    const parentFiber = getHostParentFiber(finishedWork);
    let parent;
    let isContainer;
    const parentStateNode = parentFiber.stateNode;
    switch(parentFiber.tag){
        case HostComponent:
            parent = parentStateNode;
            isContainer = false;
            break;
        case HostRoot:
            parent = parentStateNode.containerInfo;
            isContainer = true;
            break;
        default:
            console.error('commitPlacement1', parentFiber.tag);
    }
    const before = getHostSibling(finishedWork);
    if(isContainer){
        insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
    } else {
        insertOrAppendPlacementNode(finishedWork, before, parent);
    }
}

function insertOrAppendPlacementNodeIntoContainer(node, before, parent){
    const tag = node.tag;
    const isHost = tag === HostComponent || tag === HostText;
    if (isHost){
        const stateNode =node.stateNode;
        if (before){
            console.error('insertOrAppendPlacementNodeIntoContainer3')
        } else {
            parent.append(stateNode);
        }
    } else {
        console.error('insertOrAppendPlacementNodeIntoContainer')
    }
}

function insertOrAppendPlacementNode(node, before, parent){
    const tag = node.tag;
    const isHost = tag === HostComponent || tag === HostText;
    if (isHost){
        const stateNode = node.stateNode;
        if (before){
            console.error('insertOrAppendPlacementNode')
        } else {
            parent.append(stateNode);
        }
    } else {
        console.error('insertOrAppendPlacementNode1')
    }
}