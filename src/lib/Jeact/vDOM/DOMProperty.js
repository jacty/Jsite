// props reserved for Jeact and shouldn't be written to DOM.

const RESERVED = 0;
const STRING = 1;

const properties = {};

const reservedProps = [
    'children',
]

function PropertyInfoRecord(
    name,
    type,
    mustUseProperty,
    attributeName,
    removeEmptyString
){
    this.attributeName = attributeName;
    this.mustUseProperty = mustUseProperty;
    this.propertyName = name;
    this.type = type;
    this.removeEmptyString = removeEmptyString;
}

reservedProps.forEach(name =>{
    properties[name] = new PropertyInfoRecord(
        name,
        RESERVED,
        false,
        name,
        false
    )
});

[
    ['className', 'class']
].forEach(([name, attributeName]) =>{
    properties[name] = new PropertyInfoRecord(
        name,
        STRING,
        false,
        attributeName,
        false
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
    const {mustUseProperty} = propertyInfo;
    if(mustUseProperty){
        debugger;
    }
    const {attributeName} = propertyInfo 
    if (value === null){
        node.removeAttribute(attributeName);
    } else {
        node.setAttribute(attributeName, value);
    }
}

function getPropertyInfo(name){
    return properties.hasOwnProperty(name) ? properties[name] : null;
}

function shouldIgnoreAttribute(name, propertyInfo){
    if(propertyInfo !== null){
        return propertyInfo.type === RESERVED;
    }
    debugger;
}

function shouldRemoveAttribute(name, value, propertyInfo){
    if (value === null || typeof value === 'undefined'){
        return true;
    }
    if (propertyInfo !== null){
        debugger;
    }
}