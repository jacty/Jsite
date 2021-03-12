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
  //uninitialized fiber.
  const current = root.current;

  const eventTime =requestEventTime();
  const lane = requestUpdateLane(); // default is 128;
  const update = createUpdate(eventTime, lane);

  update.payload = {element}
  
  //update fiber.updateQueue.pending.
  enqueueUpdate(current, update);
  const rootFiber = scheduleUpdateOnFiber(current, lane, eventTime);
  
}


