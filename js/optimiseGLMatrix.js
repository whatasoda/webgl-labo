;((DHFT2017) => {
  window.glmx = {}
  if (
    window.glMatrix &&
    window.mat2 &&
    window.mat2d &&
    window.mat3 &&
    window.mat4 &&
    window.quat &&
    window.vec2 &&
    window.vec3 &&
    window.vec4
  ) {
    window.glmx.glMatrix = window.glMatrix
    window.glmx.mat2     = window.mat2
    window.glmx.mat2d    = window.mat2d
    window.glmx.mat3     = window.mat3
    window.glmx.mat4     = window.mat4
    window.glmx.quat     = window.quat
    window.glmx.vec2     = window.vec2
    window.glmx.vec3     = window.vec3
    window.glmx.vec4     = window.vec4
  } else
    console.warn('Optimising gl-matrix is faild!');
})(window.DHFT2017 = window.DHFT2017 || {})
