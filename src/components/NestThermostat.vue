<template>
    <svg
        width="100%"
        height="100%"
        :viewBox="viewBox"
        ref="dial"
    >
        <circle
            :cx="radius"
            :cy="radius"
            :r="radius"
            :style="dialShape"
            @mousedown="startDragging"
            @mousemove="updateDragging"
            @mouseup="stopDragging"
            @click="stopDragging"
        />
        <g
            style="pointer-events: none"
        >
            <path
                :d="donutPath(radius, radius, radius - 4, radius - 8)"
                :style="editablePathStyle"
            />
            <g>
                <path
                    v-for="(point, index) in ticks"
                    :key="index"
                    :d="pointsToPath(point)"
                    :style="dialTick(index)"
                />
            </g>
            <text
                :x="radius - radius / 20"
                :y="radius - radius / 8"
                :style="lblTargetStyle"
            >
                {{ requestedTemperature }}
            </text>
            <text
                :x="radius - radius / 25"
                :y="radius + radius / 4"
                :style="lblPresetModeStyle"
            >
                {{ presetMode }}
            </text>
            <text
                :x="radius + radius / 2.5"
                :y="radius - radius / 4"
                :style="lblTargetHalfStyle"
            >
                {{ temperatureUnit }}
            </text>
            <text
                :x="lblAmbientPositionPoint[0]"
                :y="lblAmbientPositionPoint[1]"
                :style="lblAmbientStyle"
            >
                {{ currentTemperature }}{{ temperatureUnit }}
            </text>
        </g>
        <g
            @click="$emit('toggleHeating')"
            style="cursor: pointer"
        >
            <rect
                :width="radius * 0.8"
                :height="ticksInnerRadius"
                :x="radius - radius * 0.4"
                :y="radius * 2 - ticksInnerRadius - ticksOuterRadius"
                fill="transparent"
            />
            <path
                :fill="activeTickColor"
                :transform="`translate(${radius - radius / 10} ${1.95 * radius - ticksInnerRadius}) scale(2)`"
                d="M17.55,11.2C17.32,10.9 17.05,10.64 16.79,10.38C16.14,9.78 15.39,9.35 14.76,8.72C13.3,7.26 13,4.85 13.91,3C13,3.23 12.16,3.75 11.46,4.32C8.92,6.4 7.92,10.07 9.12,13.22C9.16,13.32 9.2,13.42 9.2,13.55C9.2,13.77 9.05,13.97 8.85,14.05C8.63,14.15 8.39,14.09 8.21,13.93C8.15,13.88 8.11,13.83 8.06,13.76C6.96,12.33 6.78,10.28 7.53,8.64C5.89,10 5,12.3 5.14,14.47C5.18,14.97 5.24,15.47 5.41,15.97C5.55,16.57 5.81,17.17 6.13,17.7C7.17,19.43 9,20.67 10.97,20.92C13.07,21.19 15.32,20.8 16.93,19.32C18.73,17.66 19.38,15 18.43,12.72L18.3,12.46C18.1,12 17.83,11.59 17.5,11.21L17.55,11.2M14.45,17.5C14.17,17.74 13.72,18 13.37,18.1C12.27,18.5 11.17,17.94 10.5,17.28C11.69,17 12.39,16.12 12.59,15.23C12.76,14.43 12.45,13.77 12.32,13C12.2,12.26 12.22,11.63 12.5,10.94C12.67,11.32 12.87,11.7 13.1,12C13.86,13 15.05,13.44 15.3,14.8C15.34,14.94 15.36,15.08 15.36,15.23C15.39,16.05 15.04,16.95 14.44,17.5H14.45Z"
            />
        </g>
    </svg>
</template>
<script>

export default {
  props: {
    heatingBackgroundColor: {
      type: String,
      default: '#ff8100'
    },
    inactiveBackgroundColor: {
      type: String,
      default: '#222'
    },
    activeTickColor: {
      type: String,
      default: '#fff'
    },
    inactiveTickColor: {
      type: String,
      default: 'rgba(255, 255, 255, 0.3)'
    },
    diameter: {
      type: Number,
      default: 400
    },
    numTicks: {
      type: Number,
      default: 150
    },
    tickDegrees: {
      type: Number,
      default: 300
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
      dragging: false
    }
  },
  mounted () {
    this.requestedTemperature = this.targetTemperature
    this.requestedMode = this.hvacMode
  },
  watch: {
    targetTemperature (temp) {
      this.requestedTemperature = temp
    },
    hvacMode (mode) {
      this.requestedMode = mode
    }
  },
  computed: {
    heating () {
      return this.hvacMode === 'heat'
    },
    viewBox () {
      return `0 0 ${this.diameter} ${this.diameter}`
    },
    radius () {
      return this.diameter / 2
    },
    dialShape () {
      return {
        fill: this.backgroundColor,
        transition: 'fill 0.5s'
      }
    },
    rangeValue () {
      return this.maxTemperature - this.minTemperature
    },
    min () {
      var vMin = Math.min(this.currentTemperature, this.requestedTemperature)

      return this.restrictToRange(
        Math.round((vMin - this.minTemperature) / this.rangeValue * this.numTicks),
        0,
        this.numTicks - 1
      )
    },
    max () {
      var vMax = Math.max(this.currentTemperature, this.requestedTemperature)

      return this.restrictToRange(
        Math.round((vMax - this.minTemperature) / this.rangeValue * this.numTicks),
        0,
        this.numTicks - 1
      )
    },
    backgroundColor () {
      if (this.heating) {
        return this.heatingBackgroundColor
      } else {
        return this.inactiveBackgroundColor
      }
    },
    editablePathStyle () {
      return {
        fill: this.activeTickColor,
        'fill-rule': 'evenodd',
        opacity: this.dragging ? 1 : 0,
        transition: 'opacity 0.5s'
      }
    },
    lblTargetHalfStyle () {
      return _.assign({}, this.fontStyle, {
        fill: this.activeTickColor,
        'font-size': '40px'
      })
    },
    lblTargetStyle () {
      return _.assign({}, this.fontStyle, {
        fill: this.activeTickColor,
        'font-size': '120px'
      })
    },
    lblPresetModeStyle () {
      return _.assign({}, this.fontStyle, {
        fill: this.activeTickColor,
        'font-size': '22px'
      })
    },
    lblAmbientStyle () {
      return _.assign({}, this.fontStyle, {
        fill: this.activeTickColor,
        'font-size': `22px`
      })
    },
    lblAmbientPosition () {
      return [
        this.radius,
        this.ticksOuterRadius - (this.ticksOuterRadius - this.ticksInnerRadius) / 2
      ]
    },
    lblAmbientPositionPoint () {
      var peggedValue = this.restrictToRange(this.currentTemperature, this.minTemperature, this.maxTemperature)
      var degs = this.tickDegrees * (peggedValue - this.minTemperature) / this.rangeValue - this.offsetDegrees

      if (peggedValue > this.requestedTemperature) {
        degs += 15
      } else {
        degs -= 15
      }

      return this.rotatePoint(this.lblAmbientPosition, degs, [this.radius, this.radius])
    },
    ticks () {
      var ticks = []
      for (var i = 0; i < this.numTicks; i++) {
        var isLarge = i == this.min || i == this.max

        var point = this.rotatePoints(isLarge ? this.tickPointsLarge : this.tickPoints, i * this.theta - this.offsetDegrees, [
          this.radius, this.radius
        ])
        ticks.push(point)
      }
      return ticks
    },
    offsetDegrees () {
      return 180 - (360 - this.tickDegrees) / 2
    },
    theta () {
      return this.tickDegrees / this.numTicks
    },
    ticksOuterRadius () {
      return this.diameter / 30
    },
    ticksInnerRadius () {
      return this.diameter / 8
    },
    tickPoints () {
      return [
        [this.radius - 1, this.ticksOuterRadius],
        [this.radius + 1, this.ticksOuterRadius],
        [this.radius + 1, this.ticksInnerRadius],
        [this.radius - 1, this.ticksInnerRadius]
      ]
    },
    tickPointsLarge () {
      return [
        [this.radius - 1.5, this.ticksOuterRadius],
        [this.radius + 1.5, this.ticksOuterRadius],
        [this.radius + 1.5, this.ticksInnerRadius + 20],
        [this.radius - 1.5, this.ticksInnerRadius + 20]
      ]
    }
  },
  methods: {
    startDragging (e) {
      this.dragging = true
    },
    stopDragging (e) {
      this.dragging = false
      this.$emit('update:targetTemperature', {
        temp: this.requestedTemperature,
        mode: this.requestedMode
      })
    },
    updateDragging (e) {
      if (!this.dragging) {
        return
      }

      var rect = this.$refs.dial.getBoundingClientRect()
      var center = {
        x: (rect.left + rect.width / 2),
        y: (rect.top + rect.height / 2)
      }

      var deltaX = e.clientX - center.x
      var deltaY = center.y - e.clientY

      var thetaRadians = Math.atan2(deltaX, deltaY)
      var deg = thetaRadians * 180 / Math.PI

      this.requestedTemperature = Math.round((deg + this.offsetDegrees) * this.rangeValue / this.tickDegrees) + this.minTemperature

      if (this.requestedTemperature < this.currentTemperature) {
        this.requestedMode = 'off'
      } else {
        this.requestedMode = 'heat'
      }
    },
    dialTick (index) {
      var isActive = index >= this.min && index <= this.max

      return {
        fill: isActive ? this.activeTickColor : this.inactiveTickColor
      }
    },
    /**
         * Rotate a cartesian point about given origin by X degrees
         */
    rotatePoint (point, angle, origin) {
      var radians = angle * Math.PI / 180
      var x = point[0] - origin[0]
      var y = point[1] - origin[1]
      var x1 = x * Math.cos(radians) - y * Math.sin(radians) + origin[0]
      var y1 = x * Math.sin(radians) + y * Math.cos(radians) + origin[1]
      return [x1, y1]
    },
    /**
         * Rotate an array of cartesian points about a given origin by X degrees
         */
    rotatePoints (points, angle, origin) {
      return points.map(point => {
        return this.rotatePoint(point, angle, origin)
      })
    },
    pointsToPath (points) {
      return points.map(function (point, iPoint) {
        return (iPoint > 0 ? 'L' : 'M') + point[0] + ' ' + point[1]
      }).join(' ') + 'Z'
    },
    circleToPath (cx, cy, r) {
      return [
        'M', cx, ',', cy,
        'm', 0 - r, ',', 0,
        'a', r, ',', r, 0, 1, ',', 0, r * 2, ',', 0,
        'a', r, ',', r, 0, 1, ',', 0, 0 - r * 2, ',', 0,
        'z'
      ].join(' ').replace(/\s,\s/g, ',')
    },
    donutPath (cx, cy, rOuter, rInner) {
      return this.circleToPath(cx, cy, rOuter) + ' ' + this.circleToPath(cx, cy, rInner)
    },
    /**
         * Restrict a number to a min + max range
         */
	    restrictToRange (val, min, max) {
      if (val < min) return min
      if (val > max) return max
      return val
    },
    /**
         *  Round a number to the nearest 0.5
         */
    roundHalf (num) {
      return Math.round(num * 2) / 2
    }
  }
}
</script>
