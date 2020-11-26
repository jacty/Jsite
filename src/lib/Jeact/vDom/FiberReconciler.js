import {
  __ENV__
} from '@Jeact/shared/Constants';
import {
  requestEventTime,
  requestUpdateLane,
  scheduleUpdateOnFiber
} from '@Jeact/vDOM/FiberWorkLoop'
import {
  createUpdate,
  enqueueUpdate
} from '@Jeact/vDOM/UpdateQueue';

function getContextForSubtree(parentComponent){
  if (!parentComponent){
    return {};
  }
  console.log('getContextForSubtree', parentComponent)
}

export function updateContainer(element, fiberRoot){
  const current = fiberRoot.current;
  const eventTime =requestEventTime();
  const lane = requestUpdateLane(current);

  const context = getContextForSubtree();
  if (fiberRoot.context === null){
    fiberRoot.context = context;
  } else {
    console.log('updateContainer1')
  }

  const update = createUpdate(eventTime, lane);
  update.payload =  { element }; // element is the key of payload;

  enqueueUpdate(current, update);//update fiber.updateQueue.pending.
  scheduleUpdateOnFiber(current, lane, eventTime);
}


