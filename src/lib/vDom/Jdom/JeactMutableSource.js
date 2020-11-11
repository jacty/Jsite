// Work in progress version numbers only apply to a single render, and
// should be reset before starting a new render.
// This tracks which mutable sources need to be reset after a render.
const workInProgressSources = [];

export function resetWorkInProgressVersions(){
  for (let i = 0; i < workInProgressSources.length; i++){
    console.error('resetWorkInProgressVersions')
  }
}
