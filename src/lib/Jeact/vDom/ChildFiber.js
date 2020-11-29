import {
  JEACT_ELEMENT_TYPE,
  Placement
} from '@Jeact/shared/Constants';
import {
  createFiberFromElement,
  // createFiberFromText,
} from '@Jeact/vDOM/Fiber';

function coerceRef(
  returnFiber,
  current,
  element
  ){
  const mixedRef = element.ref;
  if (mixedRef !== null){
    console.error('coerceRef', mixedRef);
  }
  return mixedRef;
}

// This wrapper function exists because I expect to clone the code in each
// path to be able to optimize each path individually by branching early. This
// needs a compiler or we can do it manually. Helpers that don't need this
// branching live outside of this function.
function ChildReconciler(shouldTrackSideEffects){

  function deleteRemainingChildren(
    returnFiber,
    currentFirstChild,
  ){
    if (!shouldTrackSideEffects){
      return null;
    }
    console.error('deleteRemainingChildren');
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

  function placeSingleChild(newFiber){
    // This is a simpler for the single child case. We only need to do a
    // placement for inserting new children.
    if (shouldTrackSideEffects && newFiber.alternate === null){
      newFiber.flags = Placement;
    }
    return newFiber;
  }

  function createChild(returnFiber, newChild, lanes){
    if (typeof newChild === 'string' || typeof newChild === 'number'){
      const created = createFiberFromText(
        ''+ newChild,
        returnFiber.mode,
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
          console.error('reconcileChildrenArray3')
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

  function reconcileSingleElement(
    returnFiber,
    currentFirstChild,
    element,
    lanes
  ){
    const key = element.key;
    let child = currentFirstChild;
    while (child !== null){
      console.error('reconcileSingleElement1')
    }
    const created = createFiberFromElement(element, lanes);
    created.ref = coerceRef(returnFiber, currentFirstChild, element);
    created.return = returnFiber;
    
    return created;
  }
  // This API will tag the children with the side-effect of the reconciliation
  // itself. They will be added to the side-effect list as we pass through the
  // children and the parent.
  function reconcileChildFibers(
    returnFiber,
    currentFirstChild,
    newChild,// from payload.element
    lanes){
    // This function is not recursive.
    // If the top level item is an array, we treat it as a set of children,
    // not as a fragment. Nested arrays on the other hand will be treated as
    // fragment nodes. Recursion happens at the normal flow.
    
    // Handle object types
    const isObject = typeof newChild === 'object' && newChild !== null;
    if (isObject){
      switch(newChild.$$typeof){
        case JEACT_ELEMENT_TYPE:
          return placeSingleChild(
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
    if(typeof newChild === 'string' || typeof newChild === 'number'){
      console.error('reconcileChildFibers4')
    }
    if (Array.isArray(newChild)){
      return reconcileChildrenArray(
        returnFiber,
        currentFirstChild,
        newChild,
        lanes,
      );
    }
    console.error('reconcileChildFibers5');
    if(typeof newChild === 'undefined'){
      switch(returnFiber.tag){
        default:
          returnFiber.tag !== 5? console.error('reconcileChildFibers2'):'';
      }
    } else{
      console.error('reconcileChildFibers3', newChild)
    }
    // Remaining cases are all treated as empty.
    return deleteRemainingChildren(returnFiber, currentFirstChild);
  }
  return reconcileChildFibers;
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
