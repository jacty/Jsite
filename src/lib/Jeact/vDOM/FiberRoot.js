import {
  NoTimestamp,
  NoLanes,
} from '@Jeact/shared/Constants';
import { createFiber } from '@Jeact/vDOM/Fiber';
import { createLaneMap } from '@Jeact/vDOM/FiberLane';
import {initializeUpdateQueue} from '@Jeact/vDOM/UpdateQueue';

function FiberRootNode(containerInfo){
  this.containerInfo = containerInfo; 
  this.current=null; 
  this.finishedWork = null; 

  this.callbackNode = null;
  this.eventTimes = createLaneMap(0);
  this.expirationTimes = createLaneMap(NoTimestamp);

  this.pendingLanes = NoLanes;
  this.finishedLanes = NoLanes;
}

export function createFiberRoot(container){
  const root = new FiberRootNode(container);
  const fiber = createFiber();//uninitializedFiber
  
  root.current = fiber;
  fiber.stateNode = root;

  initializeUpdateQueue(fiber);

  return root;
}

