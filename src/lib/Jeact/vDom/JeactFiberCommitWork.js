import{
  Placement,
  Update,
  Hydrating,
  MutationMask,
  NoFlags,
  ContentReset,
  Ref,
  HostRoot,
  LayoutMask,
  Callback,
  BeforeMutationMask,
  Snapshot,
} from '../shared/Constants';

export function commitBeforeMutationEffects(firstChild){
  // alternate of recursivelyCommitBeforeMutationEffects();
  let fiber = firstChild;
  while (fiber !== null){
    if (fiber.deletions !== null){
      console.error('commitBeforeMutationEffects1')
    }
    const child = fiber.child;

    if (fiber.subtreeFlags & BeforeMutationMask && child !== null){
      commitBeforeMutationEffects(child);
    }

    commitBeforeMutationEffectsOnFiber(fiber);

    fiber = fiber.sibling;
  }
}
function commitBeforeMutationEffectsOnFiber(finishedWork){
  const current = finishedWork.alternate;
  const flags = finishedWork.flags;
  if ((flags & Snapshot) !== NoFlags){
    console.error('commitBeforeMutationEffects1')
  }
}
export function commitMutationEffects(firstChild, root, renderPriority){
  // alternate of recursivelyCommitMutationEffects in ReactFiberCommitWork.new.js;
  let fiber = firstChild;
  while (fiber!==null){
    const deletions = fiber.deletions;
    if(deletions !== null){
      console.error('commitMutationEffects1')
    }
    if (fiber.child !== null){
      const mutationFlags = fiber.subtreeFlags & MutationMask;
      if (mutationFlags !== NoFlags){
        commitMutationEffects(
          fiber.child,
          root,
          renderPriority
        )
      }
    }
    try {
      commitMutationEffectsOnFiber(fiber, root, renderPriority)
    } catch(error){
      console.error('commitMutationEffects2', error);
    }
    fiber = fiber.sibling;
  }
}

function commitMutationEffectsOnFiber(fiber, root, renderPriority){
  const flags = fiber.flags;
  if (flags & ContentReset){
    console.error('commitMutationEffectsOnFiber1')
  }
  if (flags & Ref){
    console.error('commitMutationEffectsOnFiber2')
  }

  const primaryFlags = flags & (Placement | Update | Hydrating);
  switch(primaryFlags){
    case Placement:{
      commitPlacement(fiber);
      fiber.flags &= ~Placement;
      break;
    }
    default:
      primaryFlags!== 0 ?
        console.error('commitMutationEffectsOnFiber3', primaryFlags):'';
  }
}

export function commitLayoutEffects(finishedWork, finishedRoot){
  // alternate of recursivelyCommitMutationEffects in ReactFiberCommitWork.new.js;
  const {flags, tag} = finishedWork;
  let child = finishedWork.child;
  while (child !== null){
    const primarySubtreeFlags = finishedWork.subtreeFlags & LayoutMask;
    if (primarySubtreeFlags !== NoFlags){
      console.error('commitLayoutEffects1')
    }
    child = child.sibling;
  }

  const primaryFlags = flags & (Update | Callback);
}

function getHostParentFiber(fiber){
  let parent = fiber.return;
  while (parent !== null){
    if (isHostParent(parent)){
      return parent;
    }
    parent = parent.return;
  }
  console.error('Failed to find a host parent');
}

function isHostParent(fiber){
  return fiber.tag === HostRoot;
}

function getHostSibling(fiber){
  // Search forward into the tree to find a sibling host.
  // Why? Need to figure out the necessity of this function.
  return null;
}

function commitPlacement(finishedWork){

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
      console.error('commitPlacement1', parentFiber.tag)
  }
  if (parentFiber.flags & ContentReset){
    console.error('commitPlacement2')
  }

  const before = getHostSibling(finishedWork);
  if (isContainer){
    insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
  } else {
    console.error('commitPlacement3')
  }
}
function insertOrAppendPlacementNodeIntoContainer(node, before, parent){
  const stateNode = node.stateNode;
  const child = node.child;
  if (stateNode||child){
    console.error('insertOrAppendPlacementNodeIntoContainer')
  }
}
