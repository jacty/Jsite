import { createFiber } from '@Jeact/vDom/Fiber';
import {initializeUpdateQueue} from '@Jeact/vDom/UpdateQueue.js';
import {
  NoTimestamp,
  HostRoot,
  noTimeout,
  NoLanes,
} from '@Jeact/shared/Constants';
import {
  createLaneMap,
} from '@Jeact/vDom/FiberLane'


function FiberRootNode(containerInfo){
  this.containerInfo = containerInfo; 
  this.current=null; 
  this.finishedWork = null;
  this.timeoutHandle = noTimeout;
  this.context = null;
  this.pendingContext = null;
  this.callbackNode = null;
  // this.callbackPriority = 0;
  this.eventTimes = createLaneMap(0);
  this.expirationTimes = createLaneMap(NoTimestamp);

  this.pendingLanes = NoLanes;
  this.suspendedLanes = NoLanes;
  this.pingedLanes = NoLanes;
  this.expiredLanes = NoLanes;
  // this.mutableReadLanes = 0;
  this.finishedLanes = 0;

  this.entangledLanes = NoLanes;
  // this.entanglements = createLaneMap(0);
}

export function createFiberRoot(containerInfo){
  const root = new FiberRootNode(containerInfo);
  const fiber = createFiber(HostRoot);//uninitializedFiber

  root.current = fiber;
  fiber.stateNode = root;
  // if every fiber will have a initialized Update Queue, we can initialize it
  // when create Fiber.
  initializeUpdateQueue(fiber);

  return root;
}
