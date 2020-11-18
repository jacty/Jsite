function getOwnerDocumentFromRootContainer(rootContainerElement){
    return rootContainerElement.ownerDocument;
}
export function createElement(
    type,
    props,
    rootContainerElement,
    parentNamespace
){
    const ownerDocument = getOwnerDocumentFromRootContainer(rootContainerElement);
    let domElement = ownerDocument.createElement(type);
    return domElement;
}

export function setInitialDOMProperties(
    domElement,
    tag,
    props,
    rootContainerElement
){
    for(const propKey in props){
        const nextProp = props[propKey]
        setTextContent(domElement, nextProp);
    }
    
}
function setTextContent(node, text){
    node.textContent = text;
}