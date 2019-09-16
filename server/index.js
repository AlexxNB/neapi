const {json} = require('body-parser');
const utils = require('./../share/utils');

const object_manager = utils.object_manager;

const packet_validator = function (packet) {
    if(!packet.namespace) return false;
    if(!packet.method) return false;
    if(packet.params === undefined) return false;
    if(packet.context === undefined) return false;
    return true;
}

module.exports.getMiddleware = function(user_config) {

    const default_config = {
        scheme: {},
        onRecieve: async () => {},
        onSend: async () => {}
    }

    const config = Object.assign({}, default_config, user_config);

    return [json(),async function(req,resp,next){
        const packet = req.body;
    
        if(!packet_validator(packet)) return sendError(resp,next,packet,'invalid_packet',config);
        
        const context = object_manager(packet.context);

        if(config.scheme[packet.namespace] === undefined) return sendError(resp,next,packet,'unknown_namespace',context,config);
        if(config.scheme[packet.namespace][packet.method] === undefined) return sendError(resp,next,packet,'unknown_method',context,config);

        await config.onRecieve({
            namespace:packet.namespace,
            method:packet.method,
            params:packet.params
        },context);

        return config.scheme[packet.namespace][packet.method](
            async (payload) => {
                return await sendResponce(resp,next,packet,payload,context,config);
            },
            async (err,payload) => {
                return await sendError(resp,next,packet,err,payload,context,config);
            },
            packet.params,
            context
        );

    }];
}

const get_packet = function() {
    return { 
        namespace:'', 
        method:'', 
        payload:{}, 
        context:{},
        error:null 
    }
}

const sendResponce = async (resp,next,req_packet,payload,context,config) => {
    const packet = get_packet();

    packet.namespace = req_packet.namespace || 'not_provided';
    packet.method = req_packet.method || 'not_provided';
    packet.payload = payload === undefined ? {} : payload;

    await config.onSend({
        namespace:packet.namespace,
        method:packet.method,
        payload:packet.payload,
        error:packet.error,
    },context);

    packet.context = context.get();

    sendPacket(resp,next,packet);
}

const sendError = async (resp,next,req_packet,err,payload,context,config) => {
    const packet = get_packet();

    packet.namespace = req_packet.namespace || 'not_provided';
    packet.method = req_packet.method || 'not_provided';
    packet.payload = payload === undefined ? {} : payload;
    packet.error = err || 'unknown_error';

    await config.onSend({
        namespace:packet.namespace,
        method:packet.method,
        payload:packet.payload,
        error:packet.error,
    },context);

    packet.context = context.get();

    sendPacket(resp,next,packet);
}

const sendPacket = (resp,next,packet) => {
    resp.writeHead(200, {'Content-Type': 'application/json; charset=UTF-8'});
    resp.end(JSON.stringify(packet));
    next();
}