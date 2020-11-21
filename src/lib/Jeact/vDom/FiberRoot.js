import { createFiber } from '@Jeact/vDom/Fiber';
import {initializeUpdateQueue} from '@Jeact/vDom/UpdateQueue.js';
import {
  __ENV__,
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
  this.entanglements = createLaneMap(0);

  if(__ENV__){
    this._debugRootType = 'createRoot()';
  }
}

export function createFiberRoot(containerInfo){
  const root = new FiberRootNode(containerInfo);
  
  const fiber = createFiber();
  root.current = fiber;
  fiber.stateNode = root;

  initializeUpdateQueue(fiber);

  return root;
}
