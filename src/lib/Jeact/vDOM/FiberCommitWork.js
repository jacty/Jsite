import{
 HostRoot,
 HostText,
 HostComponent,
 FunctionComponent,
 BeforeMutationMask,
 MutationMask,
 NoFlags,
 ContentReset,
 Ref,
 Placement,
 Update,
 PlacementAndUpdate,
 LayoutMask,
 SuspenseComponent,
 OffscreenComponent,
 ChildDeletion,
 PassiveMask,
 Passive,
 HookPassive,
 HookHasEffect
} from '@Jeact/shared/Constants';
import {
    resolveRetryWakeable
} from '@Jeact/vDOM/FiberWorkLoop';
import { updateFiberProps } from '@Jeact/vDOM/DOMComponentTree';
import { updateDOMProperties } from '@Jeact/vDOM/DOMComponent'

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
            for (let i = 0; i < deletions.length; i++){
                const deletion = deletions[i];
                // commitBeforeMutationEffectsDeletion(deletion);
            }
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
            debugger;
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
    // switch(finishedWork.tag){
    //     case HostRoot:{
    //         // clear container;
    //         finishedWork.stateNode.containerInfo.textContent = '';
    //     }
    // }  
}

function commitBeforeMutationEffectsDeletion(deletion){
    debugger;
    doesFiberContain(deletion);
}

function commitHookEffectListUnmount(
    flags, 
    finishedWork, 
    nearestMountedAncestor
){
    const updateQueue = finishedWork.updateQueue;
    const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
    if (lastEffect !== null){
        const firstEffect = lastEffect.next;
        let effect = firstEffect;
        do {
            if ((effect.tag & flags) === flags){
                // unmount
                const destroy = effect.destroy;
                effect.destroy = undefined;
                if (destroy !== undefined){
                     destroy();
                }
            }
            effect = effect.next;
        } while (effect !== firstEffect);
    }
}

function commitHookEffectListMount(tag, finishedWork){
    const updateQueue = finishedWork.updateQueue;
    const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
    if (lastEffect !== null){
        const firstEffect = lastEffect.next;
        let effect = firstEffect;
        do {
            if ((effect.tag & tag) === tag){
                // Mount
                const create = effect.create;
                effect.destroy = create();
            }
            effect = effect.next;
        } while(effect !== firstEffect);
    }
}

function attachSuspenseRetryListeners(finishedWork){
    const wakeables = finishedWork.updateQueue;
    if (wakeables !== null){
        finishedWork.updateQueue = null;
        let retryCache = finishedWork.stateNode;
        if(retryCache === null){
            retryCache = finishedWork.stateNode = new WeakSet()
        }
        wakeables.forEach(wakeable => {
            let retry = resolveRetryWakeable.bind(null, finishedWork, wakeable);
            if(!retryCache.has(wakeable)){
               retryCache.add(wakeable);
               wakeable.then(retry, retry); 
            }
        })
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
        if(deletions !==null ){
            for (let i = 0; i < deletions.length; i++){
                const childToDelete = deletions[i];
                commitDeletion(root, childToDelete, fiber);
            }
        }

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
            debugger;
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
            // Placement
            commitPlacement(finishedWork);
            finishedWork.flags &= ~Placement;

            //Update
            const current = finishedWork.alternate;
            commitWork(current, finishedWork);
            break;
        }
        case Update:{
            const current = finishedWork.alternate;
            commitWork(current, finishedWork);
            break;
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
                debugger;
            }
        }

        if (fiber === subtreeRoot){
            nextEffect = null;
            return;
        }

        const sibling = fiber.sibling;
        if (sibling !== null){
            nextEffect = sibling;
            return;
        }

        nextEffect = fiber.return;
    }
}

export function commitPassiveMountEffects(root, finishedWork){
    nextEffect = finishedWork;
    commitPassiveMountEffects_begin(finishedWork, root);
}

function commitPassiveMountEffects_begin(subtreeRoot, root){
    while(nextEffect!== null){
        const fiber = nextEffect;
        const firstChild = fiber.child;
        if ((fiber.subtreeFlags & PassiveMask) !== NoFlags && firstChild !== null){
            nextEffect = firstChild;
        } else {
            commitPassiveMountEffects_complete(subtreeRoot, root);
        }
    }
}

function commitPassiveMountEffects_complete(subtreeRoot, root){
    while(nextEffect !== null){
        const fiber = nextEffect;
        if ((fiber.flags & Passive) !== NoFlags){
            try{
                commitPassiveMountOnFiber(root, fiber);
            } catch(error){
                debugger;
            }
        }

        if (fiber === subtreeRoot){
            nextEffect = null;
            return ;
        }

        const sibling = fiber.sibling;
        if (sibling !== null){
            nextEffect = sibling;
            return;
        }

        nextEffect = fiber.return;
    }
}

function commitPassiveMountOnFiber(finishedRoot, finishedWork){
    switch(finishedWork.tag){
        case FunctionComponent:{
            commitHookEffectListMount(
                HookPassive | HookHasEffect, 
                finishedWork
            );
            break;
        }
    }
}

function commitLayoutEffectOnFiber(finishedRoot, current, finishedWork, committedLanes){
    if ((finishedWork.flags & Update) !== NoFlags){
        switch(finishedWork.tag){
            case FunctionComponent:
            case HostRoot:{
                debugger;
            }
            case HostComponent:{
                break;
            }
            case HostText:
                break;
            case SuspenseComponent:
                break;
            case OffscreenComponent:
                break;
        }
    }
}

export function commitPassiveUnmountEffects(firstChild){
    nextEffect = firstChild;
    commitPassiveUnmountEffects_begin();
}

function commitPassiveUnmountEffects_begin(){
    while(nextEffect !== null){
        const fiber = nextEffect;
        const child = fiber.child;

        if ((nextEffect.flags & ChildDeletion) !== NoFlags){
            debugger;
        }
        if ((fiber.subtreeFlags & PassiveMask) !== NoFlags && child !== null){
            nextEffect = child;
        } else {
            commitPassiveUnmountEffects_complete();
        }
    }
}

function commitPassiveUnmountEffects_complete(){
    while (nextEffect !== null){
        const fiber = nextEffect;
        if ((fiber.flags & Passive) !== NoFlags){
            commitPassiveUnmountOnFiber(fiber);
        }

        const sibling = fiber.sibling;
        if (sibling !== null){
            nextEffect = sibling;
            return;
        }

        nextEffect = fiber.return;
    }
}

function commitPassiveUnmountOnFiber(finishedWork){
    switch(finishedWork.tag){
        case FunctionComponent:{
            commitHookEffectListUnmount(
                HookPassive | HookHasEffect,
                finishedWork,
                finishedWork.return
            )
        }
    }
}

function commitUnmount(finishedRoot, current, nearestMountedAncestor){
    switch(current.tag){
        case FunctionComponent:
        case HostComponent:
            return;
    }
}

function commitNestedUnmounts(finishedRoot, root, nearestMountedAncestor){
    let node = root;
    while(true){
        commitUnmount(finishedRoot, node, nearestMountedAncestor);
        if(node.child !== null){
            node.child.return = node;
            node = node.child;
            continue;
        }
        if (node === root){
            return;
        }
        while (node.sibling === null){
            if (node.return === null || node.return === root){
                return;
            }
            node = node.return;
        }
        node.sibling.return = node.return;
        node = node.sibling;
    }
}

function detachFiberMutation(fiber){
    const alternate = fiber.alternate;
    if (alternate !== null){
        alternate.return = null;
    }
    fiber.return = null;
}

function toggleAllChildren(finishedWork, isHidden){
    let node = finishedWork;
    while(true){
        if (node.tag === HostComponent){
            const instance = node.stateNode;
            if (isHidden){
                debugger;
            } else {
                //todo
            }
        } else if (node.tag === HostText){
            debugger
        } else if (
            node.tag === OffscreenComponent && 
            node.memoizedState !== null &&
            node !== finishedWork
            ){
            // Found a nested Offscreen component that is hidden. Stop going 
            // search deeper and remain this tree hidden.
        } else if (node.child !== null){
            node.child.return = node;
            node = node.child;
            continue;
        }

        if (node == finishedWork){
            return;
        }
        while(node.sibling === null){
            if (node.return === null || node.return === finishedWork){
                return;
            }
            node = node.return;
        }
        node.sibling.return = node.return;
        node = node.sibling;
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
    siblings: while (true){
        while(node.sibling === null){
            if (node.return === null || isHostParent(node.return)){
                return null;
            }
            node = node.return;
        }
        node.sibling.return = node.return;
        node = node.sibling;
        while (
            node.tag !== HostComponent &&
            node.tag !== HostText
        ){
            if (node.flags & Placement){
                continue siblings;
            }

            if (node.child === null){
                continue siblings;
            } else {
                node.child.return = node;
                node = node.child;
            }
        }
        if (!(node.flags & Placement)){
            return node.stateNode;
        }
    }
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
                insertOrAppendPlacementNodeIntoContainer(
                    sibling, 
                    before, 
                parent);

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
            parent.insertBefore(stateNode, before);
        } else {
            parent.append(stateNode);
        }
    } else {
        console.error('insertOrAppendPlacementNode1')
    }
}

function unmountHostComponents(finishedRoot, current, nearestMountedAncestor){
    let node = current;
    let currentParentIsValid = false;
    let currentParent;
    let currentParentIsContainer;
    while(true){
        if (!currentParentIsValid){
            let parent = node.return;
            findParent: while(true){
                const parentStateNode = parent.stateNode;
                switch(parent.tag){
                    case HostComponent:
                        currentParent = parentStateNode;
                        currentParentIsContainer = false;
                        break findParent;
                    case HostRoot:
                        currentParent = parentStateNode.containerInfo;
                        currentParentIsContainer = true;
                        break findParent;
                }
                parent = parent.return;
            }
            currentParentIsValid = true;
        }

        if (node.tag === HostComponent || node.tag === HostText){
            commitNestedUnmounts(finishedRoot, node, nearestMountedAncestor);
            currentParent.removeChild(node.stateNode);
        } else {
            commitUnmount(finishedRoot, node, nearestMountedAncestor);
            if (node.child !== null){
                node.child.return = node;
                node = node.child;
                continue;
            }
        }
        if (node === current){
            return;
        }
        while (node.sibling === null){
            if (node.return === null || node.return === current){
                return;
            }
            node = node.return;
        }
        node.sibling.return = node.return;
        node = node.sibling;
    }

}

function commitDeletion(finishedRoot, current, nearestMountedAncestor){
    unmountHostComponents(finishedRoot, current, nearestMountedAncestor);
    detachFiberMutation(current);
}

function commitWork(current, finishedWork){
    switch(finishedWork.tag){
        case FunctionComponent:
            debugger;
        case HostComponent:{
            const instance = finishedWork.stateNode;
            if (instance !== null){
                const newProps = finishedWork.memoizedProps;
                const oldProps = current !== null ? current.memoizedProps : newProps;
                const type = finishedWork.type;
                const updatePayload = finishedWork.updateQueue;
                finishedWork.updateQueue = null;
                if (updatePayload !== null){
                    commitUpdate(
                        instance,
                        updatePayload,
                        type,
                        oldProps,
                        newProps,
                        finishedWork,
                    )
                }
            }
            return;
        }
        case HostText:{
            debugger;
        }
        case HostRoot:{
            debugger;
        }
        case SuspenseComponent:{
            commitSuspenseComponent(finishedWork);
            attachSuspenseRetryListeners(finishedWork);
            return;
        }
        case OffscreenComponent:{
            const newState = finishedWork.memoizedState;
            const isHidden = newState !== null;
            toggleAllChildren(finishedWork, isHidden);
            return;
        }
    }
}

function commitSuspenseComponent(finishedWork){
    const newState = finishedWork.memoizedState;
    if (newState !== null){
       const primaryChildParent = finishedWork.child;
        //hideOrUnhideAllChildren()
        toggleAllChildren(primaryChildParent, true); 
    }
}

function commitUpdate(
    domElement,
    updatePayload,
    type,
    oldProps,
    newProps,
    internalInstanceHandle
){
    updateFiberProps(domElement, newProps);
    updateDOMProperties(domElement, updatePayload);
}