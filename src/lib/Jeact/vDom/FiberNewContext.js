let currentlyRenderingFiber = null;
let lastContextDependency = null;
let lastContextWithAllBitsObserved = null;

export function resetContextDependencies(){
  // This is called right before Jeact yields execution, to ensure `readContext` cannot be called outside the render phase.
  currentlyRenderingFiber = null
  lastContextDependency = null
  lastContextWithAllBitsObserved = null;
}

export function prepareToReadContext(
  workInProgress,
  renderLanes
){
  currentlyRenderingFiber = workInProgress;
  lastContextDependency = null;
  lastContextWithAllBitsObserved = null;
  const dependencies = workInProgress.dependencies;
  if (dependencies!==null){
    console.error('prepareToReadContext1');
  }
}
