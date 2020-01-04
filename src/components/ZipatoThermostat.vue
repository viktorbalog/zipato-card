<template>
  <ha-card
    :header="friendly_name"
  >
    <v-style>
      .card-body {
        padding: 0px 16px 16px;
      }
      #nest {
        max-width: 300px;
        display: flex;
        margin: auto;
      }
    </v-style>
    <div class="card-body">
      <nest-thermostat
        id="nest"
        v-if="loaded"
        :current-temperature="current_temperature"
        :target-temperature="target_temperature"
        :max-temperature="max_temp"
        :min-temperature="min_temp"
        :hvac-mode="state"
        :preset-mode="preset_mode"
        :hold-until="hold_until"
        @click="handleMoreInfo"
        @toggleHeating="handleToggleHeating"
        v-on:update:targetTemperature="handleChangeTargetTemperature"
        v-on:update:holdUntil="handleHoldUntil"
        v-on:update:presetMode="handleSetPresetMode"
      />
    </div>
  </ha-card>
</template>
<script>
import _ from 'lodash'
import NestThermostat from './NestThermostat'

export default {
  components: {
    NestThermostat
  },
  data () {
    return {
      loaded: false,
      config: {},
      hass: null,
      fireHassEvent: (type, detail = {}, options = {}) => false,
      state: 'off',
      current_temperature: null,
      friendly_name: 'WC radiátor',
      hold_until: '2019-12-31T23:55:00+01:00',
      hvac_modes: [],
      max_temp: 35,
      min_temp: 7,
      preset_mode: 'PROGRAM',
      preset_modes: [],
      supported_features: 17,
      target_temp_step: 1,
      temperature: 22,
      target_temperature: -1
    }
  },
  computed: {
    progress () {
      if (this.max_temp !== null && this.current_temperature !== null) {
        return parseInt((this.current_temperature / this.max_temp) * 100)
      } else {
        return 0
      }
    },
    temperature_color () {
      if (this.state === 'off') {
        return '#cecece'
      } else {
        return '#ff8100'
      }
    },
    presetMode () {
      return _.startCase(this.preset_mode)
    }
  },
  watch: {
    hass (newHass, oldHass) {
      const entity = this.config.entity
      if (newHass && entity && newHass.states[entity]) {
        _.forEach(newHass.states[entity], (value, key) => {
          if (typeof this[key] !== 'undefined') {
            this[key] = value
          }
        })
        _.forEach(newHass.states[entity].attributes, (value, key) => {
          if (typeof this[key] !== 'undefined') {
            this[key] = value
          }
        })

        this.target_temperature = this.temperature
        this.loaded = true
      }
    },
    config (newConfig, oldConfig) {
      if (newConfig) {
      }
    }
  },
  methods: {
    handleMoreInfo () {
      this.fireHassEvent('hass-more-info', { entityId: this.config.entity })
    },
    handleToggleHeating () {
      var mode = this.state === 'off' ? 'heat' : 'off'

      this.hass.callService('climate', 'set_hvac_mode', {
        entity_id: this.config.entity,
        hvac_mode: mode
      })
    },
    handleHoldUntil (until) {
      this.hass.callService('zipato', 'set_hold_until', {
        entity_id: this.config.entity,
        timestamp: until
      })
    },
    handleSetPresetMode (mode) {
      this.hass.callService('climate', 'set_preset_mode', {
        entity_id: this.config.entity,
        preset_mode: mode,
      })
    },
    handleChangeTargetTemperature ({ temp, mode = 'heat' }) {
      if (this.target_temperature === temp && this.state === mode) {
        return
      }

      this.hass.callService('climate', 'set_temperature', {
        entity_id: this.config.entity,
        temperature: temp,
        hvac_mode: mode
      })
    },
    refresh () {
      /* this.hass.callService('mqtt', 'publish', {
        topic: mqttBaseTopic + '/bridge/networkmap',
        payload: 'raw'
      }) */
    },
    update () {

    }
  },
  mounted () {

  }
}
</script>
