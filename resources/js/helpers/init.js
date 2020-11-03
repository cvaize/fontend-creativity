import getInitEvent from './events/init'
import trigger from './trigger';

export default function (callback, name, depends = []) {
    function forEachDependencies(event){
        let active = true;

        depends.forEach(depend => {
            if(!window[depend]){
                active = false;
            }
        })

        if(active){
            depends.forEach(depend => {
                document.removeEventListener(getInitEvent(depend), forEachDependencies);
            });
            window[name] = callback() || {};
            trigger(document, getInitEvent(name));
        }
        return active;
    }
    if(!forEachDependencies()){
        depends.forEach(depend => {
            document.addEventListener(getInitEvent(depend), forEachDependencies);
        });
    }
}
