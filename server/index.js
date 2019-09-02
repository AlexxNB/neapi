const {json} = require('body-parser');

const packet_validator = function (packet) {
    if(!packet.namespace) return false;
    if(!packet.method) return false;
    if(packet.params === undefined) return false;
    if(packet.context === undefined) return false;
    return true;
}

module.exports.getMiddleware = function(scheme) {

    return [json(),async function(req,resp,next){
        const packet = req.body;
    
        if(!packet_validator(packet)) return sendError(resp,next,packet,'invalid_packet');
        
        if(scheme[packet.namespace] === undefined) return sendError(resp,next,packet,'unknown_namespace');
        if(scheme[packet.namespace][packet.method] === undefined) return sendError(resp,next,packet,'unknown_method');
     
        const method = scheme[packet.namespace][packet.method];

        return method(
            (payload) => {
                return sendResponce(resp,next,packet,payload);
            },
            (err,payload) => {
                return sendError(resp,next,packet,err,payload);
            },
            packet.params
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

const sendResponce = (resp,next,req_packet,payload) => {
    const packet = get_packet();

    packet.namespace = req_packet.namespace || 'not_provided';
    packet.method = req_packet.method || 'not_provided';
    packet.payload = payload === undefined ? {} : payload;

    sendPacket(resp,next,packet);
}

const sendError = (resp,next,req_packet,err,payload) => {
    const packet = get_packet();

    packet.namespace = req_packet.namespace || 'not_provided';
    packet.method = req_packet.method || 'not_provided';
    packet.payload = payload === undefined ? {} : payload;
    packet.error = err || 'unknown_error';

    sendPacket(resp,next,packet);
}

const sendPacket = (resp,next,packet) => {
    resp.writeHead(200, {'Content-Type': 'application/json; charset=UTF-8'});
    resp.end(JSON.stringify(packet));
    next();
}