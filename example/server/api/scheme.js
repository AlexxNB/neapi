const algebra =  require('./methods/algebra');
const auth =  require('./methods/auth');

module.exports = {
    // namespace: {...methods}
    algebra: {
        addition: algebra.addition
    },

    auth: {
        get_token: auth.get_token
    }   
}