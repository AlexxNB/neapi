var example = (function (exports) {
	'use strict';

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var utils = createCommonjsModule(function (module, exports) {
	(function(exports){

	    const object_manager = (obj) => {
	        return {
	            get:(propname) => propname === undefined ? obj : obj[propname],
	            set:(propname,value) => obj[propname] = value,
	            clear:(propname) => propname === undefined ? Object.keys(obj).forEach(key=>delete obj[key]) : delete obj[propname],
	            merge:(part) => obj = Object.assign(obj, part),
	        }
	    };

	   exports.object_manager = object_manager;

	})( exports);
	});

	const object_manager = utils.object_manager;

	const client = function (user_config) {

	    const default_config = {
	        endpoint: '/api',
	        onRequest: async () => {},
	        onResponce: async () => {}
	    };

	    const config = Object.assign({}, default_config, user_config);

	    return {
	        request:request(config),
	    }

	};


	const request = (config) => async (namespace,method,params,context_cb) => {
	    
	    const context = object_manager({});
	    if(typeof context_cb === 'function') context_cb(context);

	    const packet = getPacket();
	    
	    packet.namespace = namespace;
	    packet.method = method || 'unknown';
	    packet.params = params || {};

	    await config.onRequest({
	        namespace:packet.namespace,
	        method:packet.method,
	        params:packet.params
	    },context);

	    packet.context = context.get();

	    let raw_responce = await fetch(config.endpoint,{ 
	        method: 'POST',
	        headers: {  
	            "Content-type": "application/json; charset=UTF-8"
	        }, 
	        credentials: 'include',  
	        body: JSON.stringify(packet)
	    });

	    if(raw_responce.status !== 200) throw new Error('[NeAPI] Bad answer from server');

	    let responce = await raw_responce.json();

	    if(!responce_validator(responce)) throw new Error('[NeAPI] Invalid responce packet');
	    
	    let rcv_context = object_manager(responce.context);

	    await config.onResponce({
	        namespace:responce.namespace,
	        method:responce.method,
	        payload:responce.payload,
	        error:responce.error,
	    },rcv_context);

	    return {
	        error:  responce.error,
	        payload:responce.payload,
	        context:rcv_context
	    };
	};

	const getPacket = function () {
	    return {
	        namespace:'',
	        method:'',
	        params:{},
	        context:{}
	    }
	};

	const responce_validator = function (responce) {
	    if(!responce.namespace) return false;
	    if(!responce.method) return false;
	    if(responce.error === undefined) return false;
	    if(responce.payload === undefined) return false;
	    if(responce.context === undefined) return false;
	    return true;
	};

	var neapi = {
	    client
	};

	const api = neapi.client({
	    endpoint: '/api',
	    onRequest: (packet,context) => {
	        console.log('NeAPI Request:', packet);
	        console.log('NeAPI Request Context:', context.get());
	    },
	    onResponce: (packet,context) => {
	        console.log('NeAPI Responce:', packet);
	        console.log('NeAPI Responce Context:', context.get());
	    }
	});



	function doCountAddition() {
	    const a = Number(document.getElementById('ex1_a').value);
	    const b = Number(document.getElementById('ex1_b').value);

	    api.request('algebra','addition',{a,b},c=>c.set('test',true)).then((responce)=>{
	        if(responce.error){
	            alert("We have an error!");
	        }else{
	            alert("The sum is equal "+responce.payload);
	        }
	    });
	}

	function doLogin() {
	    const login = document.getElementById('ex2_login').value;
	    const password = document.getElementById('ex2_password').value;

	    neapi.request('auth','get_token',{login,password}).then((responce)=>{
	        if(responce.error){
	            alert("We have an error!");
	        }

	        // we will save token in onResponce hook
	    });
	}

	exports.doCountAddition = doCountAddition;
	exports.doLogin = doLogin;

	return exports;

}({}));
//# sourceMappingURL=bundle.js.map
