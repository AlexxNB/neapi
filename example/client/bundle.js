var example = (function (exports) {
    'use strict';

    const endpoint = function (endpoint) {
        check_globals();
        if(endpoint === undefined) return window.neapi.endpoint;
        window.neapi.endpoint = endpoint;
    };

    const context = function (ctx) {
        check_globals();
        if(ctx === undefined) return window.neapi.context;
        window.neapi.context = ctx;
    };

    const onRequest = function (callback) {
        check_globals();
        if(callback === undefined) return window.neapi.onRequest;
        window.neapi.onRequest = callback;
    };

    const onResponce = function (callback) {
        check_globals();
        if(callback === undefined) return window.neapi.onResponce;
        window.neapi.onResponce = callback;
    };

    const init = function (params) {
        if(params.endpoint !== undefined) endpoint(params.endpoint);
        if(params.context !== undefined) context(params.context);
        if(params.onRequest !== undefined) onRequest(params.onRequest);
        if(params.onResponce !== undefined) onResponce(params.onResponce);
    };

    const check_globals = function() {
        if(!window) throw new Error('[NeAPI] Client can work only in browser');
        if(!window.neapi) window.neapi = {
            endpoint:'/api',
            onResponce: ()=>{},
            onRequest: ()=>{},
            context:{}
        };
    };

    const responceValidator = function (responce) {
        if(!responce.namespace) return false;
        if(!responce.method) return false;
        if(responce.error === undefined) return false;
        if(responce.payload === undefined) return false;
        if(responce.context === undefined) return false;
        return true;
    };

    const request = async (namespace,method,params) => {

        let packet = {
            namespace,
            method,
            params,
            context:context()
        };

        const onRequestHook = onRequest();
        onRequestHook(packet);
        
        let raw_responce = await fetch(endpoint(),{ 
            method: 'POST',
            headers: {  
                "Content-type": "application/json; charset=UTF-8"
            }, 
            credentials: 'include',  
            body: JSON.stringify(packet)
        });

        if(raw_responce.status !== 200) throw new Error('[NeAPI] Bad answer from server');

        let responce = await raw_responce.json();

        if(!responceValidator(responce)) throw new Error('[NeAPI] Invalid responce packet');

        const onResponceHook = onResponce();
        onResponceHook(responce);
        
        return {
            error:  responce.error,
            payload:responce.payload
        };
    };

    var neapi = {
        init,
        context,
        request
    };

    neapi.init({
        endpoint: '/api',
        onRequest: (packet) => console.log('NeAPI Request:', packet),
        onResponce: (packet) => console.log('NeAPI Responce:', packet)
    });

    function doCountAddition() {
        const a = Number(document.getElementById('ex1_a').value);
        const b = Number(document.getElementById('ex1_b').value);

        neapi.request('algebra','addition',{a,b}).then((responce)=>{
            console.log(responce);
        });
    }

    exports.doCountAddition = doCountAddition;

    return exports;

}({}));
//# sourceMappingURL=bundle.js.map
