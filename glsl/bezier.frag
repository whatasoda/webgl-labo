precision mediump float;
uniform   float width;
uniform   vec2  resolution;
varying   vec2  Coef[4];
varying   float param[7];
varying   vec2  tan0;
varying   vec2  tan1;
varying   float paramRange0;
varying   float paramRange1;
const     float EPSILON     = 0.005;
const     float DIV_PI      = 0.3183098861837907;
const     float DIV_RADIUS  = 0.8284271247461904;
const     float PISecond    = 1.5707963267948966;
const     mat2  flip        = mat2(0.0, -1.0, 1.0, 0.0);

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

float evalPoint (float param, vec2 coord) {
  float t = param;
  float t2 = pow(param, 2.0);
  vec2 position = Coef[0] +     Coef[1]*t +     Coef[2]*t2 + Coef[3]*t*t2 - coord;
  vec2 tangent  = Coef[1] + 2.0*Coef[2]*t + 3.0*Coef[3]*t2;
  return dot(position, tangent) / length(position) / length(tangent);
}

float evalPointDiff (float param, vec2 coord) {
  float t = param;
  float t2 = pow(param, 2.0);
  vec2 position   =     Coef[0] +         Coef[1]*t +     Coef[2]*t2 + Coef[3]*t*t2 - coord;
  vec2 tangent    =     Coef[1] +     2.0*Coef[2]*t + 3.0*Coef[3]*t2;
  vec2 tanTangent = 2.0*Coef[2] + 3.0*2.0*Coef[3]*t;
  float pSqrLen   = dot(position, position);
  float tSqrLen   = dot(tangent, tangent);
  float ptSqrLen  = pSqrLen * tSqrLen;
  float dpt       = dot(position, tangent);
  return (tSqrLen + dot(position, tanTangent)) * ptSqrLen + dpt * (dpt * tSqrLen + pSqrLen * dot(tangent, tanTangent)) / pow(ptSqrLen, 1.5);
}

float getCircleArea (float x) {
  return (x-1.0)*sqrt(2.0*x - pow(x, 2.0))-asin(1.0-x);
}

float getCurvature (float param) {
  float t = param;
  float t2 = pow(param, 2.0);
  vec2 tangent    =     Coef[1] +     2.0*Coef[2]*t + 3.0*Coef[3]*t2;
  vec2 tanTangent = 2.0*Coef[2] + 3.0*2.0*Coef[3]*t;
  return dot(tangent, flip*tanTangent) / pow(dot(tangent, tangent), 1.5);
}

float evaluate (float init[2], vec2 coord) {
  float nearest;
  float P[2]; float V[2]; bool S[2];
  float nP; float nV;
  P[0] = init[0];
  P[1] = init[1];
  V[0] = evalPoint(P[0], coord);
  V[1] = evalPoint(P[1], coord);
  S[0] = V[0] > 0.0;
  S[1] = V[1] > 0.0;
  if (S[0] == S[1]) {
    bool  usingParam = abs(getCurvature(init[0])) < abs(getCurvature(init[1]));
    float paramStart = usingParam ? init[0] : init[1];
    float paramStep = (usingParam ? 1.0 : -1.0) * (init[1] - init[0]) / 32.0; // 0.03125 = 1 / 32
    nP = paramStart;
    for(int i = 1; i < 32; i++) {
      nP += paramStep;
      V[1] = evalPoint(nP, coord);
      if (S[0] != V[1] >= 0.0) {
        return nP - V[1] * paramStep / (V[1] - V[0]);
      }
      V[0] = V[1];
    }
    return -1.0;
  }
  // 割線法
  bool  L = true;
  for (int i = 0; i<64; i++) {
    nP = (L ? P[1] : P[0]) - (L ? V[1] : V[0]) * (P[1] - P[0]) / (V[1] - V[0]);
    nV = evalPoint(nP, coord);
    L = S[1] == nV > 0.0;
    if (L) {
      P[1] = nP;
      V[1] = nV;
    } else {
      P[0] = nP;
      V[0] = nV;
    }
  }
  nearest = L ? P[1] : P[0];
  return nearest;
}

void main(void) {
  vec2 coord = gl_FragCoord.xy / resolution * 2.0 - 1.0;
  float nearest = -1.0;
  float neaerstLen = width;
  float tmpParam;
  float tmpArray[2];
  for(int i = 0; i < 7; i++) {
    if (param[i+1] < 0.0) {
      break;
    }
    tmpArray[0] = param[i];
    tmpArray[1] = param[i+1];
    tmpParam = evaluate(tmpArray, coord);
    if ( 0.0 < tmpParam && tmpParam < 1.0 ) {
      nearest = length((getPoint(tmpParam) - coord)*resolution) < neaerstLen
        ? tmpParam
        : nearest;
      neaerstLen = length((getPoint(nearest) - coord)*resolution);
    }
  }
  if (nearest == -1.0)
    discard;
  float alpha = 1.0;
  if (nearest < paramRange0) {
    float dist0 = min(DIV_RADIUS * dot(gl_FragCoord.xy - (getPoint(0.0) + 1.0) * resolution / 2.0, normalize(tan0)), 1.0);
    float area0  = DIV_PI * (getCircleArea(1.0 - abs(dist0)) + PISecond);
    alpha *= dist0 > 0.0 ? 1.0 - area0 : area0;
  }
  if (1.0 - paramRange1 < nearest) {
    float dist1 = min(DIV_RADIUS * dot(gl_FragCoord.xy - (getPoint(1.0) + 1.0) * resolution / 2.0, normalize(tan1)), 1.0);
    float area1  = DIV_PI * (getCircleArea(1.0 - abs(dist1)) + PISecond);
    alpha *= dist1 > 0.0 ? 1.0 - area1 : area1;
  }
  if (length((coord - getPoint(nearest))*resolution) > width) {
    discard;
  }
  vec2 point = getPoint(nearest);
  float dist = 1.0 - length((coord - point)*resolution) / width;
  alpha *= dist;
  // gl_FragColor = vec4(vec3(0.6, 0.2, 0.2 + 0.5 * nearest) + dist, 1.0 );
  // gl_FragColor = vec4(vec3(nearest, 0.3, 0.3) + tan(sqrt(abs(sin(dist/1.2 - 0.2)))), alpha);
  // gl_FragColor = vec4(0.25);
  gl_FragColor = vec4( vec3((nearest - 0.25) * 4.0 / 3.0, (0.5 - abs(0.5 - nearest)) * 4.0 / 3.0, (0.75 - nearest) * 4.0 / 3.0) + max(dist * 100.0 - 99.8, 0.0) * 10000.0 , 1.0);
  // if (min( length(coord - getPoint(P[0])), length(coord - getPoint(P[1]))) < 0.05 ) {
  //   gl_FragColor = vec4( 0.0, 0.0, 1.0, .25);
  //
  // }
}
