import {Events} from './Events.js';
import { 
  FrameManager,
  FrameManagerEmittedEvents
} from './FrameManager.js';

export const PageEmittedEvents = {
  FrameAttached:'frameattached',
  FrameDetached:'framedetached',
  FrameNavigated:'framenavigated'
}

export class Page extends Events{
  static async create(
    client,
    target
  ){
    const page = new Page(client, target);
    await page._initialize();
    return page;
  }
  constructor(client, target){
    super();
    this._client = client;
    this._target = target;
    this._frameManager = new FrameManager(
      client,
      this
    );
    client.on('Target.attachedToTarget', (e) => {
      console.error('TargetattachedToTarget', e);
    });
    client.on('Target.detachedFromTarget', (e) => {
      console.error('TargetdetachedFromTarget', e)
    });

    this._frameManager.on(FrameManagerEmittedEvents.FrameAttached, (e) =>
      this.emit(PageEmittedEvents.FrameAttached, e)
    );
    this._frameManager.on(FrameManagerEmittedEvents.FrameDetached, (e) =>
      this.emit(PageEmittedEvents.FrameDetached, e)
    );
    this._frameManager.on(FrameManagerEmittedEvents.FrameNavigated, (e) =>
      this.emit(PageEmittedEvents.FrameNavigated, e)
    )
  }
  async _initialize(){
    await Promise.all([
      this._frameManager.initialize(),
      this._client.send('Target.setAutoAttach', {
        autoAttach: true,
        waitForDebuggerOnStart: false,
        flatten: true
      }),
    ])
  }
  async goto(url){
    console.log('11')
  }
}