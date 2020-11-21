function setInitialDOMProperties(tag, domElement, rootContainerElement, nextProps){
    for (const propKey in nextProps){
        console.error('setInitialDOMProperties', propKey)
    }
}

export function createElement(type,props,rootContainerElement,parentNamespace){
    let isCustomComponentTag;

    const ownerDocument = rootContainerElement.ownerDocument;

    let domElement = ownerDocument.createElement(type);
    return domElement;
}

export function setInitialProperties(domElement,tag,rawprops,rootContainerElement){
    let props;
    switch(tag){
        case 'img':
            console.error('setInitialProperties',tag)
    }

    setInitialDOMProperties(tag, domElement,rootContainerElement, props);
    switch(tag){
        default:
            if(props&& typeof props.onClick === 'function'){
                console.error('setInitialProperties');
            }
    }  
}

function setTextContent(node, text){
    node.textContent = text;
}