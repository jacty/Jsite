import {Events} from './Events.js';

export const FrameManagerEmittedEvents = {
  FrameAttached: Symbol('FrameManager.FrameAttached'),
  FrameNavigated: Symbol('FrameManager.FrameNavigated'),
  FrameDetached: Symbol('FrameManager.FrameDetached')
}

export class FrameManager extends Events{
  constructor(client, page){
    super();
    this._client = client;
    this._page = page;
  }

  async initialize(){
    const result = await Promise.all([
      this._client.send('Page.enable'),
      this._client.send('Page.getFrameTree'),
    ]);

    const { frameTree } = result[1];
    this._handleFrameTree(frameTree);
    console.log('x', result)
  }

  _handleFrameTree(frameTree){
    if (frameTree.frame.parentId){
      this._onFrameAttached(frameTree.frame.id, frameTree.frame.parentId);
    }
    this._onFrameNavigated(frameTree.frame);
    console.log('xx', frameTree)
  }
  _onFrameNavigated(framePayload){
    const isMainFrame = !framePayload.parentId;
    console.log('_onFrameNavigated', framePayload);
    // let frame = isMainFrame
    //   ? this._mainFrame
    //   : this._frames.get(framePayload.id);

    // if (frame){
    //   for (const child of frame.childFrames()){
    //     this._removeFramesRecursively(child);
    //   }
    // }

    // if (isMainFrame){
    //   console.log('_onFrameNavigated')
    // }
    
    // frame._navigated(framePayload);
  }
}