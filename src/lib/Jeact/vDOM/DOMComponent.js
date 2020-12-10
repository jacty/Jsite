const DANGEROUS_HTML = 'dangerouslySetInnerHTML'; 
const CHILDREN = 'children';
const HTML = '__html';

function getOwnerDocumentFromRootContainer(rootContainerElement){
    return rootContainerElement.ownerDocument;
}

function setInitialDOMProperties(
    tag, 
    domElement, 
    rootContainerElement, 
    nextProps
){
    for (const propKey in nextProps){
        if (!nextProps.hasOwnProperty(propKey)){
             continue;
        } 
        const nextProp = nextProps[propKey];
        if (propKey === DANGEROUS_HTML){
            const nextHTML = nextProp[HTML];
            domElement.innerHTML = nextHTML;
        } else if (propKey === CHILDREN){
            if(typeof nextProp === 'string' || typeof nextProp === 'number'){
                setTextContent(domElement, ''+ nextProp);
            }
        } else if (nextProp !== null){
            console.error('x', nextProp)
        }
    }
}

export function createElement(type,rootContainerElement){
    const ownerDocument = rootContainerElement.ownerDocument;
    let domElement = ownerDocument.createElement(type);
    return domElement;
}

export function createTextNode(text, rootContainerElement){
    return getOwnerDocumentFromRootContainer(rootContainerElement).createTextNode(text);
}
export function setInitialProperties(
    domElement,
    tag,
    rawprops,
    rootContainerElement
){
    switch(tag){
        case 'img':
            console.error('setInitialProperties',tag)
    }

    setInitialDOMProperties(tag, domElement,rootContainerElement, rawprops);
    
    switch(tag){
        default:
            if(typeof rawprops.onClick === 'function'){
                console.error('setInitialProperties');
            }
    }  
}

function setTextContent(node, text){
    const firstChild = node.firstChild;
    if(firstChild&&
        firstChild === node.lastChild
    ){
        console.error('setTextContent');
    }
    node.textContent = text;
}