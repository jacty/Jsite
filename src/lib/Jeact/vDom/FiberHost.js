import {
  createElement,
  setInitialProperties,
} from '@Jeact/vDOM/DOMComponent';
import {
  precacheFiberNode,
  updateFiberProps,
} from '@Jeact/vDOM/DOMComponentTree';

function shouldAutoFocusHostComponent(type, props){
  switch(type){
    case 'button':
    case 'input':
    case 'select':
    case 'textarea':
      return !!props.autoFocus;
  }
  return false;
}

export function resetAfterCommit(containerInfo){
  
}

export function createInstance(
  type,
  props, 
  rootContainerInstance,
  hostContext,
  interalInstancedHandle
){
  let parentNamespace = hostContext; 
  const domElement = createElement(
    type,
    props,
    rootContainerInstance,
    parentNamespace,
  )
  precacheFiberNode(interalInstancedHandle, domElement);
  updateFiberProps(domElement, props);
  return domElement;
}

export function finalizeInitialChildren(
  domElement,
  type,
  props,
  rootContainerInstance,
  hostContext
){
  setInitialProperties(domElement, type, props, rootContainerInstance);
  return shouldAutoFocusHostComponent(type, props);
}

export function appendChildToContainer(container, child){
  container.appendChild(child);
}