import {
  requestEventTime,
  requestUpdateLane,
  scheduleUpdateOnFiber
} from '@Jeact/vDom/FiberWorkLoop'
import {
  createUpdate,
  enqueueUpdate
} from '@Jeact/vDom/UpdateQueue';

function getContextForSubtree(parentComponent){
  if (!parentComponent){
    return {};
  }
  console.log('getContextForSubtree', parentComponent)
}

export function updateContainer(element, container){
  const current = container.current;
  
  const eventTime =requestEventTime();
  const lane = requestUpdateLane(current);
  const context = getContextForSubtree();

  if (container.context === null){
    container.context = context;
  } else {
    console.log('updateContainer1')
  }

  const update = createUpdate(eventTime, lane);

  update.payload =  { element };

  enqueueUpdate(current, update);
  scheduleUpdateOnFiber(current, lane, eventTime);

  return lane;
}


