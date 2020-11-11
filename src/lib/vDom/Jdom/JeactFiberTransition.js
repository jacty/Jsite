import {JeactSharedInternals} from '../shared/JeactSharedInternals';

const {JeactCurrentBatchConfig} = JeactSharedInternals;

export const NoTransition = 0;

export function requestCurrentTransition(){
  return JeactCurrentBatchConfig.transition;
}
