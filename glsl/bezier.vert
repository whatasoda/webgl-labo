precision mediump float;
attribute vec3  CV0;
attribute vec3  CV1;
attribute vec3  CV2;
attribute vec3  CV3;
uniform   mat4  mvpMatrix;
uniform   mat4  mvpInvert;
uniform   float margin; // = width
uniform   vec2  resolution;
varying   vec2  Coef[4];
varying   float param[7];
varying   vec2  tan0;
varying   vec2  tan1;
varying   float paramRange0;
varying   float paramRange1;
const     float div3    = 1.0 / 3.0;
const     float 2PI3rd  = 2.0943951023931953;
const     float one8th  = 0.125;
const     float root2   = 1.4142135623730951;
const     float paramMargin = 0.05;
const     float paramStep   = 0.0625;
// const     float 4PI3rd  = 4.1887902047863905;

vec3 getTangent (float param, out vec3 tangent) {
  float t = param;
  float t2 = pow(param, 2.0);
  tangent = Coef[1] + 2.0*Coef[2]*t + 3.0*Coef[3]*t2;
  return tangent;
}
vec3 getAcceleration (float param, out vec3 acceleration) {
  float t = param;
  acceleration = 2.0*Coef[2] + 6.0*Coef[3]*t
  return acceleration;
}
void setPD (in float param, out vec3 PD[3]) { // set Parametric Diff
  float t = param;
  float t2 = pow(param, 2.0);
  PD[2] = 3.0*Coef[3];
  PD[1] = 2.0*Coef[2];
  PD[0] = Coef[1] + PD[1]*t + PD[2]*t2;
  PD[2] *= 2.0;
  PD[1] += PD[2]*t;
}
void setC (in vec3 PD[3], out vec3 C[7]) { // set CrossProduct
  C[0] = cross(PD[0], cross(PD[2], PD[1]));         // C_132
  C[1] = cross(PD[2], cross(PD[1], PD[0]));         // C_321
  C[2] = cross(PD[1], PD[0]);                       // C_21
  C[3] = cross(PD[2], PD[0]);                       // C_31
  C[4] = cross(PD[0],  C[2]);                       // C_121
  C[5] = cross(PD[1],  C[3]);                       // C_231
  C[6] = cross(PD[0],  C[3]) + cross(PD[1],  C[2]); // C_131 + C_221 = C_131_add_221
}
void setD (in vec3 PD[3], in vec3 C[7], out float D[8]) { // set DotProduct (and other float values)
  D[0] = dot(PD[1], PD[0]);           // D_21
  D[1] = dot(PD[2], PD[0]);           // D_31
  D[2] = dot(PD[1], PD[1]);           // D_22
  D[3] = dot( C[2],  C[3]);           // D_21_31
  D[4] = dot(PD[0], PD[0]);           // L2
  D[5] = dot( C[2],  C[2]);           // T2
  D[6] = pow(abs(D[5]), -0.5) / D[4]; // T2^(-1/2) / L2 = divL2T
  D[7] = D[6] / D[4];                 // divL4T
}
float calcEvaluation (in float param, in vec3 PD[3], in vec3 C[7], in float D[8]) {
  setPD(param, PD); setC(PD, C); setD(PD, C, D);
  return  dot(
            D[4]*(2.0*C[5] + C[0] + C[1]) - D[0]*C[6] - 3.0*(D[1]+D[2])*C[4],
            PD[0] * D[7]
          ) + dot(
            D[4]*C[6] - 3.0*D[0]*C[4],
            PD[1]*D[7] - PD[0]*(4.0*D[0]*T2 + D[4]*D[3])*pow(D[6], 3.0)
          );
//  dot(
//      L2*(2.0*C_231+C_132+C_321) - D_21*C_131_add_221 - 3.0*(D_31+D_22)*C_121,
//      PD[0] * divL4T
//  ) + dot(
//      L2*C_131_add_221 - 3.0*D_21*C_121,
//      PD[1]*divL4T - PD[0]*(4.0*D_21*T2 + L2*D_21_31)*pow(divL2T, 3.0)
//  );
}

float analyze (in float P[2], in float V[2], in bool S[2], in vec3 PD[3], in vec3 C[7], in float D[8]) {
  float nP; float nV;
  bool  L = true;
  for (int i = 0; i<64; i++) {
    nP = (L ? P[1]:P[0]) - (L ? V[1]:V[0]) * (P[1]-P[0]) / (V[1]-V[0]);
    nV = calcEvaluation(nP, PD, C, D);
    L = S[1] == nV > 0.0;
    if (L) {
      P[1] = nP;
      V[1] = nV;
    } else {
      P[0] = nP;
      V[0] = nV;
    }
  }
  return L ? P[1] : P[0];
}

float getCurvatureSpeed (float param, out vec3 tangent, out vec3 acceleration, out float value) {
  getTangent(param, tangent);
  getAcceleration(param, acceleration);
  len  = length(tangent);
  len2 = len*len;
  len3 = len*len2;
  value = 2.0*length(cross(Coef[3], tangent))/(len*len2) - dot(tangent, acceleration)*length(cross(acceleration, tangent))/(len2*len3);
  return value;
}

void main(void) {
  Coef[0] =      CV0;
  Coef[1] = -3.0*CV0 + 3.0*CV1;
  Coef[2] =  3.0*CV0 - 6.0*CV1 + 3.0*CV2;
  Coef[3] =     -CV0 + 3.0*CV1 - 3.0*CV2 + CV3;
  float P[2]; float V[2]; bool S[2]; vec3 PD[3], vec3 C[7], float D[8];
  float AF[10]; // Analysis Field
  AF[0] = 0.0; AF[1] = 1.0; AF[2] = 1.0; AF[3] = 1.0; AF[4] = 1.0;
  AF[5] = 1.0; AF[6] = 1.0; AF[7] = 1.0; AF[8] = 1.0; AF[9] = 1.0;
  param[0] = 0.0; param[1] = 1.0; param[2] = 1.0; param[3] = 1.0;
  param[4] = 1.0; param[5] = 1.0; param[6] = 1.0;
  vec3 altX = CV1 - CV0;
  vec3 altZ = cross(altX, CV2 - CV0);
  bool fieldAssigned = false;
  if (dot(altZ, CV3 - CV0) < EPSILON) {
    vec3 altY = cross(altZ, altX);
    vec3 altCoef = cross(
      vec3(dot(Coef[1], altX), dot(Coef[2], altX), dot(Coef[3], altX)),
      vec3(dot(Coef[1], altY), dot(Coef[2], altY), dot(Coef[3], altY))
    ) * vec3(3.0, -3.0, 1.0); // x: 2, y: 1, z: 0
    float D = pow(altCoef.y, 2.0) - 4.0 * altCoef.x * altCoef.z;
    if (0.0 <= D) {
      float divDenom = 0.5 / altCoef.x;
      AF[2] = (-altCoef.y - sqrt(D) ) * divDenom;
      AF[6] = (-altCoef.y + sqrt(D) ) * divDenom;
      AF[3] = max(min(min(AF[2], AF[6]), 1.0), 0.0);
      AF[7] = min(max(max(AF[2], AF[6]), 0.0), 1.0);
      if (AF[3] == 0.0) {
        AF[3] = AF[7];
        AF[6] = 1.0;
        AF[7] = 1.0;
      } else {
        AF[5] = max(AF[7] - paramMargin, 0.0);
        AF[6] = AF[7];
        AF[8] = min(AF[7] + paramMargin, 1.0);
      }
      AF[1] = max(AF[3] - paramMargin, 0.0);
      AF[2] = AF[3];
      AF[4] = min(AF[3] + paramMargin, 1.0);
      fieldAssigned = true;
    }
  }

  int CF = 0; // current Field
  float FS; float FE; // field Start / End
  if (fieldAssigned) {
    for (int i=0; i<16; i++) {
      S[1] = calcEvaluation(paramStep*float(i), PD, C, D) > 0;
      if (S[0] != S[1]) {
        FS = paramStep*float(i-1);
        FE = paramStep*float(i);
              if (CF == 0) { AF[0] = FS; AF[1] = FE; CF = 1; }
        else  if (CF == 1) { AF[2] = FS; AF[3] = FE; CF = 2; }
        else  if (CF == 2) { AF[4] = FS; AF[5] = FE; CF = 3; }
        else  if (CF == 3) { AF[6] = FS; AF[7] = FE; CF = 4; }
        else  if (CF == 4) { AF[8] = FS; AF[9] = FE; }
        S[0] = S[1];
      }
    }
  }

  for (int i=0; i<10; i+=2) {
    if (AF[i] == AF[i+1]) {
      if (AF[i] == 1.0)
        break;
      param[1+i/2] = AF[i];
    }
    P[0] = AF[i];
    P[1] = AF[i+1];
    V[0] = calcEvaluation(P[0], PD, C, D);
    V[1] = calcEvaluation(P[1], PD, C, D);
    S[0] = V[0] > 0.0;
    S[1] = V[1] > 0.0;
    if (S[0] == S[1]) {
      param[1+i/2] = i == 0 ? 0.0 : 1.0;
    } else {
      param[1+i/2] = analyze(P, V, S, PD, C, D, nP, nV);
    }
  }

  CV0 = mvpMatrix * vec4(CV0, 1.0);  CV0 /= CV0.w;
  CV1 = mvpMatrix * vec4(CV1, 1.0);  CV1 /= CV1.w;
  CV2 = mvpMatrix * vec4(CV2, 1.0);  CV2 /= CV2.w;
  CV3 = mvpMatrix * vec4(CV3, 1.0);  CV3 /= CV3.w;
  vec4 pos  = min(CV0, min(CV1, min(CV2, CV3)));
  vec4 size = max(CV0, max(CV1, max(CV2, CV3))) - pos;
  size *= 0.5;
  vec4 tmpVec4[2];
  tmpVec4[0] = mvpInvert * vec4(vec2(0.0), pos.z, 1.0);
  tmpVec4[0] /= tmpVec4[0].w;
  tmpVec4[1] = mvpInvert * vec4(vec2(1.0, 1.0), pos.z, 1.0);
  tmpVec4[1] /= tmpVec4[1].w;
  tmpVec4[0] = mvpMatrix * ((normalize(tmpVec4[1] - tmpVec4[0]) * margin) + tmpVec4[0]);
  tmpVec4[0] /= tmpVec4[0].w;
  vec2 sizeBase = (size.xy + abs(tmpVec4[0].xy) * root2 * 0.5) * resolution * 0.5;
  gl_PointSize = max(sizeBase.x, sizeBase.y);
  gl_Position = vec4(pos + size, 0.0, 1.0);


  // tan0 = getTangent(0.0) * resolution / 2.0;
  // tan1 = getTangent(1.0) * resolution / -2.0;
  // paramRange0 = sqrt(pow((tan0.y * 0.5 / tan0.x), 2.0) + 0.25) / length(tan0);
  // paramRange1 = sqrt(pow((tan1.y * 0.5 / tan1.x), 2.0) + 0.25) / length(tan1);
  // gl_Position = vec4(point2, 0.0, 1.0);

}
