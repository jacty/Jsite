import {setValueForProperty} from '@Jeact/vDOM/DOMProperty';

const CHILDREN = 'children';
const TEXT_NODE = 3;

export function createElement(type, rootContainerElement){
    return rootContainerElement.ownerDocument.createElement(type);
}

export function createTextNode(text, rootContainerElement){
    return rootContainerElement.ownerDocument.createTextNode(text);
}

export function setInitialDOMProperties(domElement, workInProgress){
    let rawProps = workInProgress.pendingProps;
    let props;
    let type = workInProgress.type;
    switch(type){
        case 'img':
            // listenToNonDelegatedEvent('error', domElement);
            props = rawProps;
            break;
        default:
            props = rawProps;
    }

    // setInitialDOMProperties()
    for (let propKey in props){
        if (!props.hasOwnProperty(propKey)){
            continue;
        }
        const prop = props[propKey];
        if(propKey === CHILDREN) {
            if (typeof prop === 'string' || typeof prop === 'number'){
                setTextContent(domElement, prop);
            }
        } else if (prop !== null){
            propKey = propKey === 'className' ? 'class':propKey;
            domElement.setAttribute(propKey, prop);
        }
    }
}

export function diffProperties(
    domElement,
    tag,
    lastProps,
    nextProps,
    rootContainerElement,
){  
    let propKey;
    let updatePayload = null;
    for (propKey in lastProps){
        if(
            nextProps.hasOwnProperty(propKey) ||
            !lastProps.hasOwnProperty(propKey) ||
            lastProps[propKey] == null
        ){
            continue;
        }

        (updatePayload = updatePayload || []).push(propKey, null);
        
    }
    for (propKey in nextProps){
        const nextProp = nextProps[propKey];
        const lastProp = lastProps !== null ? lastProps[propKey] : undefined;
        if (
            !nextProps.hasOwnProperty(propKey) ||
            nextProp === lastProp ||
            (nextProp === null && lastProp === null)
        ){
                continue;
        }
        if(propKey === CHILDREN){
            if (typeof nextProp === 'string' || typeof nextProp === 'number'){
                (updatePayload = updatePayload || []).push(propKey, '' + nextProp);
                
            }
        } else if(propKey === 'onClick'){
            if (!updatePayload && lastProp !== nextProp){
                updatePayload = [];
            }
        } else {
            (updatePayload = updatePayload || []).push(propKey, nextProp);
        }
    }
    return updatePayload;   
}

export function updateDOMProperties(
    domElement,
    updatePayload,
){
    for (let i = 0; i < updatePayload.length; i+= 2){
        const propKey = updatePayload[i];
        const propValue = updatePayload[i + 1];
        if (propKey === CHILDREN){
            setTextContent(domElement, propValue);
        } else {
            setValueForProperty(domElement, propKey, propValue)         
        }
    }
}

export function shouldSetTextContent(props){
  return (
    typeof props.children === 'string' ||
    typeof props.children === 'number'
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
        // For text updates, it's faster to set the `nodeValue` of the Text 
        // node directly instead of using `.textContent` which will remove the 
        // existing node and create a new one.         
        firstChild.nodeValue = text;
        return;
        }
    }
    node.textContent = text;
}

