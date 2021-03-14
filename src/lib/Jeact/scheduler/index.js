import {
  DefaultLanePriority,
  InputDiscreteLanePriority,
  NORMAL_PRIORITY_TIMEOUT,
  USER_BLOCKING_PRIORITY_TIMEOUT
} from '@Jeact/shared/Constants';
import {push,pop,peek} from './SchedulerMinHeap';

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

function flushWork(initialTime){
  // For next time work scheduled.
  isHostCallbackScheduled = false;
  isPerformingWork = true;

  try{
     return workLoop();
  } finally {
    // flags may be set in workLoop should be reset finally.
    currentTask = null;
    isPerformingWork = false;
  }
}
// the return value of this function decides will be set to hasMoreWork.
function workLoop(){
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

export function runWithPriority(fn){
  try {
    return fn()
  } finally{
  }
}

export function scheduleCallback(priority, callback){
  let startTime = performance.now();
  let timeout;
  switch (priority){
    case DefaultLanePriority:
    default:
      timeout = NORMAL_PRIORITY_TIMEOUT;
      break;
  }

  let expirationTime = startTime + timeout;

  const newTask = {
    id: taskIdCount++,
    callback,
    priority,
    startTime,
    expirationTime,
    sortIndex: expirationTime,
  };

  push(taskQueue, newTask);

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
  const currentTime = performance.now();
  deadline = currentTime + yieldInterval;
  let hasMoreWork = true;
    try{
      // scheduledHostCallback = flushWork;
      hasMoreWork = scheduledHostCallback(currentTime);
    } catch (error){
      console.error('Err:',error);
      hasMoreWork = false;
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
