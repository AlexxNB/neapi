module.exports.addition = function (resp, err, params) {
    console.log(params);
    if(params.a === undefined) return err('not_set','a');
    if(params.b === undefined) return err('not_set','b');
    if(params.c === undefined) return err('not_set','c');

    let result = params.a + params.b
    return resp(result);
}