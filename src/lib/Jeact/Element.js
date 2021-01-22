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
* @arg config: attributes attached on {comp}
* @arg children: Children of {comp}
*/
export function createElement(comp, attrs, children){
  let propName; // key in object {attrs}
  const props = {};// To keep items from {attrs}
  let key = null;
  let ref = null;

  if (attrs != null) {
    ref = attrs.ref; //TD:Support string ref ?
    key = '' + attrs.key;

    for (propName in attrs){
      if(attrs.hasOwnProperty(propName)&&
          !RESERVED_ATTR.hasOwnProperty(propName)
      ){
        props[propName] = attrs[propName];
      }
    }
  }

  const childrenLength = arguments.length - 2;
  if (childrenLength === 1){ 
    // arguments[2] will be set to props.children.
    props.children = children;
  } else if (childrenLength > 1){
    // more than one child node in the tree.
    props.children = [...arguments].slice(2,childrenLength+2);
  }

  return JeactElement(
    comp,
    key,
    ref,
    CurrentOwner.current,
    props,
  );
}
