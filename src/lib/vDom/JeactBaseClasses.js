import ReactNoopUpdateQueue from './JeactNoopUpdateQueue.js';


function Component(props, context, updater) {
    this.props = props;
    this.updater = updater || ReactNoopUpdateQueue;
}

Component.prototype.isReactComponent = {};

Component.prototype.setState = function(partialState, callback) {
    this.updater.enqueueSetState(this, partialState, callback, 'setState');
}
Component.prototype.forceUpdate = function(callback){
    this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
}

function ComponentDummy() {}
ComponentDummy.prototype = Component.prototype


function PureComponent(props, context, updater){
    console.log('JeactBaseClasses.PureComponent')
}

const pureComponentPrototype = (PureComponent.prototype = new ComponentDummy())
pureComponentPrototype.constructor = PureComponent;

Object.assign(pureComponentPrototype, Component.prototype);
pureComponentPrototype.isPureReactComponent = true;

export {Component, PureComponent};

