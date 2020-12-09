import {
  __ENV__,
  JEACT_ELEMENT_TYPE,
  Placement
} from '@Jeact/shared/Constants';
import {
  createFiberFromElement,
  createFiberFromText,
} from '@Jeact/vDOM/Fiber';

// This API will tag the children with the side-effect of the reconciliation
// itself. They will be added to the side-effect list as we pass through the
// children and the parent.
export function reconcileChildFibers(
  returnFiber,
  currentFirstChild,
  newChild,// from payload.element
  lanes
){
  // Handle object types
  const isObject = typeof newChild === 'object' && newChild !== null;
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
        );
      default:
        if(!Array.isArray(newChild)){
          console.error('reconcileChildFibers1', newChild.$$typeof)
        }
    };
  }

  if (Array.isArray(newChild)){
    return reconcileChildrenArray(
      returnFiber,
      currentFirstChild,
      newChild,
      lanes,
    );
  }
  newChild !== undefined ?
    console.error('reconcileChildFibers', newChild):'';
}

function placeSingleChild(newFiber){
  // This is a simpler for the single child case. We only need to do a
  // placement for inserting new children.
  if (newFiber.alternate === null){
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
  created.ref = element.ref;
  created.return = returnFiber;
  return created;
}

function reconcileChildrenArray(
  returnFiber,
  currentChild,
  newChildren,
  lanes
){

  let resultingFirstChild = null;
  let previousNewFiber = null;

  let oldFiber = currentChild;
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
      if (newFiber === null){// which case
        console.error('reconcileChildrenArray3')
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
  console.error('reconcileChildrenArray4')
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

  const current = newFiber.alternate;
  if (current!==null){
    console.error('placeChild1')
  } else {
    // This is an insertion.
    newFiber.flags = Placement;
    return lastPlacedIndex
  }
}

