import init from '../../helpers/init'
const components = window.appComponents

window.appComponents = {
    push: function (data) {
        init(data.callback, data.name, data.depends)
    }
}
components.forEach(window.appComponents.push)
