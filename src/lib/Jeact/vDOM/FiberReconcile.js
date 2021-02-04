import {
  requestEventTime,
  scheduleUpdateOnFiber
} from '@Jeact/vDOM/FiberWorkLoop';
import {
  createUpdate,
  enqueueUpdate,
  entangleTransitions,
} from '@Jeact/vDOM/UpdateQueue';
import { requestUpdateLane } from '@Jeact/vDOM/FiberLane';

export function updateContainer(element, container){
  const current = container.current;//uninitialized fiber.

  const eventTime =requestEventTime();
  const lane = requestUpdateLane();
  const update = createUpdate(eventTime, lane);
  update.payload = {element}
  
  enqueueUpdate(current, update);//update fiber.updateQueue.pending.
  const rootFiber = scheduleUpdateOnFiber(current, lane, eventTime);
  if(rootFiber !== null){
    entangleTransitions(rootFiber, current, lane);
  }
}


