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