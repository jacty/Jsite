import {
  NoLane,
  NoLanes,
  NoLanePriority,
  NormalPriority,
  DefaultLanePriority,
  DefaultLane,
  TransitionLanes,
  NonIdleLanes,
  NoTimestamp,
  RetryLanes,
} from '@Jeact/shared/Constants';
import {updateEventWipLanes} from '@Jeact/vDOM/FiberWorkLoop';

// Used by getHighestPriorityLanes and getNextLanes:
let highestLanePriority = DefaultLanePriority;

function getHighestPriorityLanes(lanes){
  switch(getHighestPriorityLane(lanes)){
    case DefaultLane:
      highestLanePriority = DefaultLanePriority;
      return DefaultLane
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
    return [NoLanes, NoLanePriority];
  }
  
  let nextLanes = NoLanes;
  let nextLanePriority = NoLanePriority;

  const suspendedLanes = root.suspendedLanes;

  if(root.expiredLanes || root.entangledLanes){
    debugger;
  }


  // Do not work on any idle work until all the non-idle work has finished,
  // even it the work is suspended.
  const nonIdlePendingLanes = pendingLanes & NonIdleLanes;
  if (nonIdlePendingLanes !== NoLanes){
    const nonIdleUnblockedLanes = nonIdlePendingLanes & ~suspendedLanes;
    if (nonIdleUnblockedLanes !== NoLanes){
      nextLanes = getHighestPriorityLanes(nonIdleUnblockedLanes);
      nextLanePriority = highestLanePriority;
    } else {
      debugger;
    }
  } else {
    // The only remaining work is Idle.
    debugger;
  }
  if(wipLanes !== 0 && wipLanes !== nextLanes){debugger}

  return [nextLanes, highestLanePriority];
}

function computeExpirationTime(lane, currentTime){
  // TODO: Expiration heuristic is constant per lane, so could use a map.
  getHighestPriorityLanes(lane);//update global variable highestLanePriority
  return currentTime + 5000;
}

export function markStarvedLanesAsExpired(root, currentTime){
  const suspendedLanes = root.suspendedLanes;
  If(root.pingedLanes){debugger};
  const expirationTimes = root.expirationTimes;

  // Iterate through the pending lanes and check if we've reached their expiration time. If so, we'll assume the update is being starved and mark it as expired to force it to finish.
  let lanes = root.pendingLanes;
  while (lanes>0) {
    const index = laneToIndex(lanes);
    const lane = 1 << index; // move 1 towards left for {index} bits.
    const expirationTime = expirationTimes[index];
    if (expirationTime === NoTimestamp){
      if (
        (lane & suspendedLanes) === NoLanes){
        // Assumes timestamps are monotonically increasing.
        expirationTimes[index] = computeExpirationTime(lane, currentTime);
      }
    } else if(expirationTime <= currentTime){
      // This lane expired
      root.expiredLanes |= lane;
    }
    lanes &= ~lane;
  }
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

export function requestUpdateLane(lanePriority=1, wipLanes=0){
  updateEventWipLanes()
  // code below is from findUpdateLane() in React.
  switch (lanePriority) {
    case DefaultLanePriority: {//Jeact:1; React:8
      return DefaultLane; // 128
    }
    default:
      debugger;
      // The remaining priorities are not valid for updates
      console.log('findUpdateLane.default', lanePriority)
      break;
  }
}

export function getHighestPriorityLane(lanes){
  return lanes & -lanes; // Why this way can get the highest priority?
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
  // TODO: temporarily set pendingLanes instead of adding up it to confirm if 
  // there are cases that multiple lanes pending together.
  root.pendingLanes = updateLane;
  
  const eventTimes = root.eventTimes;
  const index = laneToIndex(updateLane);

  eventTimes[index] = eventTime;
}

export function markRootSuspended(root, suspendedLanes){
  root.suspendedLanes |= suspendedLanes;
  root.pingedLanes &= ~suspendedLanes;

  const expirationTimes = root.expirationTimes;
  let lanes = suspendedLanes;
  if (lanes > 0){
    debugger;
  }
}

export function markRootPinged(root, pingedLanes, eventTime){
  root.pingedLanes |= root.suspendedLanes & pingedLanes;
}

export function markRootFinished(root, remainingLanes){
  const noLongerPendingLanes = root.pendingLanes & ~remainingLanes;

  root.pendingLanes = remainingLanes;

  root.suspendedLanes = 0;

  const pooledCacheLanes = root.pooledCacheLanes &= remainingLanes;
  if(pooledCacheLanes === NoLanes){
    root.pooledCache = null;
  }

  const eventTimes = root.eventTimes;
  const expirationTimes = root.expirationTimes;

  // Clear the lanes that no longer have pending work
  let lanes = noLongerPendingLanes;
  while(lanes > 0){
    const index = laneToIndex(lanes);
    const lane = 1 << index;

    eventTimes[index] = 0;
    expirationTimes[index] = NoTimestamp;

    lanes &= ~lane;
  }
}
