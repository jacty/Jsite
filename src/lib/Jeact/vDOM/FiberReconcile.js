import {
  requestEventTime,
  scheduleUpdateOnFiber
} from '@Jeact/vDOM/FiberWorkLoop';
import {
  createUpdate,
  enqueueUpdate
} from '@Jeact/vDOM/UpdateQueue';
import { requestUpdateLane } from '@Jeact/vDOM/FiberLane';

export function updateContainer(element, container){
  const current = container.current;//uninitialized fiber.

  const eventTime =requestEventTime();
  const lane = requestUpdateLane();
  const update = createUpdate(eventTime, lane);
  update.payload = {element}
  
  enqueueUpdate(current, update);//update fiber.updateQueue.pending.
  scheduleUpdateOnFiber(current, lane, eventTime);
}


