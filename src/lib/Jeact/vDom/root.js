import { createFiberRoot } from '@Jeact/vDom/FiberRoot';
import { updateContainer } from '@Jeact/vDom/FiberReconciler';

function vRoot(container){
  this._internalRoot = createRootImpl(container);
}

vRoot.prototype.render = function(children){
  const root = this._internalRoot;
  updateContainer(children, root);
};


function createRootImpl(container){
  const root = createFiberRoot(container);
  return root;
}

export function createRoot(container){
  return new vRoot(container)
}

