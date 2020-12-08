import {
  NoLane,
  NoLanes,
  NoLanePriority,
  NormalPriority,
  DefaultLanePriority,
  TransitionLanePriority,
  DefaultLanes,
  NonIdleLanes,
  TotalLanes,
  NoTimestamp,
} from '@Jeact/shared/Constants';

// Used by getHighestPriorityLanes and getNextLanes:
let highestLanePriority = DefaultLanePriority;

function getHighestPriorityLanes(lanes){
  const defaultLanes = DefaultLanes & lanes;
  if (defaultLanes !== 0){
    highestLanePriority = DefaultLanePriority;
    return defaultLanes;
  }
  console.log('getHighestPriorityLanes', defaultLanes);
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
    highestLanePriority = NoLanePriority;
    return NoLanes;
  }

  let nextLanes = NoLanes;
  let nextLanePriority = NoLanePriority;

  const expiredLanes = root.expiredLanes;
  const suspendedLanes = root.suspendedLanes;
  const pingedLanes = root.pingedLanes;
  // Check if any work has expired.
  if (expiredLanes !== NoLanes){
    nextLanes = expiredLanes;
    nextLanePriority = highestLanePriority;
  } else {
    // Do not work on any idle work until all the non-idle work has finished,
    // even it the work is suspended.
    const nonIdlePendingLanes = pendingLanes & NonIdleLanes;
    if (nonIdlePendingLanes !== NoLanes){
      const nonIdleUnblockedLanes = nonIdlePendingLanes & ~suspendedLanes;
      if (nonIdleUnblockedLanes !== NoLanes){
        nextLanes = getHighestPriorityLanes(nonIdleUnblockedLanes);
        nextLanePriority = highestLanePriority;
      } else {
        console.log('getNextLanes3')
      }
    } else {
      // The only remaining work is Idle.
      console.log('getNextLanes3')
    }
  }

  if (nextLanes === NoLanes){
    console.log('getNextLanes4')
    return NoLanes;
  }

  // If there are higher priority lanes, we'll include them even if they are
  // suspended.
  nextLanes = pendingLanes & getEqualOrHigherPriorityLanes(nextLanes);

  // If we're already in the middle of a render, switching lanes will interrupt
  // it and we'll lose our progress. We should only do this if the new lanes
  // are higher priority.
  if(wipLanes !== NoLanes &&
      wipLanes !== nextLanes){
    console.error('getNextLanes4', wipLanes, nextLanes)
  }

  return nextLanes;
}

function computeExpirationTime(lane, currentTime){
  // TODO: Expiration heuristic is constant per lane, so could use a map.
  getHighestPriorityLanes(lane);//update global variable highestLanePriority
  const priority = highestLanePriority;

  if (priority >= TransitionLanePriority){
    return currentTime + 5000;
  } else {
    console.error('computeExpirationTime1')
  }
}

export function markStarvedLanesAsExpired(root, currentTime){

  const suspendedLanes = root.suspendedLanes;
  const pingedLanes = root.pingedLanes;
  const expirationTimes = root.expirationTimes;

  // Iterate through the pending lanes and check if we've reached their expiration time. If so, we'll assume the update is being starved and mark it as expired to force it to finish.
  let lanes = root.pendingLanes;
  while (lanes>0) {
    const index = pickArbitraryLaneIndex(lanes);
    const lane = 1 << index; // move 1 towards left for {index} bits.
    const expirationTime = expirationTimes[index];
    if (expirationTime === NoTimestamp){
      if (
        (lane & suspendedLanes) === NoLanes ||
        (lane & pingedLanes) !== NoLanes){
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

export function getNextLanesPriority(){
  return highestLanePriority;
}

export function findUpdateLane(lanePriority, wipLanes){
  switch (lanePriority) {
    case DefaultLanePriority: {//8
      let lane = getHighestPriorityLane(DefaultLanes & ~wipLanes);
      if (lane === NoLane) {
        console.error('findUpdateLane1')
      }
      return lane;
    }
    default:
      // The remaining priorities are not valid for updates
      console.log('findUpdateLane.default', lanePriority)
      break;
  }
}

function getHighestPriorityLane(lanes){
  return lanes & -lanes; // Why this way can get the highest priority.
}

function getLowestPriorityLane(lanes){
  // This finds the most significant non-zero bit.
  const index = 31 - Math.clz32(lanes);
  return index < 0 ? NoLanes : 1 << index;
}

function getEqualOrHigherPriorityLanes(lanes){
  return (getLowestPriorityLane(lanes) << 1) -1;
}

function pickArbitraryLaneIndex(lanes){
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

export function createLaneMap(initial){
  // Intentionally pushing one by one.
  // https://v8.dev/blog/elements-kinds#avoid-creating-holes
  const laneMap = [];
  for (let i = 0; i < TotalLanes; i++){
    laneMap.push(initial);
  }
  return laneMap;
}

export function markRootUpdated(root, updateLane, eventTime){

  root.pendingLanes |= updateLane;

  // Unsuspend any update at equal or lower priority.
  const higherPriorityLanes = updateLane - 1; // Turns 0b1000 into 0b0111

  root.suspendedLanes &= higherPriorityLanes;
  root.pingedLanes &= higherPriorityLanes;

  const eventTimes = root.eventTimes;
  const index = pickArbitraryLaneIndex(updateLane);

  eventTimes[index] = eventTime;
}

export function markRootFinished(root, remainingLanes){
  const noLongerPendingLanes = root.pendingLanes & ~remainingLanes;

  root.pendingLanes = remainingLanes;

  root.suspendedLanes = 0;
  root.pingedLanes = 0;
  
  root.expiredLanes &= remainingLanes;

  const eventTimes = root.eventTimes;
  const expirationTimes = root.expirationTimes;

  // Clear the lanes that no longer have pending work
  let lanes = noLongerPendingLanes;
  while(lanes > 0){
    const index = pickArbitraryLaneIndex(lanes);
    const lane = 1 << index;

    eventTimes[index] = NoTimestamp;
    expirationTimes[index] = NoTimestamp;

    lanes &= ~lane;
  }
}
