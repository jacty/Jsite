import { createFiber } from './JeactFiber';
import {initializeUpdateQueue} from './JeactUpdateQueue.js';
import {
  NoLanes,
  NoTimestamp,
  NoLanePriority,
  HostRoot,
} from '../shared/Constants';
import {
  createLaneMap,
} from './JeactFiberLane'

import {noTimeout} from '../shared/Constants';

function FiberRootNode(containerInfo){
  this.containerInfo = containerInfo; //RootContainer
  this.current; // refer to FiberNode;
  this.finishedWork = null;
  this.timeoutHandle = noTimeout;
  this.context = null;
  this.pendingContext = null;
  this.callbackNode = null;
  this.callbackPriority = NoLanePriority;
  this.eventTimes = createLaneMap(NoLanes);
  this.expirationTimes = createLaneMap(NoTimestamp);

  this.pendingLanes = NoLanes;
  this.suspendedLanes = NoLanes;
  this.pingedLanes = NoLanes;
  this.expiredLanes = NoLanes;
  this.mutableReadLanes = NoLanes;
  this.finishedLanes = NoLanes;

  this.entangledLanes = NoLanes;
  this.entanglements = createLaneMap(NoLanes);
}

export function createFiberRoot(containerInfo){
  const root = new FiberRootNode(containerInfo);

  const fiber = createFiber(HostRoot);

  root.current = fiber;
  fiber.stateNode = root;

  initializeUpdateQueue(fiber);

  return root;
}
