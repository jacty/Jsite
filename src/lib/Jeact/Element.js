import { 
  JEACT_ELEMENT_TYPE,
} from '@Jeact/shared/Constants';

const hasOwnProperty = Object.prototype.hasOwnProperty;

const RESERVED_ATTR = {
  key: true,
  ref: true,
};

function JeactElement(type, key, props){
  const element = {
    $$typeof: JEACT_ELEMENT_TYPE,

    // Built-in properties
    type: type,
    key: key,
    props: props,
  };

  return element;
};

export function createElement(type, attrs, children){
  let propName; 
  const props = {};
  let key = null;

  if (attrs != null) {
    key = attrs.key=== undefined ? null : '' + attrs.key;

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
    type,
    key,
    props,
  );
}
