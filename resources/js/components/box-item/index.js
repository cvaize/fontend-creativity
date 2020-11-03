import name from './name'

window.appComponents.push({
    callback: function (){
        console.log('Hello from box-item.js');
    },
    name,
    depends: []
})
