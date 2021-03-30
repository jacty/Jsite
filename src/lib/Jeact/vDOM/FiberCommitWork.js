import{
 HostRoot,
 HostText,
 HostComponent,
 BeforeMutationMask,
 MutationMask,
 NoFlags,
 ContentReset,
 Ref,
 Placement,
 Update,
 PlacementAndUpdate,
 LayoutMask,
} from '@Jeact/shared/Constants';

let nextEffect = null;

export function commitBeforeMutationEffects(firstChild){
    nextEffect = firstChild;
    commitBeforeMutationEffects_begin();
}

function commitBeforeMutationEffects_begin(){
    while(nextEffect !== null){
        const fiber = nextEffect;

        const deletions = fiber.deletions;
        if(deletions !== null){
            debugger;
        }
        const child = fiber.child;
        if(
            (fiber.subtreeFlags & BeforeMutationMask) !== NoFlags &&
            child !== null
            ){
            nextEffect = child;
        } else {
            commitBeforeMutationEffects_complete();
        }
    }
}

function commitBeforeMutationEffects_complete(){
    while(nextEffect !== null){
        const fiber = nextEffect;
        try {
            commitBeforeMutationEffectsOnFiber(fiber);
        } catch (error){
            console.error('x', error);
        }

        const sibling = fiber.sibling;
        if(sibling !== null){
            nextEffect = sibling;
            return;
        }

        nextEffect = fiber.return;
    }
}

function commitBeforeMutationEffectsOnFiber(finishedWork){
    const current = finishedWork.alternate;
    const flags = finishedWork.flags;
    switch(finishedWork.tag){
        case HostRoot:{
            // clear container;
            finishedWork.stateNode.containerInfo.textContent = '';
        }
    }
    
}

export function commitMutationEffects(root,firstChild){
    nextEffect = firstChild;
    commitMutationEffects_begin(root);
}

function commitMutationEffects_begin(root){
    while(nextEffect !== null){
        const fiber = nextEffect;

        const deletions = fiber.deletions;
        if(deletions !==null ) debugger;

        const child = fiber.child;
        if((fiber.subtreeFlags & MutationMask) !== NoFlags && child !== null){
            nextEffect = child;
        } else {
            commitMutationEffects_complete(root);
        }
    }
}

function commitMutationEffects_complete(root){
    while(nextEffect !== null){
        const fiber = nextEffect;
        try {
            commitMutationEffectsOnFiber(fiber, root);
        } catch(error){
            console.error('x', error);
        }

        const sibling = fiber.sibling;
        if (sibling !== null){
            nextEffect = sibling;
            return;
        }

        nextEffect = fiber.return;
    }
}

function commitMutationEffectsOnFiber(finishedWork, root){
    const flags = finishedWork.flags;
    if (flags & ContentReset) debugger;
    if (flags & Ref) debugger;
    const primaryFlags = flags & (Placement | Update);
    switch(primaryFlags){
        case Placement:{
            commitPlacement(finishedWork);
            finishedWork.flags &= ~Placement;
            break;
        }
        case PlacementAndUpdate:{
            debugger;
        }
        case Update:{
            debugger;
        }
    }
}

export function commitLayoutEffects(finishedWork, root, committedLanes){
    nextEffect = finishedWork;
    commitLayoutEffects_begin(finishedWork, root, committedLanes);
}

function commitLayoutEffects_begin(subtreeRoot, root, committedLanes){
    while (nextEffect !== null){
        const fiber = nextEffect;
        const firstChild = fiber.child;
        if ((fiber.subtreeFlags & LayoutMask) !== NoFlags && firstChild !== null){
            nextEffect = firstChild;
        } else {
            commitLayoutMountEffects_complete(subtreeRoot, root, committedLanes);
        }
    }
}

function commitLayoutMountEffects_complete(subtreeRoot, root, committedLanes){
    while (nextEffect !== null){
        const fiber = nextEffect;
        if((fiber.flags & LayoutMask) !== NoFlags){
            const current = fiber.alternate;
            try{
                commitLayoutEffectOnFiber(root, current, fiber, committedLanes);
            } catch(error){
                console.error('x', error);
            }
        }

        if (fiber === subtreeRoot){
            nextEffect = null;
            return;
        }
        debugger;
        const sibling = fiber.sibling;
        if (sibling !== null){
            nextEffect = sibling;
            return;
        }

        nextEffect = fiber.return;
    }
}

function commitLayoutEffectOnFiber(finishedRoot, current, finishedWork, committedLanes){
    if ((finishedWork.flags & Update) !== NoFlags){
        switch(finishedWork.tag){
            case HostRoot:{
                debugger;
            }
            case HostComponent:{
                debugger;
            }
        }
    }
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

function commitPlacement(finishedWork){
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
    if (parentFiber.flags & ContentReset) debugger;
    const before = getHostSibling(finishedWork);
    if(isContainer){
        insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
    } else {
        debugger;
        insertOrAppendPlacementNode(finishedWork, before, parent);
    }
}

function insertOrAppendPlacementNodeIntoContainer(node, before, parent){
    const tag = node.tag;
    const isHost = tag === HostComponent || tag === HostText;
    if (isHost){
        const stateNode =node.stateNode;
        if (before){
            debugger;
        } else {
            parent.append(stateNode);
        }
    } else {
        const child = node.child;
        if (child !== null){
            insertOrAppendPlacementNodeIntoContainer(child, before, parent);
            let sibling = child.sibling;
            while (sibling !== null ){
                insertOrAppendPlacementNodeIntoContainer(sibling, before, parent);
                sibling = sibling.sibling;
            }
        }
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