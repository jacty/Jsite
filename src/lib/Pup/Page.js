import {Events} from './Events.js';

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
  }
  async _initialize(){
    await Promise.all([
      this._client.send('Target.setAutoAttach', {
        autoAttach: true,
        waitForDebuggerOnStart: false,
        flatten: true
      }),
    ])
  }
}