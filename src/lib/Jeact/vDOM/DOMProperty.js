// props reserved for Jeact and shouldn't be written to DOM.
const RESERVED = 0;
const STRING = 1;

const properties = {};

const reservedProps = [
    'children',
]

function PropertyInfo(
    name,
    type,
    attributeName,
){
    this.propertyName = name;
    this.attributeName = attributeName;
    this.type = type;
}

reservedProps.forEach(name =>{
    properties[name] = new PropertyInfo(
        name,
        RESERVED,
        name,
    )
});

[
    ['className', 'class']
].forEach(([name, attributeName]) =>{
    properties[name] = new PropertyInfo(
        name,
        STRING,
        attributeName,
    )
});
['src', 'href'].forEach(attributeName => {
    properties[attributeName] = new PropertyInfo(
        attributeName,
        STRING,
        attributeName.toLowerCase()
    )
})

export function setValueForProperty(node, name, value){
    const propertyInfo = getPropertyInfo(name);
    if(shouldIgnoreAttribute(name, propertyInfo)){
        return;
    }
    if (shouldRemoveAttribute(name, value, propertyInfo)){
        value = null;
    }
    if (propertyInfo === null){
        node.setAttribute(name, ''+value);
    }else {
        const {attributeName} = propertyInfo;
        node.setAttribute(attributeName, ''+value);
    }
}

function getPropertyInfo(name){
    return properties.hasOwnProperty(name) ? properties[name] : null;
}

function shouldIgnoreAttribute(name, propertyInfo){
    if(propertyInfo !== null){
        return propertyInfo.type === RESERVED;
    }
    if(name.length>2 &&
        name.slice(0,2).toLowerCase() === 'on'
    ){
        return true;
    }
    return false;
}

function shouldRemoveAttribute(name, value, propertyInfo){
    if (value === null || 
        typeof value === 'undefined' ||
        value === ''
        ){
        return true;
    }
    return false;
}

