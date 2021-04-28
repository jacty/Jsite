import {createFiberRoot} from '@Jeact/vDOM/FiberRoot';
import {requestUpdateLane} from '@Jeact/vDOM/FiberLane';
import {
  requestEventTime,
  scheduleUpdateOnFiber
} from '@Jeact/vDOM/FiberWorkLoop';
import {
  createUpdate,
  enqueueUpdate,
} from '@Jeact/vDOM/UpdateQueue';

function vRoot(container){
  this._Root = createRootImpl(container);
}

vRoot.prototype.render = function(children){
  updateContainer(children, this._Root);
}

function createRootImpl(container){
  const root = createFiberRoot(container);
  return root;
}

export function createRoot(container=document.querySelector('#root')){
  return new vRoot(container)
}

function updateContainer(element, root){ 
  // prepare and enqueue `update` 
  const current = root.current;//uninitialized fiber.
  const eventTime =requestEventTime();
  const lane = requestUpdateLane();
  const update = createUpdate(eventTime, lane, element);

  enqueueUpdate(current, update); //update fiber.updateQueue.pending.
  const rootFiber = scheduleUpdateOnFiber(current, lane, eventTime);  
}
