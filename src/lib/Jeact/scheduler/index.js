
import {push, pop, peek} from './SchedulerMinHeap';

import {
  NormalSchedulePriority,
  NormalPriority,
  DefaultLanePriority,
  ImmediatePriority,
  ImmediateSchedulePriority,
  NormalTimeout,
} from '@Jeact/shared/Constants';

// Tasks are stored on a min heap.
const taskQueue = [];
const timerQueue = [];

// Incrementing id counter. Used to maintain insertion order.
let taskIdCount = 1;

let currentTask = null;
let currentPriority = NormalSchedulePriority;

// This is set while performing work, to prevent re-entry.
let isPerformingWork = false;

let isHostCallbackScheduled = false;
let isHostTimeoutScheduled = false;

export function scheduleCallback(priority, callback){
  console.error('scheduleCallback');
  return;
  const schedulePriority = PriorityToSchedulePriority(priority)

  const currentTime = performance.now();

  let startTime = currentTime;
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

  if (startTime > currentTime){
    // This is a delayed task.
    console.log('scheduleCallback3')
  } else {
    newTask.sortIndex = expirationTime;
    push(taskQueue, newTask);

    // Schedule a host callback, if needed. If we're already performing work,
    // wait until the next time we yield.
    if (!isHostCallbackScheduled && !isPerformingWork){
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork)
    }
  }
  return newTask;
}


export function getCurrentSchedulePriority(){
  return currentPriority;
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

/*From SchedulerDOM.js*/

// Scheduler periodically yields in case there is other work on the main
// thread, like user events. By default, it yields multiple times per frame.
// It does not attempt to align with frame boundaries, since most tasks don't
// need to be frame aligned; for those that do, use requestAnimationFrame.
let yieldInterval = 5;
let deadline = 0;

let isMessageLoopRunning = false;
let scheduledHostCallback = null;

let needsPaint = false;

export function shouldYieldToHost(){
  return performance.now() >= deadline;
}

function advanceTimers(currentTime){
  // Check for tasks that are no longer delayed and add them to the queue.
  let timer = peek(timerQueue);
  while (timer !== null){
    console.log('advanceTimers', timer);
    return;
  }
}

function flushWork(hasTimeRemaining, initialTime){

  // We'll need a host callback the next time work is scheduled.
  isHostCallbackScheduled = false;
  if (isHostTimeoutScheduled){
    console.log('flushWork1')
  }

  isPerformingWork = true;
  try{
     return workLoop(hasTimeRemaining, initialTime);
  } finally {
    currentTask = null;
    isPerformingWork = false;
  }
}

function workLoop(hasTimeRemaining, initialTime){

  let currentTime = initialTime;
  advanceTimers(currentTime);

  currentTask = peek(taskQueue);
 
  while(currentTask !== null){
    if(currentTask.expirationTime > currentTime &&
        (!hasTimeRemaining || shouldYieldToHost())
      ){
      console.log('workLoop1')
      break;
    }
    const callback = currentTask.callback;

    if (typeof callback === 'function'){
      currentTask.callback = null;
      currentPriority = currentTask.priority;
      const contiuationCallback = callback();//performConcurrentWorkOnRoot()
      !!contiuationCallback ?
        console.error('workLoop', contiuationCallback):'';
    } else {
      console.log('workLoop2')
    }
    break;
  }
}

function performWorkUntilDeadline(){
  if (scheduledHostCallback !== null){
    const currentTime = performance.now();
    // Yield after `yieldInterval` ms, regardless of where we are in the sync
    // cycle. This means there's always time remaining at the beginning of the
    // message event.
    deadline = currentTime + yieldInterval;
    const hasTimeRemaining = true;
    try{
      // scheduledHostCallback = flushwork;
      const hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);
      !!hasMoreWork?
        console.error('performWorkUntilDeadline'):'';
    } catch (error){
      port.postMessage(null);
      throw error;
    }
  } else {
    console.error('performWorkUntilDeadline1')
    isMessageLoopRunning = false;
  }
  // Yielding to the browser will give it a change to paint, so we can
  // reset this.
  needsPaint = false;
};

const channel = new MessageChannel();
const port = channel.port2;
channel.port1.onmessage = performWorkUntilDeadline;

function requestHostCallback(flushWork){
  scheduledHostCallback = flushWork;
  if (!isMessageLoopRunning){
    isMessageLoopRunning = true;
    port.postMessage(null);
  }
}

export function runWithPriority(priority,fn){
 console.error('runWithPriority');
 return;
  const schedulePriority = PriorityToSchedulePriority(priority);

  return fn();
}
