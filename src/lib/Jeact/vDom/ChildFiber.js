import {
  __ENV__,
  JEACT_ELEMENT_TYPE,
  Placement
} from '@Jeact/shared/Constants';
import {
  createFiberFromElement,
  createFiberFromText,
} from '@Jeact/vDOM/Fiber';

let shouldTrackSideEffects = true;

function coerceRef(
  returnFiber,
  current,
  element
){
  const mixedRef = element.ref;
  if (mixedRef !== null){
    console.error('coerceRef', element);
  }
  return mixedRef;
}

  // This API will tag the children with the side-effect of the reconciliation
  // itself. They will be added to the side-effect list as we pass through the
  // children and the parent.
export function reconcileChildFibers(
  returnFiber,
  currentChild,
  newChild,// from payload.element
  lanes
){
  shouldTrackSideEffects = 
    currentChild === null ? false : true;
  // Handle object types
  const isObject = typeof newChild === 'object' && newChild !== null;
  if (isObject){
    switch(newChild.$$typeof){
      case JEACT_ELEMENT_TYPE:
        return placeSingleChild(//update flag to Placement.
          reconcileSingleElement(
            returnFiber,
            currentChild,
            newChild,
            lanes,
          ),
        );
      default:
        if(!Array.isArray(newChild)){
          console.error('reconcileChildFibers1', newChild.$$typeof)
        }
    };
  }

  if(typeof newChild === 'string' || typeof newChild === 'number'){
    console.error('reconcileChildFibers4', newChild, returnFiber)
  }

  if (Array.isArray(newChild)){
    return reconcileChildrenArray(
      returnFiber,
      currentChild,
      newChild,
      lanes,
    );
  }

  if(typeof newChild === 'undefined'){
    switch(returnFiber.tag){
      default:
        returnFiber.tag !== 5? console.error('reconcileChildFibers2'):'';
    }
  }

  // Remaining cases are all treated as empty.
  return deleteRemainingChildren(returnFiber, currentChild);
}

function placeSingleChild(newFiber){
  // This is a simpler for the single child case. We only need to do a
  // placement for inserting new children.
  if (shouldTrackSideEffects && newFiber.alternate === null){
    newFiber.flags = Placement;
  }
  return newFiber;
}

function reconcileSingleElement(
  returnFiber,
  currentFirstChild,
  element,
  lanes
){
  const key = element.key;
  let child = currentFirstChild;
  if (child !== null){
    console.error('reconcileSingleElement1')
  }
  const created = createFiberFromElement(element, lanes);
  created.ref = coerceRef(returnFiber, currentFirstChild, element);
  created.return = returnFiber;
  return created;
}

function reconcileChildrenArray(
  returnFiber,
  currentFirstChild,
  newChildren,
  lanes
){

  console.error('reconcileChildrenArray', newChildren);
  let resultingFirstChild = null;
  let previousNewFiber = null;

  let oldFiber = currentFirstChild;
  let lastPlacedIndex = 0;
  let newIdx = 0;
  let nextOldFiber = null;
  for (; oldFiber!==null && newIdx < newChildren.length; newIdx++){
    console.error('reconcileChildrenArray1')
  }
  if (newIdx === newChildren.length){
    console.error('reconcileChildrenArray2')
  }

  if (oldFiber === null){
    // If we don't have any more existing children we can choose a fast path
    // since the rest will all be insertions.
    for (; newIdx < newChildren.length; newIdx++){
      const newFiber = createChild(returnFiber, newChildren[newIdx], lanes);
      if (newFiber === null){
        continue;
      }
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
    console.error('createChild1');return;
    switch(newChild.$$typeof){
      case JEACT_ELEMENT_TYPE:{
        const created = createFiberFromElement(
          newChild,
          returnFiber.mode,
          lanes,
        );
        created.ref = coerceRef(returnFiber, null, newChild);
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
  newFiber.index = newIndex;
  if (!shouldTrackSideEffects){
    return lastPlacedIndex;
  }
  console.error('placeChild1');return;
  const current = newFiber.alternate;
  if (current!==null){
    console.error('placeChild1')
  } else {
    // This is an insertion.
    newFiber.flags = Placement;
    return lastPlacedIndex
  }
}

function deleteRemainingChildren(
  returnFiber,
  currentChild,
){
  if (!shouldTrackSideEffects){
    return null;
  }
  console.error('deleteRemainingChildren');
}