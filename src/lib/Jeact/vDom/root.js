import {
  __ENV__,
} from '../shared/Constants';
import { createFiberRoot } from '@Jeact/vDom/FiberRoot';
// import { updateContainer } from './JeactFiberReconciler';

function vRoot(container){
  this._internalRoot = createRootImpl(container);
}

vRoot.prototype.render = function(children){
  const root = this._internalRoot;
  updateContainer(children, root);
};


function createRootImpl(container){
  // Connect FiberRootNode to FiberNode and initialize UpdateQueue in FiberNode
  const root = createFiberRoot(container);
  return root;
}

export function createRoot(container){
  return new vRoot(container)
}

