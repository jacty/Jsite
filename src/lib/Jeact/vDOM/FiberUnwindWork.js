import {SuspenseComponent} from '@Jeact/shared/Constants';

export function unwindWork(workInProgress, renderLanes){
    switch(workInProgress.tag){
        case SuspenseComponent:{
            debugger;
        }
        default:
            return null;
    }
}