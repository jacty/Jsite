import {__ENV__} from '@Jeact/shared/Constants'
import {DebugCurrentFrame} from '@Jeact/shared/internals';

export let current = null;
export let isRendering = false;

function getCurrentFiberStackInDev(){
    console.error('getCurrentFiberStackInDev')
};

export function resetCurrentDebugFiberInDev(){
    // alternate of resetCurrentFiber()
    if (__ENV__){
        DebugCurrentFrame.getCurrentStack = null;
        current = null;
        isRendering = false;   
    }

}

export function setCurrentDebugFiberInDev(fiber){
    // alternate of setCurrentFiber()
    if (__ENV__){
        DebugCurrentFrame.getCurrentStack = getCurrentFiberStackInDev;
        current = fiber;
        isRendering = false;         
    }
}