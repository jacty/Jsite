import {
  requestEventTime,
  scheduleUpdateOnFiber
} from '@Jeact/vDOM/FiberWorkLoop';
import {
  createUpdate,
  enqueueUpdate,
} from '@Jeact/vDOM/UpdateQueue';
import { requestUpdateLane } from '@Jeact/vDOM/FiberLane';

export function updateContainer(element, root){
  
  // prepare and enqueue `update` 
  const current = root.current;//uninitialized fiber.
  const eventTime =requestEventTime();
  const lane = requestUpdateLane(); // default is 128;
  const update = createUpdate(eventTime, lane, element);
  enqueueUpdate(current, update); //update fiber.updateQueue.pending.
  
  const rootFiber = scheduleUpdateOnFiber(current, lane, eventTime);
  
}


