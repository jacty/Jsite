import {registrationNameDependencies} from '@Jeact/vDOM/events/EventRegistry';

const DANGER_HTML = 'dangerouslySetInnerHTML';
const CHILDREN = 'children';
const TEXT_NODE = 3;

export function createElement(type, rootContainerElement){
    return rootContainerElement.ownerDocument.createElement(type);
}
export function createTextNode(text, rootContainerElement){
    return rootContainerElement.ownerDocument.createTextNode(text);
}
export function setInitialDOMProperties(domElement, props){
    for (let propKey in props){
        if (!props.hasOwnProperty(propKey)){
            continue;
        }
        const prop = props[propKey];
        if(propKey === DANGER_HTML){
            console.error('setInitialDOMProperties');
        } else if(propKey === CHILDREN) {
            if (typeof prop === 'string' || typeof prop === 'number'){
                setTextContent(domElement, prop);
            }
        } else if (registrationNameDependencies.hasOwnProperty(propKey)){
            console.error('setInitialDOMProperties')
        } else if (prop !== null){
            propKey = propKey === 'className' ? 'class':propKey;
            domElement.setAttribute(propKey, prop);
        }
    }
}
export function shouldSetTextContent(type, props){
  return (
    type === 'textarea' ||
    type === 'option'   ||
    type === 'noscript' ||
    typeof props.children === 'string' ||
    typeof props.children === 'number' ||
    (typeof props.dangerouslySetInnerHTML === 'object' && 
      props.dangerouslySetInnerHTML !== null &&
      props.dangerouslySetInnerHTML.__html !== null
    )
  )
}
function setTextContent(node, text){
    if (text){
        const firstChild = node.firstChild;

        if (
            firstChild &&
            firstChild === node.lastChild &&
            firstChild.nodeType === TEXT_NODE
        ){            
        firstChild.nodeValue = text;
        return;
        }
    }
    node.textContent = text;
}