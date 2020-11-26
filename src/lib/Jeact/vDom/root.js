import { createFiberRoot } from '@Jeact/vDOM/FiberRoot';
import { updateContainer } from '@Jeact/vDOM/FiberReconciler';

function vRoot(container){
  this._Root = createRootImpl(container);
}

vRoot.prototype.render = function(children){
  const root = this._Root;

  updateContainer(children, root);
};


function createRootImpl(container){
  // 1.Create FiberRoot and Fiber.
  // 2.Connect them to each other.
  // 3.InitializeUpateQueue.
  const root = createFiberRoot(container);

  container.nodeType !== 1 ? console.error('createRootImpl'):'';
  return root;
}

export function createRoot(container){
  return new vRoot(container)
}

