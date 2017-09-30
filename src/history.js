import { onChange, toUrl, fromUrl } from './state'

const { history } = window

let historyPushType = 'replaceState'

const { setState } = onChange(state => {
  history[historyPushType](state, '', `./${toUrl(state)}`)
  historyPushType = 'pushState'
})

window.addEventListener('popstate', ({ state }) => {
  if (state != null) { // Assure to ignore event on page load (Chrome < 34 and Safari)
    setState(state)
  }
}, false)

const { location: { hash } } = window
if (hash.length > 0) {
  setState(fromUrl(hash.substr(1)) || {})
}
