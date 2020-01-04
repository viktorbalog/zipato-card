<template>
    <svg
        width="100%"
        height="100%"
        :viewBox="`0 0 ${this.diameter} ${this.diameter}`"
    >
      <defs>
        <radialGradient id="gradient6" cx="50%" cy="50%" r="50%" fx="20%" fy="20%">
          <stop offset="0%" style="stop-color:rgba(255, 255, 255, 0.4);" />
          <stop offset="100%" style="stop-color:rgba(255, 255, 255, 0);" />
        </radialGradient>
      </defs>
        <horseshoe-slider
          id="tempChangeSlider"
          :active-tick-color="activeTickColor"
          :inactive-tick-color="inactiveTickColor"
          :background-color="backgroundColor"
          :diameter="diameter"
          :slider-min="minTemperature"
          :slider-max="maxTemperature"
          :slider-low="currentTemperature"
          :slider-high.sync="requestedTemperature"
          :style="tempChangeStyle"
        >
          <template v-slot:label="{currentValue}">
            <text v-bind="lblTarget">
              {{ currentValue }}
            </text>
            <text v-bind="lblPresetMode">
              {{ isHoldUntil ? displayHoldUntilAttribute : presetMode }}
            </text>
            <text v-bind="lblTargetHalf">
              {{ temperatureUnit }}
            </text>
          </template>
          <template v-slot:current="{ambient, low, high}">
            <text v-bind="getAmbientLabel(ambient)">
              {{ currentTemperature }}{{ temperatureUnit }}
            </text>
          </template>
        </horseshoe-slider>
        <horseshoe-slider
          id="timeChangeSlider"
          :active-tick-color="activeTickColor"
          :inactive-tick-color="inactiveTickColor"
          :background-color="timeBackgroundColor"
          :num-ticks="12"
          :tick-degrees="300"
          :diameter="diameter"
          :slider-min="0"
          :slider-max="12"
          :slider-low="0"
          :slider-high.sync="requestedTime"
          :style="timeChangeStyle"
        >
          <template v-slot:background="{dialShape, low, min, high, max}">
            <circle v-bind="dialShape" />
            <path v-bind="getBaseTrack(min, max)" />
            <path v-bind="getActiveTrack(low, high)" />
          </template>
          <template v-slot:tick="tick">
            <circle v-bind="getCircleTick(tick)" />
          </template>
          <template v-slot:label="{currentValue}">
            <text v-bind="lblTime">
              {{ displayTime(currentValue) }}
            </text>
            <text v-bind="lblTimeLong" >
              {{ displayHoldUntil(currentValue) }}
            </text>
          </template>
        </horseshoe-slider>
        <g
            @click="$emit('toggleHeating')"
            style="cursor: pointer"
        >
            <rect
              :width="diameter * 0.12"
              :height="diameter * 0.14"
              :x="iconOffsetX()"
              :y="iconOffsetY()"
              fill="transparent"
            />
            <path
              :fill="stateIconColor"
              :transform="`translate(${iconOffsetX()} ${iconOffsetY()}) scale(2)`"
              d="M17.55,11.2C17.32,10.9 17.05,10.64 16.79,10.38C16.14,9.78 15.39,9.35 14.76,8.72C13.3,7.26 13,4.85 13.91,3C13,3.23 12.16,3.75 11.46,4.32C8.92,6.4 7.92,10.07 9.12,13.22C9.16,13.32 9.2,13.42 9.2,13.55C9.2,13.77 9.05,13.97 8.85,14.05C8.63,14.15 8.39,14.09 8.21,13.93C8.15,13.88 8.11,13.83 8.06,13.76C6.96,12.33 6.78,10.28 7.53,8.64C5.89,10 5,12.3 5.14,14.47C5.18,14.97 5.24,15.47 5.41,15.97C5.55,16.57 5.81,17.17 6.13,17.7C7.17,19.43 9,20.67 10.97,20.92C13.07,21.19 15.32,20.8 16.93,19.32C18.73,17.66 19.38,15 18.43,12.72L18.3,12.46C18.1,12 17.83,11.59 17.5,11.21L17.55,11.2M14.45,17.5C14.17,17.74 13.72,18 13.37,18.1C12.27,18.5 11.17,17.94 10.5,17.28C11.69,17 12.39,16.12 12.59,15.23C12.76,14.43 12.45,13.77 12.32,13C12.2,12.26 12.22,11.63 12.5,10.94C12.67,11.32 12.87,11.7 13.1,12C13.86,13 15.05,13.44 15.3,14.8C15.34,14.94 15.36,15.08 15.36,15.23C15.39,16.05 15.04,16.95 14.44,17.5H14.45Z"
            />
        </g>
        <g
          @click="toggleMode"
          style="cursor: pointer"
        >
          <rect
            :width="diameter * 0.12"
            :height="diameter * 0.14"
            :x="iconOffsetX(0.15)"
            :y="iconOffsetY()"
            fill="transparent"
          />
          <path
            :fill="modeIconColor"
            :transform="`translate(${iconOffsetX(0.15)} ${iconOffsetY()}) scale(2)`"
            d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.24,7.76C15.07,6.58 13.53,6 12,6V12L7.76,16.24C10.1,18.58 13.9,18.58 16.24,16.24C18.59,13.9 18.59,10.1 16.24,7.76Z"
          />
        </g>
        <circle
          :cx="radius"
          :cy="radius"
          :r="radius"
          fill="url(#gradient6)"
          style="pointer-events: none"
        />
    </svg>
</template>
<script>
import {describeArcPath} from '../util/util'
import HorseshoeSlider from './HorseshoeSlider'
import moment from 'moment'

export default {
  components: {
    HorseshoeSlider
  },
  props: {
    diameter: {
      type: Number,
      default: 400
    },
    heatingColor: {
      type: String,
      default: '#ff8100'
    },
    activeColor: {
      type: String,
      default: '#3c902a'
    },
    inactiveBackgroundColor: {
      type: String,
      default: '#222'
    },
    timeBackgroundColor: {
      type: String,
      default: '#155b7b'
    },
    activeTickColor: {
      type: String,
      default: '#fff'
    },
    inactiveTickColor: {
      type: String,
      default: 'rgba(255, 255, 255, 0.3)'
    },
    minTemperature: {
      type: Number,
      default: 10
    },
    maxTemperature: {
      type: Number,
      default: 30
    },
    currentTemperature: {
      type: Number,
      default: 10
    },
    targetTemperature: {
      type: Number,
      default: 22
    },
    hvacMode: {
      type: String,
      default: 'PROGRAM'
    },
    holdUntil: {
      type: String,
      default: '2019-12-31T23:55:00+01:00'
    },
    presetMode: {
      type: String,
      default: 'PROGRAM'
    },
    presetModes: {
      type: Array,
      default () {
        return [{
          label: 'PROGRAM',
          value: 'PROGRAM'
        }]
      }
    },
    fontStyle: {
      type: Object,
      default () {
        return {
          'text-anchor': 'middle',
          'font-family': 'Helvetica, sans-serif',
          'alignment-baseline': 'central',
          'font-weight': 'bold'
        }
      }
    },
    temperatureUnit: {
      type: String,
      default: '°C'
    }
  },
  data () {
    return {
      requestedTemperature: -1,
      requestedMode: 'off',
      requestedTime: 0,
      offsetMinutes: -1,
      mode: 'time',
      dragging: false
    }
  },
  mounted () {
    this.requestedTemperature = this.targetTemperature
    this.requestedMode = this.hvacMode

    var holdUntil = moment(this.holdUntil)
    var now = moment()

    this.requestedTime = this.roundHalf(holdUntil.diff(now, 'minutes') / 60) * 2
  },
  watch: {
    offsetMinutes (minutes, oldMinutes) {
      if(minutes === 0) {
        this.$emit('update:presetMode', 'PROGRAM')
        return
      }

      var time = moment().add(minutes, 'minutes')
      var holdUntil = moment(this.holdUntil)

      if(Math.abs(holdUntil.diff(time, 'minutes')) < 15 && oldMinutes !== 0) {
        return
      }

      this.$emit('update:holdUntil', time.format())
    },
    requestedTime (time) {
      this.offsetMinutes = this.getOffsetMinutes(time)
      this.mode = 'temp'
    },
    requestedTemperature (temp, oldTemp) {
      if (temp < this.currentTemperature) {
        this.requestedMode = 'off'
      } else {
        this.requestedMode = 'heat'
      }

      this.$emit('update:targetTemperature', {
        temp: temp,
        mode: this.requestedMode
      })
    },
    targetTemperature (temp) {
      this.requestedTemperature = temp
    },
    hvacMode (mode) {
      this.requestedMode = mode
    }
  },
  computed: {
    radius () {
      return this.diameter / 2
    },
    tempChangeStyle () {
      return {
        transition: 'opacity .5s',
        opacity: this.mode === 'temp' ? 1 : 0,
        'pointer-events': this.mode === 'temp' ? 'initial' : 'none'
      }
    },
    timeChangeStyle () {
      return {
        transition: 'opacity .5s',
        opacity: this.mode === 'time' ? 1 : 0,
        'pointer-events': this.mode === 'time' ? 'initial' : 'none'
      }
    },
    heating () {
      return this.hvacMode === 'heat'
    },
    backgroundColor () {
      if (this.heating) {
        return this.heatingColor
      } else {
        return this.inactiveBackgroundColor
      }
    },
    lblPresetModeStyle () {
      return _.assign({}, this.fontStyle, {
        fill: this.activeTickColor,
        'font-size': '22px'
      })
    },
    lblPresetMode () {
      return {
        x: this.radius - this.radius / 25,
        y: this.radius + this.radius / 4,
        style: this.lblPresetModeStyle
      }
    },
    lblTime () {
      return {
        x: this.radius,
        y: this.radius - this.radius / 8,
        fill: this.activeTickColor,
        style: _.assign({}, this.fontStyle, {
          'font-size': '100px'
        })
      }
    },
    lblTimeLong () {
      return {
        x: this.radius - this.radius / 25,
        y: this.radius + this.radius / 4,
        style: this.lblPresetModeStyle
      }
    },
    lblTargetHalf () {
      return {
        x: this.radius + this.radius / 2.5,
        y: this.radius - this.radius / 4,
        style: _.assign({}, this.fontStyle, {
          fill: this.activeTickColor,
          'font-size': '40px'
        })
      }
    },
    lblTarget () {
      return {
        x: this.radius - this.radius / 20,
        y: this.radius - this.radius / 8,
        style: _.assign({}, this.fontStyle, {
          fill: this.activeTickColor,
          'font-size': '120px'
        })
      }
    },
    isHoldUntil () {
      return this.presetMode === 'HOLD_UNTIL'
    },
    stateIconColor () {
      if (this.heating) {
        return this.activeTickColor
      } else {
        return this.inactiveTickColor
      }
    },
    modeIconColor () {
      if (this.isHoldUntil) {
        return this.activeTickColor
      } else {
        return this.inactiveTickColor
      }
    },
    displayHoldUntilAttribute () {
      return moment(this.holdUntil).locale('uk').format('LTS')
    },
  },
  methods: {
    getAmbientLabel(position) {
      return {
        ...position,
        style: _.assign({}, this.fontStyle, {
          fill: this.activeTickColor,
          'font-size': `22px`
        })
      }
    },
    getBaseTrack(min, max) {
      return {
        fill: 'none',
        stroke: this.inactiveTickColor,
        'stroke-linecap': 'round',
        'stroke-width': 20,
        d: describeArcPath(this.radius, this.radius, this.radius * 0.8, min, max)
      }
    },
    getActiveTrack(low, high) {
      return {
        fill: 'none',
        stroke: this.heating ? this.heatingColor : this.inactiveTickColor,
        'stroke-linecap': 'round',
        'stroke-width': 20,
        d: describeArcPath(this.radius, this.radius, this.radius * 0.8, low, high),
      }
    },
    getCircleTick({rotate, isActive, index, isMin, isMax, isLow, isHigh}) {
      var point = rotate([(this.diameter / 2), (this.diameter * 0.10)])

      return {
        r: isHigh ? 16 : 5,
        fill: !isHigh ? this.inactiveTickColor : this.activeTickColor,
        opacity: !isHigh && (isMin || isMax) ? 0 : 1,
        cx: point[0],
        cy: point[1],
      }
    },
    getOffsetMinutes (time) {
      var hour = Math.floor(time / 2)
      var minutes = time % 2 !== 0 ? 30 : 0

      return hour * 60 + minutes
    },
    displayHoldUntil (value) {
      var offsetMinutes = this.getOffsetMinutes(value)

      return moment().add(offsetMinutes, 'minutes').locale('uk').format('LTS')
    },
    displayTime (value) {
      var offsetMinutes = this.getOffsetMinutes(value)

      var hour = Math.floor(offsetMinutes / 60)
      var minutes = offsetMinutes - (hour * 60)

      return `${hour}:${minutes.toString().padEnd(2, '0')}`
    },
    toggleMode () {
      if(this.mode === 'temp') {
        this.mode = 'time'
      } else {
        this.mode = 'temp'
      }
    },
    iconOffsetX (x = 0) {
      return this.diameter * (0.36 + x)
    },
    iconOffsetY (y = 0) {
      return this.diameter * (0.83 + y)
    },
    roundHalf(num) {
		  return Math.round (num * 2) /2
    },
  }
}
</script>
