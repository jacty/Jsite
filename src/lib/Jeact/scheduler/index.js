import {
  NORMAL_PRIORITY_TIMEOUT,
  NormalSchedulePriority,
} from '@Jeact/shared/Constants';
import {
  push,
  pop,
  peek
} from './SchedulerMinHeap';

let taskQueue = [];
let taskIdCount = 1;

let currentTask = null;
let currentPriorityLevel = NormalSchedulePriority;

let isPerformingWork = false;
let isHostCallbackScheduled = false;

let isMessageLoopRunning = false;
let scheduledHostCallback = null;

// Scheduler periodically yields in case there is other work on the main
// thread, like user events. By default, it yields multiple times per frame.
// It does not attempt to align with frame boundaries, since most tasks don't
// need to be frame aligned; for those that do, use requestAnimationFrame.
let yieldInterval = 5;
let deadline = 0;

function flushWork(currentTime){
  // For next time work scheduled.
  isHostCallbackScheduled = false;
  isPerformingWork = true;
  const previousPriorityLevel = currentPriorityLevel;
  try{
    return workLoop(currentTime);
  } finally {
    // flags may be set in workLoop should be reset finally.
    currentTask = null;
    currentPriorityLevel = previousPriorityLevel;
    isPerformingWork = false;
  }
}
// the return value of this function decides will be set to hasMoreWork.
function workLoop(currentTime){
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

export function scheduleCallback(priorityLevel, callback){
  let startTime = performance.now();
  let timeout;
  switch (priorityLevel) {
    case NormalSchedulePriority:
    default:
      if(priorityLevel!==NormalSchedulePriority){
        debugger;
      }
      timeout = NORMAL_PRIORITY_TIMEOUT;
      break;
  }

  let expirationTime = startTime + timeout;

  const newTask = {
    id: taskIdCount++,
    callback,
    priorityLevel,
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
