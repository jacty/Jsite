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


function JeactElement(type, key, ref, owner, props){
  const element = {
    $$typeof: JEACT_ELEMENT_TYPE,

    // Built-in properties
    type: type,
    key: key,
    ref: ref,
    props: props,
    // Who created this element. From CurrentOwner.current
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
    ref = config.ref;
    key = '' + config.key;

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
