import neapi from './../../client';

const api = neapi.client({
    endpoint: '/api',
    onRequest: (packet,context) => {
        console.log('NeAPI Request:', packet);
        console.log('NeAPI Request Context:', context());
    },
    onResponce: (packet,context) => {
        console.log('NeAPI Responce:', packet);
        console.log('NeAPI Responce Context:', context());
    }
})



export function doCountAddition() {
    const a = Number(document.getElementById('ex1_a').value);
    const b = Number(document.getElementById('ex1_b').value);

    api.request('algebra','addition',{a,b}).then((responce)=>{
        if(responce.error){
            alert("We have an error!");
        }else{
            alert("The sum is equal "+responce.payload);
        }
    })
}

export function doLogin() {
    const login = document.getElementById('ex2_login').value;
    const password = document.getElementById('ex2_password').value;

    neapi.request('auth','get_token',{login,password}).then((responce)=>{
        if(responce.error){
            alert("We have an error!");
        }

        // we will save token in onResponce hook
    })
}

