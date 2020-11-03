import name from './name'

window.appComponents.push({
    callback: function (){
        console.log('Hello from layout-app.js');
    },
    name,
    depends: []
})
