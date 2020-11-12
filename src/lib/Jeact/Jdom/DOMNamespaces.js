const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
// Assumes there is no parent namespace.
export function getIntrinsicNamespace(type){
  switch (type){
    default:
      return HTML_NAMESPACE;
  }
}
export function getChildNamespace(parentNamespace, type){
  if (parentNamespace == null || parentNamespace === HTML_NAMESPACE){
    // No (or default) parent namespace: potential entry point.
    return getIntrinsicNamespace(type);
  }
  console.error('getChildNamespace', parentNamespace, type)
  // By default, pass namespace below.
  return parentNamespace;
}
