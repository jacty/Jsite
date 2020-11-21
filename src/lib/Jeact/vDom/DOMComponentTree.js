const randomKey = Math.random().toString(36).slice(2);
const internalInstanceKey = '__JeactFiber$' + randomKey;
const internalPropsKey = '__JeactProps$' + randomKey;
const internalContainerInstanceKey = '__JeactContainer$' + randomKey;

export function precacheFiberNode(hostInst, node){
    node[internalInstanceKey] = hostInst;
}
export function markContainerAsRoot(hostRoot, node){
  node[internalContainerInstanceKey] = hostRoot;
}

export function updateFiberProps(node, props){
    node[internalPropsKey] = props;
}
