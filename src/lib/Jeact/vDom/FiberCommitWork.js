import{
 HostRoot
} from '@Jeact/shared/Constants';

export function commitBeforeMutationEffectOnFiber(finishedWork){
  switch(finishedWork.tag){
    case HostRoot:{
      return;
    }
  }
  console.error('commitBeforeMutationEffectOnFiber', finishedWork.tag);
}


