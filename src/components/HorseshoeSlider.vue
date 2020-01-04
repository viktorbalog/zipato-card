<template>
  <g>
    <g
      @mousedown="startDragging"
      @mousemove="updateDragging"
      @mouseleave="stopDragging"
      @mouseup="stopDragging"
      @click="$emit('click')"
    >
      <slot
        name="background"
        v-bind="{dialShape, ...angles}"
      >
        <circle v-bind="dialShape" />
      </slot>
    </g>
    <g
      style="pointer-events: none"
    >
      <path v-bind="editablePath" />
      <g>
        <g
          v-for="(tick, index) in ticks.data"
          :key="index"
        >
          <slot
            name="tick"
            v-bind="{index, ...tick}"
          >
            <path v-bind="ticks.getPath(tick)" />
          </slot>
        </g>
      </g>
      <slot name="label" v-bind="{currentValue}" />
      <slot name="current" v-bind="{...labelPosition, currentValue}" />
    </g>
  </g>
</template>
<script>
import {restrictToRange, describeDonutPath, describePointPath, rotatePoint, rotatePoints} from '../util/util'

export default {
  props: {
    backgroundColor: {
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
    sliderLow: {
      type: Number,
      default: 0,
    },
    sliderHigh: {
      type: Number,
      default: 20,
    },
    sliderMin: {
      type: Number,
      default: 0,
    },
    sliderMax: {
      type: Number,
      default: 100,
    }
  },
  data() {
     return {
      currentValue: -1,
      dragging: false
    }
  },
  computed: {
    editablePath () {
      return {
        d: describeDonutPath(this.radius, this.radius, this.radius - 4, this.radius - 8),
        fill: this.activeTickColor,
        'fill-rule': 'evenodd',
        opacity: this.dragging ? 1 : 0,
        style: {
          transition: 'opacity 0.5s'
        }
      }
    },
    dialShape () {
      return {
        cx: this.radius,
        cy: this.radius,
        r: this.radius,
        fill: this.backgroundColor,
      }
    },
    angles () {
      var _this = this

      return {
        get low () {
          return _this.getAngle(_this.sliderLow)
        },
        get high () {
          return _this.getAngle(_this.currentValue)
        },
        get min () {
          return _this.getAngle(_this.sliderMin)
        },
        get max () {
          return _this.getAngle(_this.sliderMax)
        }
      }
    },
    index () {
      var _this = this

      return {
        get low () {
          var vMin = Math.min(_this.sliderLow, _this.currentValue)

          return restrictToRange(
            Math.round((vMin - _this.sliderMin) / _this.rangeValue * _this.numTicks),
            0,
            _this.numTicks
          )
        },
        get high () {
          var vMax = Math.max(_this.sliderLow, _this.currentValue)

          return restrictToRange(
            Math.round((vMax - _this.sliderMin) / _this.rangeValue * _this.numTicks),
            0,
            _this.numTicks
          )
        },
      }
    },
    radius () {
      return this.diameter / 2
    },
    ticks () {
      var _this = this

      return {
        get theta() {
          return _this.tickDegrees / _this.numTicks
        },
        get data () {
          var ticks = []
          var index = _this.index
          var low = _this.index.low,
            high = _this.index.high

          for (var i = 0; i < _this.numTicks + 1; i++) {
            var __this = this

            ticks.push({
              isActive: i >= low && i <= high,
              isMin: i === 0,
              isMax: i === _this.numTicks,
              isLow: i === low,
              isHigh: i === high,
              rotate: __this.rotate(i),
            })
          }
          return ticks
        },
        get points () {
          return [
            [_this.radius - 1, this.outerRadius],
            [_this.radius + 1, this.outerRadius],
            [_this.radius + 1, this.innerRadius],
            [_this.radius - 1, this.innerRadius]
          ]
        },
        get pointsLarge () {
          return [
            [_this.radius - 1.5, this.outerRadius],
            [_this.radius + 1.5, this.outerRadius],
            [_this.radius + 1.5, this.innerRadius + 20],
            [_this.radius - 1.5, this.innerRadius + 20]
          ]
        },
        get outerRadius () {
          return _this.diameter / 30
        },
        get innerRadius () {
          return _this.diameter / 8
        },
        getPath(tick) {
          var __this = this
          var color = tick.isActive ? _this.activeTickColor : _this.inactiveTickColor
          var points = tick.isLow | tick.isHigh ? this.pointsLarge : this.points

          return {
            d: describePointPath(tick.rotate(points)),
            fill: color,
          }
        },
        rotate(i) {
          var __this = this
          return points => {
            if(points.length < 3) {
              return rotatePoint(points, i * __this.theta - _this.offsetDegrees, [
                _this.radius, _this.radius
              ])
            } else {
              return rotatePoints(points, i * __this.theta - _this.offsetDegrees, [
                _this.radius, _this.radius
              ])
            }
          }
        },
        getLabelPosition(peggedValue, offset) {
          if(!offset) {
            offset = peggedValue >= _this.currentValue ? 1 : -1
          }

          var degs = _this.getAngle(peggedValue)

          if (offset > 0) {
            degs += 10
          } else {
            degs -= 10
          }

          var pos = [
            _this.radius,
            this.outerRadius - (this.outerRadius - this.innerRadius) / 2
          ]

          var points = rotatePoint(pos, degs, [_this.radius, _this.radius])

          return {
            x: points[0],
            y: points[1]
          }
        },
      }
    },
    rangeValue () {
      return this.sliderMax - this.sliderMin
    },
    offsetDegrees () {
      return 180 - (360 - this.tickDegrees) / 2
    },
    labelPosition () {
      var _this = this

      return {
        get ambient () {
          var peggedValue = restrictToRange(_this.sliderLow, _this.sliderMin, _this.sliderMax)

          return _this.ticks.getLabelPosition(peggedValue)
        },
        get low () {
          return _this.ticks.getLabelPosition(_this.sliderLow, -1)
        },
        get high () {
          return _this.ticks.getLabelPosition(_this.currentValue, 1)
        }
      }
    },
  },
  watch: {
    sliderHigh (value) {
      this.currentValue = restrictToRange(value, this.sliderMin, this.sliderMax)
    }
  },
  mounted() {
    this.currentValue = restrictToRange(this.sliderHigh, this.sliderMin, this.sliderMax)
  },
  methods: {
    getPointPath(points) {
      return describePointPath(points)
    },
    getAngle (value) {
      return this.tickDegrees * (value - this.sliderMin) / this.rangeValue - this.offsetDegrees
    },
    startDragging (e) {
      this.dragging = true
    },
    stopDragging (e) {
      this.dragging = false
      this.$emit('update:sliderHigh', this.currentValue)
    },
    updateDragging (e) {
      if (!this.dragging) {
        return
      }

      var rect = this.$el.getBoundingClientRect()
      var center = {
        x: (rect.left + rect.width / 2),
        y: (rect.top + rect.height / 2)
      }

      var deltaX = e.clientX - center.x
      var deltaY = center.y - e.clientY

      var thetaRadians = Math.atan2(deltaX, deltaY)
      var deg = thetaRadians * 180 / Math.PI

      this.currentValue = restrictToRange(
        Math.round((deg + this.offsetDegrees) * this.rangeValue / this.tickDegrees) + this.sliderMin,
        this.sliderMin,
        this.sliderMax
      )
    },
  }
}
</script>