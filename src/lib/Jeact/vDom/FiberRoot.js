import { createFiber } from '@Jeact/vDom/Fiber';
import {initializeUpdateQueue} from '@Jeact/vDom/UpdateQueue.js';
import {
  NoTimestamp,
  HostRoot,
  noTimeout,
} from '@Jeact/shared/Constants';
import {
  createLaneMap,
} from '@Jeact/vDom/FiberLane'


function FiberRootNode(containerInfo){
  this.containerInfo = containerInfo; //RootContainer
  this.current=null; // refer to FiberNode;
  this.finishedWork = null;
  this.timeoutHandle = noTimeout;
  this.context = null;
  this.pendingContext = null;
  this.callbackNode = null;
  this.callbackPriority = 0;
  this.eventTimes = createLaneMap(0);
  this.expirationTimes = createLaneMap(NoTimestamp);

  this.pendingLanes = 0;
  this.suspendedLanes = 0;
  this.pingedLanes = 0;
  this.expiredLanes = 0;
  this.mutableReadLanes = 0;
  this.finishedLanes = 0;

  this.entangledLanes = 0;
  this.entanglements = createLaneMap(0);
}

export function createFiberRoot(containerInfo){

  const root = new FiberRootNode(containerInfo);

  const fiber = createFiber(HostRoot);//uninitializedFiber
  root.current = fiber;
  fiber.stateNode = root;

  initializeUpdateQueue(fiber);

  return root;
}
