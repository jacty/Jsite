const didWarnStateUpdateForUnmountedComponent = {};

function warnNoop(publicInstance, callerName){
    if ('production' == process.env.NODE_ENV){
        console.log('warnNoop');
    }

}
const ReactNoopUpdateQueue = {
    enqueueForceUpdate: function(publicInstance, callback, callerName){
        warnNoop(publicInstance, 'forceUpdate');
    },
    enqueueSetState: function(
        publicInstance,
        partialState,
        callback,
        callerName,
    ){
        warnNoop(publicInstance, 'setState');
    },
};

export default ReactNoopUpdateQueue;
