import {
  DefaultLanePriority,
  InputDiscreteLanePriority,
  NORMAL_PRIORITY_TIMEOUT,
  USER_BLOCKING_PRIORITY_TIMEOUT
} from '@Jeact/shared/Constants';
import {push,pop, peek} from './SchedulerMinHeap';

// Tasks are stored on a min heap.
let taskQueue = [];

// Incrementing id counter. Used to maintain insertion order.
let taskIdCount = 1;

let currentTask = null;

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

function flushWork(){
  isHostCallbackScheduled = false;
  if(isHostCallbackScheduled){
    console.error('flushWork');
  }

  isPerformingWork = true;

  try{
     return workLoop();
  } finally {
    // flags may be set in workLoop should be reset finally.
    currentTask = null;
    isPerformingWork = false;
  }
}
// the return value of this function decides if there will be another re-runs of this function through performWorkUntilDeadline();
function workLoop(){
  const currentTime = performance.now();
  deadline = currentTime + yieldInterval;
  
  currentTask = peek(taskQueue);
  while(currentTask !== null){
    if(currentTask.expirationTime > currentTime &&
       shouldYieldToHost()
      ){
      // deadline reached but currentTask hasn't expired.
      break;
    }
    //performConcurrentWorkOnRoot()
    const callback = currentTask.callback;
    if(typeof callback === 'function'){
      currentTask.callback = null;
      const continuationCallback = callback();
      if(typeof continuationCallback === 'function'){
        currentTask.callback = continuationCallback
      } else {
        if(currentTask === peek(taskQueue)){
          pop(taskQueue);
        }
      }
    } else {
      pop(taskQueue);
    }
  }
  // Return whether there's additional work.
  if (currentTask !== null){
    return true;
  } else {
    return false;
  }
}

export function runWithPriority(priority,fn){
  try {
    return fn()
  } finally{
  }
}

export function scheduleCallback(priority, callback){
  
  let startTime = performance.now();
  let timeout;
  switch (priority){
    case InputDiscreteLanePriority:
      timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
      break;
    case DefaultLanePriority:
    default:
      timeout = NORMAL_PRIORITY_TIMEOUT;
      break;
  }

  let expirationTime = startTime + timeout;

  const newTask = {
    id: taskIdCount++,
    callback,
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

export function shouldYieldToHost(){
  return performance.now() >= deadline;
}

function performWorkUntilDeadline(){
  if (scheduledHostCallback !== null){
    let hasMoreWork = true;
    try{
      // scheduledHostCallback = flushWork;
      hasMoreWork = scheduledHostCallback();
    } finally {
      if (hasMoreWork){
        // If there's more work, schedule the next message event at the end
        // of the preceding one.
        port.postMessage(null);
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
