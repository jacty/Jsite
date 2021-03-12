import {createFiberRoot} from '@Jeact/vDOM/FiberRoot';
import {updateContainer} from '@Jeact/vDOM/FiberReconcile';
import {listenToAllSupportedEvents} from '@Jeact/vDOM/events/EventSystem';

function vRoot(container){
  this._Root = createRootImpl(container);
}

vRoot.prototype.render = function(children){
  updateContainer(children, this._Root);
}

function createRootImpl(container){
  const root = createFiberRoot(container); //pair to createContainer();
  listenToAllSupportedEvents(container);
  return root;
}

export function createRoot(container){
  return new vRoot(container)
}

