import {
  NoLane,
  NoLanes,
  DefaultLanePriority,
  DefaultLane,
  TransitionLanes,
  NonIdleLanes,
  NoTimestamp,
  RetryLanes,
  SyncLane,
  SyncLanePriority,
  IdleLane,
  RetryLane1
} from '@Jeact/shared/Constants';
import {updateEventWipLanes} from '@Jeact/vDOM/FiberWorkLoop';
import {getCurrentUpdatePriority} from '@Jeact/vDOM/UpdatePriorities';
import {getCurrentEventPriority} from '@Jeact/vDOM/events/EventPriorities';
// Used by getHighestPriorityLanes and getNextLanes:
let highestLanePriority = DefaultLanePriority;
let nextRetryLane = RetryLane1;

function getHighestPriorityLanes(lanes){
  switch(getHighestPriorityLane(lanes)){
    case SyncLane:
      highestLanePriority = SyncLanePriority;
      return SyncLane;
    case DefaultLane:
      highestLanePriority = DefaultLanePriority;
      return DefaultLane
    case RetryLane1:
      debugger
      return lanes & RetryLanes;
    default:
      debugger;
      console.error('error', lanes);
  }
}

export function LanePriorityToPriority(lanePriority){
  switch(lanePriority){
    case DefaultLanePriority:
      return NormalPriority;
    default:
      console.log('ToSchedulePriority', lanePriority)
  }
}

export function getNextLanes(root, wipLanes){

  const pendingLanes = root.pendingLanes;
  if (pendingLanes === NoLanes){
    return NoLanes;
  }
  
  let nextLanes = NoLanes;

  const suspendedLanes = root.suspendedLanes;
  const pingedLanes = root.pingedLanes;
  
  const nonIdlePendingLanes = pendingLanes & NonIdleLanes; // useless?
  // to check usage of expression above
  if(nonIdlePendingLanes !== pendingLanes) debugger;
  if(nonIdlePendingLanes !== NoLanes){
    const nonIdleUnblockedLanes = nonIdlePendingLanes & ~suspendedLanes;
    if (nonIdleUnblockedLanes !== NoLanes){
      nextLanes = getHighestPriorityLanes(nonIdleUnblockedLanes);
    } else {
      debugger;
      const nonIdlePingedLanes = nonIdlePendingLanes & pingedLanes;
      if (nonIdlePingedLanes !== NoLanes){
        nextLanes = getHighestPriorityLanes(nonIdlePingedLanes);
      }
    }
  } else {
    debugger;
    // remaining work
    const unblockedLanes = pendingLanes & ~suspendedLanes;
    if (unblockedLanes !== NoLanes){
      debugger;
      nextLanes = getHighestPriorityLanes(unblockedLanes);
    } else {
      debugger;
      if (pingedLanes !== NoLanes){
        nextLanes = getHighestPriorityLanes(pingedLanes);
      }
    }
  }

  if (nextLanes === NoLanes){
    // suspended case
    debugger;
    return NoLanes;
  }

  // If we're already in the middle of a render, switching lanes will lost 
  // progress. Only do this if the new lanes are higher priority.
  if (
    wipLanes !== NoLanes &&
    wipLanes !== nextLanes &&
    // If we already suspended with a delay, then interrupting is fine.
    (wipLanes & suspendedLanes) == NoLanes
  ){
    debugger;
    const nextLane = getHighestPriorityLanes(nextLanes);
    const wipLane = getHighestPriorityLanes(wipLanes);
    if (
      nextLane >= wipLane ||
      (nextLane === DefaultLane && (wipLane & TransitionLanes) !== NoLanes) 
    ){
        return wipLanes;
    }
  }
  const entangledLanes = root.entangledLanes;
  if (entangledLanes !== NoLanes){
    const entanglements = root.entanglements;
    let lanes = nextLanes & entangledLanes;
    while (lanes > 0){
      const index = laneToIndex(lanes);
      const lane = 1 << index;

      nextLanes |= entanglements[index];

      lanes &= ~lane;
    }
  }

  return nextLanes;
}

function computeExpirationTime(lane, currentTime){
  switch (lane){
    case SyncLane:
      return currentTime + 250;
    case DefaultLane:
    case RetryLane1:
      return currentTime + 5000;
    default:
      debugger;
      return NoTimestamp;
  }
}

export function markStarvedLanesAsExpired(root, currentTime){
  
  const suspendedLanes = root.suspendedLanes;
  const pingedLanes = root.pingedLanes;
  const expirationTimes = root.expirationTimes;

  // Iterate through the pending lanes and check if we've reached their expiration time. If so, we'll assume the update is being starved and mark it as expired to force it to finish.
  let lanes = root.pendingLanes;
  let expiredLanes = 0;
  while (lanes > 0) {
    const index = laneToIndex(lanes);
    const lane = 1 << index; // move 1 towards left for {index} bits.
    
    const expirationTime = expirationTimes[index];
    if (expirationTime === NoTimestamp){
      if (
        (lane & suspendedLanes) === NoLanes ||
        (lane & pingedLanes) !== NoLanes
        ){
        expirationTimes[index] = computeExpirationTime(lane, currentTime);
      }
    } else if(expirationTime <= currentTime){
      // This lane expired
      expiredLanes |= lane;
    }
    lanes &= ~lane;
  }

  if (expiredLanes !== 0){
    markRootExpired(root, expiredLanes);
  }
}

export function includesNonIdleWork(lanes){
  return (lanes & NonIdleLanes) !== NoLanes;
}

export function includesOnlyRetries(lanes){
  return (lanes & RetryLanes) === lanes;
}

export function isTransitionLane(lane){
  return (lane & TransitionLanes) !== 0;
}

export function getNextLanesPriority(){
  return highestLanePriority;
}

export function requestUpdateLane(){
  updateEventWipLanes()

  // Updates originating inside Jeact.
  // Adapted from ReactEventPriorities.new.js
  const updateLane = getCurrentUpdatePriority();
  if (updateLane !== NoLane){
    debugger;
    return updateLane;
  }

  // Updates originated outside Jeact.
  // Adapted from ReactDOMHostConfig.js
  const eventLane = getCurrentEventPriority();
  return eventLane;
}

export function claimNextRetryLane(){
  const lane = nextRetryLane;
  nextRetryLane <<= 1;
  if((nextRetryLane & RetryLanes) === 0){
    nextRetryLane = RetryLane1;
  }
  return lane;
}

export function getHighestPriorityLane(lanes){
  return lanes & -lanes; 
}

function getLowestPriorityLane(lanes){
  // This finds the most significant non-zero bit.
  const index = 31 - Math.clz32(lanes);
  return index < 0 ? NoLanes : 1 << index;
}

function laneToIndex(lanes){
  return 31 - Math.clz32(lanes);
}

export function includesSomeLane(a, b){
  return (a & b) !== NoLanes;
}

export function isSubsetOfLanes(set, subset){
  return (set & subset) === subset;
}

export function mergeLanes(a, b){
  return a | b;
}

export function removeLanes(set, subset){
  return set & ~subset;
}

export function markRootUpdated(root, updateLane, eventTime){
  root.pendingLanes |= updateLane;
    
  if(updateLane !== IdleLane){
    if (root.suspendedLanes !== 0 || root.pingedLanes !== 0) debugger;
  }
  
  const eventTimes = root.eventTimes;
  const index = laneToIndex(updateLane);

  eventTimes[index] = eventTime;
}

export function markRootSuspended(root, suspendedLanes){
  root.suspendedLanes |= suspendedLanes;
  root.pingedLanes &= ~suspendedLanes;
  // The suspended lanes are no longer CPU-bound. Clear the expiration times.
  const expirationTimes = root.expirationTimes;
  let lanes = suspendedLanes;
  while (lanes > 0){
    const index = laneToIndex(lanes);
    const lane = 1 << index;

    expirationTimes[index] = NoTimestamp;

    lanes &= ~lane;
  }
}

export function markRootPinged(root, pingedLanes, eventTime){
  root.pingedLanes |= root.suspendedLanes & pingedLanes;
}

export function markRootExpired(root, expiredLanes){
  const entanglements = root.entanglements;
  const SyncLaneIndex = 0;
  entanglements[SyncLaneIndex] |= expiredLanes;
  root.entangledLanes |= SyncLane;
  root.pendingLanes |= SyncLane;

}

export function markRootFinished(root, remainingLanes){
  const noLongerPendingLanes = root.pendingLanes & ~remainingLanes;

  root.pendingLanes = remainingLanes;

  root.suspendedLanes = 0;

  root.entangledLanes &= remainingLanes;

  const pooledCacheLanes = root.pooledCacheLanes &= remainingLanes;
  if(pooledCacheLanes === NoLanes){
    root.pooledCache = null;
  }

  const entanglements = root.entanglements;
  const eventTimes = root.eventTimes;
  const expirationTimes = root.expirationTimes;

  // Clear the lanes that no longer have pending work
  let lanes = noLongerPendingLanes;
  while(lanes > 0){
    const index = laneToIndex(lanes);
    const lane = 1 << index;

    entanglements[index] = NoLanes;
    eventTimes[index] = 0;
    expirationTimes[index] = NoTimestamp;

    lanes &= ~lane;
  }
}
