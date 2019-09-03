let token = 'a1b2c3d4e5f6';

module.exports.get_token = function (resp, err, params) {
    if( params.login !== 'admin' || params.login !== 'secret' ) return err('wrong_credentials');
    return resp(token);
}