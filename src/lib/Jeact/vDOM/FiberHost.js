import {
  createElement,
  createTextNode,
  setInitialProperties,
} from '@Jeact/vDOM/DOMComponent';

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

export function createInstance(
  type,
  rootContainerInstance,
){
  const domElement = createElement(type,rootContainerInstance)
  return domElement;
}

export function appendInitialChild(parentInstance, child){
  parentInstance.appendChild(child);
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

export function createTextInstance(text, rootContainerInstance, hostContext, interalInstancedHandle){
  const textNode = createTextNode(text, rootContainerInstance);
  return textNode;
}

export function appendChildToContainer(container, child){
  container.appendChild(child);
}