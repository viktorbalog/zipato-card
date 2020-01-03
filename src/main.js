import '@material/mwc-button'
import './ha-card'
customElements.whenDefined('zipato-thermostat').then(() => {
  function createHass () {
    const hass = {
      count: 0,
      callService () {
        this.count++
        document.querySelector('zipato-thermostat').hass = Object.assign({}, hass)
      },
      states: {}
    }
    return hass
  }

  const net = document.querySelector('zipato-thermostat')
  net.setConfig({
    type: 'custom:zipato-thermostat',
    entity: 'sensor.zipato_thermostat'
  })
  net.hass = createHass()
})
