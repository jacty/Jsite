import {
  NoTimestamp,
  HostRoot,
  noTimeout,
  NoLanes,
} from '@Jeact/shared/Constants';
import { createFiber } from '@Jeact/vDOM/Fiber';
import { createLaneMap } from '@Jeact/vDOM/FiberLane'

function FiberRootNode(containerInfo){
  this.containerInfo = containerInfo; 
  this.current=null; 
  this.finishedWork = null;
  this.timeoutHandle = noTimeout;
  this.callbackNode = null;
  this.eventTimes = createLaneMap(0);
  this.expirationTimes = createLaneMap(NoTimestamp);

  this.pendingLanes = NoLanes;
  this.suspendedLanes = NoLanes;
  this.pingedLanes = NoLanes;
  this.expiredLanes = NoLanes;
  this.finishedLanes = NoLanes;
}

export function createFiberRoot(container){
  const root = new FiberRootNode(container);
  
  const fiber = createFiber();
  root.current = fiber;
  fiber.stateNode = root;
  return root;
}
