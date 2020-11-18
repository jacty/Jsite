const randomKey = Math.random().toString(36).slice(2);
const internalContainerInstanceKey = '__jeactContainer$' + randomKey;

export function markContainerAsRoot(hostRoot, node){
  node[internalContainerInstanceKey] = hostRoot;
}

