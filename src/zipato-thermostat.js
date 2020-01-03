import Vue from 'vue'
import wrap from '@vue/web-component-wrapper'
import ZipatoThermostatVue from './components/ZipatoThermostat'

import VueCircleSlider from 'vue-circle-slider'
Vue.use(VueCircleSlider)

Vue.component('v-style', {
  render: function (createElement) {
    return createElement('style', this.$slots.default)
  }
})

const ZipatoThermostatWrap = wrap(Vue, ZipatoThermostatVue)

class ZipatoThermostat extends ZipatoThermostatWrap {
  set hass (hass) {
    this._hass = hass
    const vm = this.vueComponent
    if (vm) {
      vm.hass = this._hass
    }
  }

  setConfig (config) {
    this._config = config
    const vm = this.vueComponent
    if (vm) {
      vm.config = this._config
    }
  }

  connectedCallback () {
    super.connectedCallback()
    const vm = this.vueComponent
    if (this._config) {
      vm.config = this._config
    }
    if (!vm.hass) {
      vm.hass = this._hass
      vm.fireHassEvent = (type, detail = {}, { bubbles = true, cancelable = false, composed = true } = { bubbles: true, cancelable: false, composed: true }) => {
        var event = new Event(type, {
          bubbles, cancelable, composed
        })
        event.detail = detail
        return this.dispatchEvent(event)
      }
    }
  }
}

window.customElements.define('zipato-thermostat', ZipatoThermostat)
