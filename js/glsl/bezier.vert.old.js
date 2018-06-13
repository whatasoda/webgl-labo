;((WGLL) => {
WGLL.bezier = WGLL.bezier || {}
WGLL.bezier.vert = `
precision mediump float;
attribute vec2  CV0;
attribute vec2  CV1;
attribute vec2  CV2;
attribute vec2  CV3;
attribute float P0;
attribute float P1;
attribute float P2;
attribute float P3;
attribute float P4;
attribute float P5;
attribute float P6;
uniform   mat4  mvpMatrix;
uniform   float margin; // = width
uniform   vec2  resolution;
varying   vec2  Coef[4];
varying   float param[7];
varying   vec2  tan0;
varying   vec2  tan1;
varying   float paramRange0;
varying   float paramRange1;

vec2 getPoint (float param) {
  float t = param;
  float t2 = pow(param, 2.0);
  return Coef[0] + Coef[1]*t + Coef[2]*t2 + Coef[3]*t*t2;
}
vec2 getTangent (float param) {
  float t = param;
  float t2 = pow(param, 2.0);
  return Coef[1] + 2.0*Coef[2]*t + 3.0*Coef[3]*t2;
}

void main(void) {
  param[0] = P0;
  param[1] = P1;
  param[2] = P2;
  param[3] = P3;
  param[4] = P4;
  param[5] = P5;
  param[6] = P6;
  vec2 CV2d[4];
  vec4 tmpVec4;
  vec3 CV[4];
  CV2d[0] = CV0;
  CV2d[1] = CV1;
  CV2d[2] = CV2;
  CV2d[3] = CV3;
  for (int d=0; d<4; d++) {
    tmpVec4 = mvpMatrix * vec4(CV2d[d], 0.0, 1.0);
    CV2d[d] = (tmpVec4 / tmpVec4.w).xy;
  }
  Coef[0] = vec2(     CV2d[0]);
  Coef[1] = vec2(-3.0*CV2d[0] + 3.0*CV2d[1]);
  Coef[2] = vec2( 3.0*CV2d[0] - 6.0*CV2d[1] + 3.0*CV2d[2]);
  Coef[3] = vec2(    -CV2d[0] + 3.0*CV2d[1] - 3.0*CV2d[2] + CV2d[3]);
  // vec2 point0 = getPoint(P0);
  // vec2 point1 = getPoint(P1);
  // vec2 tangent0 = normalize(getTangent(P0));
  // vec2 tangent1 = normalize(getTangent(P1));
  // vec2 v10 = point0 - point1;
  // float lenV10 = length(v10);
  // vec2 uV10 = v10 / lenV10;
  // float cos0 = abs(dot(uV10, tangent0));
  // float cos1 = abs(dot(uV10, tangent1));
  // float sin0 = sqrt(1.0 - pow(cos0, 2.0));
  // float sin1 = sqrt(1.0 - pow(cos1, 2.0));
  // float R2 = lenV10 / (sin0 * cos1 + cos0 * sin1);
  // vec2 point2 = point0 + tangent0 * R2 * sin0;
  // vec2 pos  = min(point0, min(point1, point2));
  // vec2 size = max(point0, max(point1, point2)) - pos;
  vec2 pos  = min(CV2d[0], min(CV2d[1], min(CV2d[2], CV2d[3])));
  vec2 size = max(CV2d[0], max(CV2d[1], max(CV2d[2], CV2d[3]))) - pos;
  vec2 sizeBase = size * resolution / 2.0;
  gl_PointSize = (max(sizeBase.x, sizeBase.y) + margin * 2.0) / 2.0;
  gl_Position = vec4(pos + size / 2.0, 0.0, 1.0);
  tan0 = getTangent(0.0) * resolution / 2.0;
  tan1 = getTangent(1.0) * resolution / -2.0;
  paramRange0 = sqrt(pow((tan0.y * 0.5 / tan0.x), 2.0) + 0.25) / length(tan0);
  paramRange1 = sqrt(pow((tan1.y * 0.5 / tan1.x), 2.0) + 0.25) / length(tan1);
  // gl_Position = vec4(point2, 0.0, 1.0);

}

`
})(window.WGLL = window.WGLL || {})