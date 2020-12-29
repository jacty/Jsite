const DANGER_HTML = 'dangerouslySetInnerHTML';

export function createElement(type, rootContainerElement){
    return rootContainerElement.ownerDocument.createElement(type);
}
export function createTextNode(text, rootContainerElement){
    return rootContainerElement.ownerDocument.createTextNode(text);
}
export function setInitialDOMProperties(props){
    for (const propKey in props){
        if (!props.hasOwnProperty(propKey)){
            continue;
        }
        const prop = props[propKey];
        if(propKey === DANGER_HTML){
            console.error('setInitialDOMProperties');
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
    );
  )
}