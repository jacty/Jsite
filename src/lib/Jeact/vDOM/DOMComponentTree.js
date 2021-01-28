const randomKey = Math.random().toString(36).slice(2);
const interalInstanceKey = '__jeactFiber$' + randomKey;
const internalPropsKey = '__jeactProps$' + randomKey;

export function precacheFiberNode(hostInst, node){
    node[interalInstanceKey] = hostInst;
}

export function updateFiberProps(node, props){
    node[internalPropsKey] = props;
}