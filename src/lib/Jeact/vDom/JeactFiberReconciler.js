import {
  __ENV__,
  emptyContextObject,
} from '../shared/Constants';
import {
  requestEventTime,
  requestUpdateLane,
  scheduleUpdateOnFiber
} from './JeactFiberWorkLoop'
import {
  createUpdate,
  enqueueUpdate
} from './JeactUpdateQueue';

function getContextForSubtree(parentComponent){
  if (!parentComponent){
    return emptyContextObject;
  }
  console.log('getContextForSubtree', parentComponent)
}

export function updateContainer(element, container, parentComponent){
  const current = container.current;
  const eventTime =requestEventTime();
  const lane = requestUpdateLane(current);

  const context = getContextForSubtree(parentComponent);
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


