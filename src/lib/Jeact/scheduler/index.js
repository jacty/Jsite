import {
  NormalSchedulePriority,
  NormalPriority,
  DefaultLanePriority,
  ImmediatePriority,
  ImmediateSchedulePriority,
  NormalTimeout,
} from '@Jeact/shared/Constants';
import {push, pop, peek} from './SchedulerMinHeap';

// Tasks are stored on a min heap.
const taskQueue = [];

// Incrementing id counter. Used to maintain insertion order.
let taskIdCount = 1;

let currentTask = null;
let currentPriority = NormalSchedulePriority;

// This is set while performing work, to prevent re-entry.
let isPerformingWork = false;

let isHostCallbackScheduled = false;

// Scheduler periodically yields in case there is other work on the main
// thread, like user events. By default, it yields multiple times per frame.
// It does not attempt to align with frame boundaries, since most tasks don't
// need to be frame aligned; for those that do, use requestAnimationFrame.
let yieldInterval = 5;
let deadline = 0;

let isMessageLoopRunning = false;
let scheduledHostCallback = null;

function flushWork(initialTime){
  // We'll need a host callback the next time work is scheduled.
  isHostCallbackScheduled = false;
  isPerformingWork = true;

  const previousPriority = currentPriority;
  try{
     return workLoop(initialTime);
  } finally {
    // flags may be set in workLoop should be reset finally.
    currentTask = null;
    currentPriority = previousPriority;
    isPerformingWork = false;
  }
}
// the return value of this function decides if there will be another re-runs of this function through performWorkUntilDeadline();
function workLoop(initialTime){
  let currentTime = initialTime;
  currentTask = peek(taskQueue);

  if(currentTask !== null){
    if(currentTask.expirationTime > currentTime &&
       shouldYieldToHost()
      ){
      // deadline reached but currentTask hasn't expired.
      // break;
    }
    const callback = currentTask.callback;

    currentPriority = currentTask.priority;
    //performConcurrentWorkOnRoot()
    callback();
    
    currentTask = peek(taskQueue);
  }
  // Return whether there's additional work.
  if (currentTask !== null){
    return true;
  } else {
    return false;
  }
}

export function runWithPriority(priority,fn){
  const schedulePriority = PriorityToSchedulePriority(priority);
  switch(priority){
    case ImmediatePriority:
      break;
    default:
      priority = NormalPriority;
  }
  const previousPriority = currentPriority;
  currentPriority = priority;
  try {
    return fn()
  } finally{
    currentPriority = previousPriority;
  }
}

export function scheduleCallback(priority, callback){
  const schedulePriority = PriorityToSchedulePriority(priority)
  let startTime = performance.now();

  let timeout;
  switch(schedulePriority){
    case NormalSchedulePriority:
    default:
      schedulePriority!==NormalSchedulePriority?console.log('scheduleCallback2', schedulePriority):'';
      timeout = NormalTimeout;
      break;
  }

  let expirationTime = startTime + timeout;
  const newTask = {
    id: taskIdCount++,
    callback,
    priority:schedulePriority,
    startTime,
    expirationTime,
    sortIndex: -1,
  };
  // to sort task order in siftUp();  
  newTask.sortIndex = expirationTime;
  push(taskQueue, newTask);

  // Schedule a host callback, if needed. If we're already performing work,
  // wait until the next time we yield.
  if (!isHostCallbackScheduled && !isPerformingWork){
    isHostCallbackScheduled = true;
    requestHostCallback(flushWork)
  }
 
  return newTask;
}

export function getCurrentSchedulePriority(){
  return currentPriority;
}

export function shouldYieldToHost(){
  return performance.now() >= deadline;
}

function performWorkUntilDeadline(){
  if (scheduledHostCallback !== null){
    const currentTime = performance.now();
    deadline = currentTime + yieldInterval;
    let hasMoreWork = true;
    try{
      // scheduledHostCallback = flushWork;
      hasMoreWork = scheduledHostCallback(currentTime);
    } finally {
      if (hasMoreWork){
        // If there's more work, schedule the next message event at the end
        // of the preceding one.
        port.postMessage(null);//debug
      } else {
        isMessageLoopRunning = false;
        scheduledHostCallback = null;
      }
    }
  } else {
    isMessageLoopRunning = false;
  }
};

const channel = new MessageChannel();
const port = channel.port2;
channel.port1.onmessage = performWorkUntilDeadline;

function requestHostCallback(callback){
  scheduledHostCallback = callback;
  if (!isMessageLoopRunning){
    isMessageLoopRunning = true;
    port.postMessage(null);
  }
}









export function PriorityToLanePriority(priority){
  switch(priority){
    case NormalPriority://97
      return DefaultLanePriority;
    default:
      if(priority !== NoLanePriority){
        console.error('UnknowPriority', priority)
      } else {
        return NoLanePriority;
      }
  }
}

export function PriorityToSchedulePriority(priority){
  switch(priority){
    case ImmediatePriority:
        return ImmediateSchedulePriority;
    case NormalPriority:
      return NormalSchedulePriority;
    default:
      console.log('PriorityToSchedulePriority', priority)
  }
}