import {__ENV__} from '@Jeact/shared/Constants'
import {DebugCurrentFrame} from '@Jeact/shared/internals';

export let current = null;
export let isRendering = false;

function getCurrentFiberStackInDev(){
    console.error('getCurrentFiberStackInDev')
};

export function setCurrentDebugFiberInDev(fiber){
    // alternate of setCurrentFiber()
    DebugCurrentFrame.getCurrentStack = getCurrentFiberStackInDev;
    current = fiber;
    isRendering = false; 
}