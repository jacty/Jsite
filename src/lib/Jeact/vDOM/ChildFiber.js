import {
  __ENV__,
  JEACT_ELEMENT_TYPE,
  JEACT_FRAGMENT_TYPE,
  JEACT_LAZY_TYPE,
  Placement
} from '@Jeact/shared/Constants';
import {
  createFiberFromElement,
  createFiberFromText,
  createWorkInProgress
} from '@Jeact/vDOM/Fiber';

// This API will tag the children with the side-effect of the reconciliation
// itself. They will be added to the side-effect list as we pass through the
// children and the parent.
export function reconcileChildFibers(
  returnFiber,
  current,
  newChild,// from payload.element
  lanes
){
  let shouldTrackEffects;
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
      case JEACT_ELEMENT_TYPE:
        return placeSingleChild(//update flag to Placement.
          reconcileSingleElement(
            returnFiber,
            currentFirstChild,
            newChild,
            lanes,
          ),
          shouldTrackEffects
        );
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
  // getIteratorFn()
  if(newChild === 'function' && newChild[Symbol.iterator]){
    debugger;
  }

  if (isObject){
    debugger;
  }

  if (typeof newChild === 'undefined' && !isUnkeyedTopLevelFragment){
    return deleteRemainingChildren(returnFiber, currentFirstChild, shouldTrackEffects);
  }
}

function deleteRemainingChildren(
  returnFiber, 
  currentFirstChild, 
  shouldTrackEffects
){
  if (!shouldTrackEffects){
    return null;
  }

  debugger;
}

function placeSingleChild(newFiber, shouldTrackEffects){
  // This is a simpler for the single child case. We only need to do a
  // placement for inserting new children.
  if (shouldTrackEffects && newFiber.alternate === null){
    newFiber.flags = Placement;
  }
  
  return newFiber;
}

function reconcileSingleTextNode(returnFiber, currentFirstChild, text, lanes){
  const created = createFiberFromText(text, lanes);
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
    debugger;
    deleteChild(returnFiber, child);
    child = child.sibling;
  }
  if (element.type === JEACT_FRAGMENT_TYPE) debugger;
  // createFiberFromTypeAndProps() has been merged to createFiberFromElement
  const created = createFiberFromElement(element, lanes);
  created.return = returnFiber;
  return created;
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
  let newIdx = 0;
  let nextOldFiber = null;
  for (; oldFiber!==null && newIdx < newChildren.length; newIdx++){
    debugger;
  }
  if (newIdx === newChildren.length){
    debugger;
  }

  if (oldFiber === null){
    // If we don't have any more existing children we can choose a fast path
    // since the rest will all be insertions.
    for (; newIdx < newChildren.length; newIdx++){
      const newFiber = createChild(returnFiber, newChildren[newIdx], lanes);
      if(previousNewFiber === null){
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }

    return resultingFirstChild;
  }
  debugger;
}

function createChild(returnFiber, newChild, lanes){
  if (typeof newChild === 'string' || typeof newChild === 'number'){
    const created = createFiberFromText(
      ''+ newChild,
      lanes,
    );
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

function placeChild(
  newFiber,
  lastPlacedIndex,
  newIndex
){
  return lastPlacedIndex;
}

function deleteChild(returnFiber, childToDelete){
  const deletions = returnFiber.deletions;    
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