;((WGLL) => {

  class Camera {

    constructor (option = {}) {
      this.near              = option.near              || 1
      this.far               = option.far               || 10000
      this.aspect            = option.aspect            || 1
      this.spherical         = option.spherical         || new WGLL.Spherical()
      this._viewMatrix       = option._viewMatrix       || glmx.mat4.create()
      this._projectionMatrix = option._projectionMatrix || glmx.mat4.create()
      this._vpMatrix         = option._vpMatrix         || glmx.mat4.create()
      this.up                = option.up                || WGLL.EulerPointer.axisY
      this.position          = option.position          || WGLL.EulerPointer.positionAxisZInvert
      this.target            = option.target            || WGLL.EulerPointer.pivot
    }

    setCurrent () {
      WGLL.Camera.using = this
    }

    get viewMatrix () {
      if (this.spherical.radius < glmx.glMatrix.EPSILON)
        this.spherical.radius = glmx.glMatrix.EPSILON
      glmx.mat4.lookAt(
        this._viewMatrix,
        this.spherical.fromPointer(this.position || 0),
        this.spherical.fromPointer(this.target || 0),
        this.spherical.fromPointer(this.up || 0)
      )
      return this._viewMatrix
    }

    get projectionMatrix () {
      return this._projectionMatrix
    }

    get vpMatrix () {
      glmx.mat4.multiply(
        this._vpMatrix,
        this.projectionMatrix,
        this.viewMatrix
      )
      return this._vpMatrix
    }

  }
  WGLL.Camera = Camera
  WGLL.Camera.using = null




  class Perspective extends Camera {

    constructor (option = {}) {
      super(option)
      this.fovy = (option.fovy || 90) / 180 * Math.PI
    }

    get projectionMatrix () {
      glmx.mat4.perspective(
        this._projectionMatrix,
        this.fovy,
        this.aspect,
        this.near,
        this.far
      )
      return this._projectionMatrix
    }

  }
  WGLL.Perspective = Perspective




  class Orthognal extends Camera {

    constructor (option = {}) {
      super(option)
      zoom = option.zoom || 1
    }

    get projectionMatrix () {
      let halfW = 1 / this.zoom
      let halfH = this.aspect / this.zoom
      glmx.mat4.ortho(
        this._projectionMatrix,
        -halfW,
        halfW,
        -halfH,
        halfH,
        this.near,
        this.far
      )
      return this._projectionMatrix
    }

  }
  WGLL.Orthognal = Orthognal

})(window.WGLL = window.WGLL || {})
