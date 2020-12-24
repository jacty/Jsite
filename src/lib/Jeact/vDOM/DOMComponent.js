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