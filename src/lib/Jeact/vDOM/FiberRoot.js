import {
  NoTimestamp,
  NoLanes
} from '@Jeact/shared/Constants';
import { createFiber } from '@Jeact/vDOM/Fiber';
import {initializeUpdateQueue} from '@Jeact/vDOM/UpdateQueue';

function FiberRootNode(containerInfo){
  this.containerInfo = containerInfo; 
  this.current=null; 
  this.pendingLanes = NoLanes;
  
  this.callbackNode = null;
  this.eventTimes = Array(31).fill(0);
  this.expirationTimes = Array(31).fill(NoTimestamp);;
  
  // Suspense related.
  this.pingedLanes = NoLanes;
  this.pingCache = null;

  this.finishedLanes = NoLanes;
  this.finishedWork = null;
}

export function createFiberRoot(container){
  const root = new FiberRootNode(container);
  const fiber = createFiber();
  root.current = fiber;
  fiber.stateNode = root;

  const initialState = {
    element: null,
  };
  fiber.memoizedState = initialState;

  initializeUpdateQueue(fiber);

  return root;
}

