import {__ENV__} from '@Jeact/shared/Constants'
import {DebugCurrentFrame} from '@Jeact/shared/internals';

let current = null;
let isRendering = false;

function getCurrentFiberStackInDev(){
    console.error('getCurrentFiberStackInDev')
};

export function resetCurrentFiber(){
    DebugCurrentFrame.getCurrentStack = null;
    current = null;
    isRendering = false;   
}

export function setCurrentFiber(fiber){
    DebugCurrentFrame.getCurrentStack = getCurrentFiberStackInDev;
    current = fiber;
    isRendering = false;         
}

export function setIsRendering(rendering){
    isRendering = rendering;
}