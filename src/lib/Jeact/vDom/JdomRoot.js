import {
  __ENV__,
} from '../shared/Constants';
// import { createFiberRoot } from './JeactFiberRoot';
// import { updateContainer } from './JeactFiberReconciler';

function JdomRoot(container, options){
  this._internalRoot = createRootImpl(container, options);
}

JdomRoot.prototype.render = function(children){
  const root = this._internalRoot;
  updateContainer(children, root);
};


function createRootImpl(container){
  // Connect FiberRootNode to FiberNode and initialize UpdateQueue in FiberNode
  const root = createFiberRoot(container);

  return root;
}

export function createRoot(container){
    console.error('createRoot')
    return;
  return new JdomRoot(container)
}

