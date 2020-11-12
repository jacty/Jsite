const randomKey = Math.random().toString(36).slice(2);
const internalContainerInstanceKey = '__jeactContainer$' + randomKey;

export function markContainerAsRoot(node, hostRoot){
  node[internalContainerInstanceKey] = hostRoot;
}

export function isContainerMarkedAsRoot(node){
  return !!node[internalContainerInstanceKey];
}
