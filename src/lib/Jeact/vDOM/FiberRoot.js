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
  this.suspendedLanes = NoLanes;
  this.pingedLanes = NoLanes;// Suspense related
  this.pingCache = null;
  this.finishedLanes = NoLanes;
  this.finishedWork = null;
  // Cache Component
  this.pooledCache = null;
  this.pooledCacheLanes = NoLanes;
}

export function createFiberRoot(container){
  // prepare fiberRoot and fiber and connect them.
  const root = new FiberRootNode(container);
  const fiber = createFiber();//uninitializedFiber
  root.current = fiber;
  fiber.stateNode = root;

  const initialCache = new Map();
  root.pooledCache = initialCache;
  const initialState = {
    element: null,
    cache: initialCache
  };
  fiber.memoizedState = initialState;

  initializeUpdateQueue(fiber);

  return root;
}

