import {
  Placement
} from '../shared/Constants';
import {
  JEACT_ELEMENT_TYPE,
} from '../shared/JeactSymbols';
import {
  createFiberFromElement
} from './JeactFiber';

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
    while (child !== null){
      console.error('reconcileSingleElement1')
    }
    const created = createFiberFromElement(element, returnFiber.mode, lanes);
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
    newChild,
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
          console.error('reconcileChildFibers1', newChild.$$typeof)
      };
    }

    // Remaining cases are all treated as empty.
    return deleteRemainingChildren(returnFiber, currentFirstChild);
  }
  return reconcileChildFibers;
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
