import {
  __ENV__,  
  JEACT_ELEMENT_TYPE,
} from '@Jeact/shared/Constants';
import {CurrentOwner} from '@Jeact/shared/internals';

const hasOwnProperty = Object.prototype.hasOwnProperty;
// Attributes reserved for internal usage.
const RESERVED_ATTR = {
  key: true,
  ref: true,
};

function hasValidRef(config){
  return config.ref !== undefined;
}

function hasValidKey(config){
  return config.key !== undefined;
}

function warnStringRef(config){
  if (typeof config.ref === 'string'){
    console.error('String ref is not supported.')
  }
}

function JeactElement(type, key, ref, owner, props){
  const element = {
    $$typeof: JEACT_ELEMENT_TYPE,

    // Built-in properties
    type: type,
    key: key,
    ref: ref,
    props: props,
    // Record the component responsible for creating this element.
    _owner: owner,
  };

  return element;
};

/**
* @arg type: Component|DOM
* @arg config: attributes attached on {type}
* @arg children: Children of {type}
*/
export function createElement(type, config, children){
  let propName; // key in object {config}
  const props = {};// To keep items in {config}
  let key = null;
  let ref = null;

  if (config != null) {
    if (hasValidRef(config)){
      ref = config.ref;
      if(__ENV__){
        warnStringRef(config);
      }
    }
    ref = hasValidRef(config) ? config.ref : '';
    key = hasValidKey(config) ? config.key : '';

    for (propName in config){
      if(config.hasOwnProperty(propName)&&
          !RESERVED_ATTR.hasOwnProperty(propName)
      ){
        props[propName] = config[propName];
      }
    }
  }

  const childrenLength = arguments.length - 2;
  if (childrenLength === 1){ 
    // arguments[2] will be set to props.children.
    props.children = children;
  } else if (childrenLength > 1){
    const childArray = Array(childrenLength);
    for (let i = 0; i < childrenLength; i++){
      childArray[i] = arguments[i + 2];
    }
    if (__ENV__){
      // to protect the first version.
      Object.freeze(childArray);
    }
    props.children = childArray;
  }

  return JeactElement(
    type,
    key,
    ref,
    CurrentOwner.current,
    props,
  );
}
