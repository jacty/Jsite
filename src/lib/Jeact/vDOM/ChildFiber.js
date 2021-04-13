import {
  JEACT_ELEMENT_TYPE,
  JEACT_FRAGMENT_TYPE,
  JEACT_LAZY_TYPE,
  Placement,
  HostText,
  ChildDeletion,
} from '@Jeact/shared/Constants';
import {
  createFiberFromElement,
  createWorkInProgress,
  createFiber
} from '@Jeact/vDOM/Fiber';

let shouldTrackEffects;

export function reconcileChildFibers(
  returnFiber,
  current,
  newChild,// from payload.element
  lanes
){
  let currentFirstChild;
  if(current === null){
    //mount
    currentFirstChild = current;
    shouldTrackEffects = false;
  } else {
    // update
    currentFirstChild = current.child;
    shouldTrackEffects = true;
  }
  if(newChild === null && !shouldTrackEffects){
    // early bail out
    return null;
  }
  // Handle object types
  const isObject = typeof newChild === 'object' && newChild !== null;

  const isUnkeyedTopLevelFragment = 
    isObject &&
    newChild.type === JEACT_FRAGMENT_TYPE &&
    newChild.key === null;
  if(isUnkeyedTopLevelFragment){
    debugger;
    newChild = newChild.props.children;
  }

  if (isObject){
    switch(newChild.$$typeof){
      case JEACT_ELEMENT_TYPE:{
        const newFiber = reconcileSingleElement(
          returnFiber,
          currentFirstChild,
          newChild,
          lanes
        );
        placeSingleChild(newFiber);        

        return newFiber;
      }
      case JEACT_LAZY_TYPE:
        debugger;        
    };
  }

  if (typeof newChild === 'string' || typeof newChild === 'number'){
    return placeSingleChild(
      reconcileSingleTextNode(
        returnFiber,
        currentFirstChild,
        '' + newChild,
        lanes,
      ),
      shouldTrackEffects
    )
  }

  if (Array.isArray(newChild)){
    return reconcileChildrenArray(
      returnFiber,
      currentFirstChild,
      newChild,
      lanes,
    );
  }

  if (isObject){
    debugger;
  }

  deleteRemainingChildren(
    returnFiber, 
    currentFirstChild, 
    shouldTrackEffects
  );

  return null;  
}

function placeSingleChild(newFiber){
  // This is a simpler for the single child inserting case
  if (shouldTrackEffects && newFiber.alternate === null){
    newFiber.flags = Placement;
  }
}

function updateTextNode(returnFiber, current, textContent, lanes){
  if (current === null || current.tag !== HostText){
    const created = createFiber(HostText, textContent, lanes);
    created.return = returnFiber;
    return created;
  } else {
    const existing = useFiber(current, textContent);
    existing.return = returnFiber;
    return existing;
  }
}

function updateElement(returnFiber, current, element, lanes){
  const elementType = element.type;
  if (current !== null){
    if (current.elementType === elementType){
      const existing = useFiber(current, element.props);
      existing.return = returnFiber;
      return existing;
    }
  }
  // Key hasn't been changed but types are different.
  // Insert
  const created = createFiberFromElement(element, lanes);
  created.return = returnFiber;
  return created;
}

function deleteRemainingChildren(
  returnFiber, 
  currentFirstChild
){
  if (!shouldTrackEffects){
    return null;
  }

  let childToDelete = currentFirstChild;
  while(childToDelete !== null){
    deleteChild(returnFiber, childToDelete);
    childToDelete = childToDelete.sibling;
  }
}

function mapRemainingChildren(currentFirstChild){
  const existingChildren = new Map();

  let existingChild = currentFirstChild;
  while (existingChild !== null){
    if (existingChild.key !== null){
      existingChildren.set(existingChild.key, existingChild);
    } else {
      // TODO: Set index in order when fiber is created since currently index 
      // is defaulted to 0 if the fibers haven't been rearranged.
      existingChildren.set(existingChild.index, existingChild);
    }
    existingChild = existingChild.sibling;
  }
  return existingChildren;
}

function useFiber(fiber, pendingProps){
  const clone = createWorkInProgress(fiber, pendingProps);
  clone.index = 0;
  clone.sibling = null;
  return clone;
}

function placeChild(
  newFiber,
  lastPlacedIndex,
  newIndex
){
  newFiber.index = newIndex;
  if (!shouldTrackEffects){
    return lastPlacedIndex;
  }
  const current = newFiber.alternate;
  if (current !== null){
    const oldIndex = current.index;
    if (oldIndex < lastPlacedIndex){
      newFiber.flags |= Placement;
      return lastPlacedIndex;
    } else {
      // stay in place.
      return oldIndex;
    }
  } else {
    // insertion.
    newFiber.flags |= Placement;
    return lastPlacedIndex;
  }
}

function createChild(returnFiber, newChild, lanes){
  if (isTextNode(newChild)){
    // Text nodes.
    const created = createFiber(HostText, ''+newChild, lanes);
    created.return = returnFiber;
    return created;
  }
  if(typeof newChild === 'object' && newChild !== null){
    switch(newChild.$$typeof){
      case JEACT_ELEMENT_TYPE:{
        const created = createFiberFromElement(
          newChild,
          lanes,
        );
        created.return = returnFiber;
        return created;
      }
    }
  }

  return null;
}

function deleteChild(returnFiber, childToDelete){
  const deletions = returnFiber.deletions;  
  if (deletions === null){
    returnFiber.deletions = [childToDelete];
    returnFiber.flags |= ChildDeletion;
  } else {
    deletions.push(childToDelete);
  } 
}

function updateSlot(returnFiber, oldFiber, newChild, lanes){
  // Update the fiber if the keys match, otherwise return null.
  const key = oldFiber !== null ? oldFiber.key : null;
  if (isTextNode(newChild)){
    // Text nodes.
    if (key !== null){
      return null
    }
    return updateTextNode(returnFiber, oldFiber, '' + newChild, lanes);
  }
  if (typeof newChild === 'object' && newChild !== null){
    switch (newChild.$$typeof){
      case JEACT_ELEMENT_TYPE: {
        if (newChild.key === key){
          return updateElement(returnFiber, oldFiber, newChild, lanes);
        } else {
          return null;
        }
      }
    }
  }
  return null;
}

function updateFromMap(
  existingChildren,
  returnFiber,
  newIdx,
  newChild,
  lanes
){
  if (isTextNode(newChild)){
    // Text nodes
    const matchedFiber = existingChildren.get(newIdx) || null;
    return updateTextNode(returnFiber, matchedFiber, ''+newChild, lanes);
  }
  if (typeof newChild === 'object' && newChild !== null){
    switch (newChild.$$typeof){
      case JEACT_ELEMENT_TYPE:{
        const matchedFiber = 
          existingChildren.get(
            newChild.key === null ? newIdx : newChild.key,
          ) || null;
          return updateElement(returnFiber, matchedFiber, newChild, lanes);
      }
    }
  }
}

function reconcileChildrenArray(
  returnFiber,
  currentFirstChild,
  newChildren,
  lanes
){

  let resultingFirstChild = null;
  let previousNewFiber = null;

  let oldFiber = currentFirstChild;
  let lastPlacedIndex = 0;
  let newIdx = 0;
  let nextOldFiber = null;
  for (; oldFiber!==null && newIdx < newChildren.length; newIdx++){
    if (oldFiber.index > newIdx){
      nextOldFiber = oldFiber;
      oldFiber = null;
    } else {
      nextOldFiber = oldFiber.sibling;
    }
    const newFiber = updateSlot(
      returnFiber,
      oldFiber,
      newChildren[newIdx],
      lanes,
    );
    if (newFiber === null){
      break;
    }
    if (shouldTrackEffects){
      if(oldFiber && newFiber.alternate === null){
        // Slot matched but types are different, so we need to delete the old
        // children.
        deleteChild(returnFiber, oldFiber);
      }
    }
    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
    if (previousNewFiber === null){
      resultingFirstChild = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;
    oldFiber = nextOldFiber;
  }
  if (newIdx === newChildren.length){
    // reached the end of new children.
    deleteRemainingChildren(returnFiber, oldFiber);
    return resultingFirstChild;
  }

  if (oldFiber === null){
    // Inserting remaining children.
    for (; newIdx < newChildren.length; newIdx++){
      const newFiber = createChild(returnFiber, newChildren[newIdx], lanes);
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      if(previousNewFiber === null){
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }

    return resultingFirstChild;
  }
  // keys don't match due to position change.
  const existingChildren = mapRemainingChildren(oldFiber);
  // scanning and restoring deleted items as moves.
  for (; newIdx < newChildren.length; newIdx++){
    const newFiber = updateFromMap(
      existingChildren,
      returnFiber,
      newIdx,
      newChildren[newIdx],
      lanes,
    );
    if (newFiber !== null){
      if (shouldTrackEffects){
        if (newFiber.alternate !== null){
          // The new fiber is a work in progress, but if there is a current, it
          // means that we are gonna reuse the fiber. We need to delete it 
          // from the child list in case adding it to deletion list.
          existingChildren.delete(
            newFiber.key === null ? newIdx : newFiber.key,
          )
        }
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      if (previousNewFiber === null){
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }
  }
  if (shouldTrackEffects){
    // Any existing children that weren't consumed above should be deleted.
    existingChildren.forEach(child => deleteChild(returnFiber, child));
  }
  
  return resultingFirstChild;
}

function reconcileSingleTextNode(returnFiber, currentFirstChild, text, lanes){
  const created = createFiber(HostText, text, lanes);
  created.return = returnFiber;
  return created;
}

function reconcileSingleElement(
  returnFiber,
  currentFirstChild,
  element,
  lanes
){
  const key = element.key;
  let child = currentFirstChild;
  while (child !== null){
    if (child.key === key){
      const elementType = element.type;
      if (elementType === JEACT_FRAGMENT_TYPE){
        debugger;
      } else {
        if (child.elementType === elementType ||
            (typeof elementType === 'object' && 
              elementType !== null &&
              elementType.$$typeof === JEACT_LAZY_TYPE
            )
          ){
            deleteRemainingChildren(
              returnFiber, 
              child.sibling
            );
            const existing = useFiber(child, element.props);
            existing.return = returnFiber;
            return existing;
        }
      }
      deleteRemainingChildren(returnFiber, child);
      break;
    } else {
      deleteChild(returnFiber, child);
    }
    child = child.sibling;
  }
  if (element.type === JEACT_FRAGMENT_TYPE){
    debugger;
  } else{
    // createFiberFromTypeAndProps() has been merged to createFiberFromElement
    const created = createFiberFromElement(element, lanes);
    created.return = returnFiber;
    return created;
  }
}

export function cloneChildFibers(current, workInProgress){
  if(workInProgress.child === null){
    return;
  }
  let currentChild = workInProgress.child;
  let newChild = createWorkInProgress(currentChild, currentChild.pendingProps);
  workInProgress.child = newChild;
  newChild.return = workInProgress;

  while (currentChild.sibling!==null){
    currentChild = currentChild.sibling;
    newChild = newChild.sibling = createWorkInProgress(
      currentChild,
      currentChild.pendingProps,
    );
    newChild.return = workInProgress;
  }
  newChild.sibling = null;
}

export function isTextNode(newChild){
  if(typeof newChild === 'string' || typeof newChild === 'number'){
    return true;
  }
  return false;
}