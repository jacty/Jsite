import {createFiberRoot} from '@Jeact/vDOM/FiberRoot';
import {updateContainer} from '@Jeact/vDOM/FiberReconcile';
import {listenToAllSupportedEvents} from '@Jeact/vDOM/FiberEvent';

function vRoot(container){
  this._Root = createRootImpl(container);
}

vRoot.prototype.render = function(children){
  updateContainer(children, this._Root);
}

function createRootImpl(container){
  // createContainer()
  const root = createFiberRoot(container);
  listenToAllSupportedEvents(container);
  return root;
}

export function createRoot(container=document.querySelector('#root')){
  return new vRoot(container)
}

