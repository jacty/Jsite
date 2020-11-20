import {
    markContainerAsRoot
} from '@Jeact/vDOM/DOMComponentTree';
import { createFiberRoot } from '@Jeact/vDOM/FiberRoot';
import { updateContainer } from '@Jeact/vDOM/FiberReconciler';

function vRoot(container){
  this._internalRoot = createRootImpl(container);
}

vRoot.prototype.render = function(children){
  const root = this._internalRoot;
  updateContainer(children, root);
};


function createRootImpl(container){
  const root = createFiberRoot(container);
  markContainerAsRoot(root.current, container);
  container.nodeType !== 1 ? console.error('createRootImpl'):'';

  return root;
}

export function createRoot(container){
  return new vRoot(container)
}

