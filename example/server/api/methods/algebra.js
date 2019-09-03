module.exports.addition = function (resp, err, params,context) {
    if(params.a === undefined) return err('not_set','a');
    if(params.b === undefined) return err('not_set','b');
    
    let result = params.a + params.b
    return resp(result);
}