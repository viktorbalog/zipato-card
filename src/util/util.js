export function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

export function describeArcPath(x, y, radius, startAngle, endAngle){
  var start = polarToCartesian(x, y, radius, endAngle);
  var end = polarToCartesian(x, y, radius, startAngle);

  var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  var d = [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");

  return d;
}

export function describeDonutPath (cx, cy, rOuter, rInner) {
  return describeCirclePath(cx, cy, rOuter) + ' ' + describeCirclePath(cx, cy, rInner)
}

export function describeCirclePath (cx, cy, r) {
  return [
    'M', cx, ',', cy,
    'm', 0 - r, ',', 0,
    'a', r, ',', r, 0, 1, ',', 0, r * 2, ',', 0,
    'a', r, ',', r, 0, 1, ',', 0, 0 - r * 2, ',', 0,
    'z'
  ].join(' ').replace(/\s,\s/g, ',')
}

export function describePointPath (points) {
  return points.map(function (point, iPoint) {
    return (iPoint > 0 ? 'L' : 'M') + point[0] + ' ' + point[1]
  }).join(' ') + 'Z'
}

/**
 * Rotate a cartesian point about given origin by X degrees
 */
export function rotatePoint (point, angle, origin) {
  var radians = angle * Math.PI / 180
  var x = point[0] - origin[0]
  var y = point[1] - origin[1]
  var x1 = x * Math.cos(radians) - y * Math.sin(radians) + origin[0]
  var y1 = x * Math.sin(radians) + y * Math.cos(radians) + origin[1]
  return [x1, y1]
}

/**
 * Rotate an array of cartesian points about a given origin by X degrees
 */
export function rotatePoints (points, angle, origin) {
  return points.map(point => {
    return rotatePoint(point, angle, origin)
  })
}

/**
 * Restrict a number to a min + max range
 */
export function restrictToRange (val, min, max) {
    if (val < min) return min
    if (val > max) return max
    return val
}