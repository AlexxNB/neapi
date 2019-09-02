import neapi from './../../client';

neapi.init({
    endpoint: '/api',
    onRequest: (packet) => console.log('NeAPI Request:', packet),
    onResponce: (packet) => console.log('NeAPI Responce:', packet)
});

export function doCountAddition() {
    const a = Number(document.getElementById('ex1_a').value);
    const b = Number(document.getElementById('ex1_b').value);

    neapi.request('algebra','addition',{a,b}).then((responce)=>{
        console.log(responce);
    })
}
