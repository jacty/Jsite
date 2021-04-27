export class Target{
    constructor(
        targetInfo,
        browserContext,
        sessionFactory,
    ){
        this._targetInfo = targetInfo;
        this._browserContext = browserContext;
        this._targetId = targetInfo.targetId;
        this._sessionFactory = sessionFactory;
        this._initializedPromise = new Promise(
            (fulfill) => (this._initializedCallback = fulfill)
        ).then(async(success) => {
            if (!success) return false;
            const opener = this.opener();
            if (!opener || !opener._pagePromise || this.type() !== 'page'){
                return true;
            }
            console.error('opener', opener)
            const openerPage = await opener._pagePromise;
        });
        this._isInitialized = 
            this._targetInfo.type !== 'page' || this._targetInfo.url !== '';
        if (this._isInitialized) this._initializedCallback(true);
    }
    type(){
        const type = this._targetInfo.type;
        if(
            type === 'page' ||
            type === 'background_page' ||
            type === 'service_worker' ||
            type === 'shared_worker' ||
            type === 'browser' ||
            type === 'webview'
        ){
            return type
        }
        return 'other';
    }
    browser(){
        return this._browserContext.browser();
    }
    browserContext(){
        return this._browserContext;
    }
    opener(){
        const { openerId } = this._targetInfo;
        if (!openerId) return null;
        return this.browser()._targets.get(openerId);
    }
}