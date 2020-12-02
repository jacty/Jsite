import {Incomplete} from '@Jeact/shared/Constants';
export function throwException(root, returnFiber, sourceFiber){
    // source fiber has not completed yet.
    sourceFiber.flags |= Incomplete;
    // Its effect list is no longer valid.
    console.warn('throwException', sourceFiber.flags, Incomplete);
}