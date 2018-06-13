;((WGLL) => {
  WGLL.EulerPointer = WGLL.defEnum(WGLL.EulerPointer || {}, `
    axisX              , axisY              , axisZ              ,
    axisXInvert        , axisYInvert        , axisZInvert        ,
    positionAxisX      , positionAxisY      , positionAxisZ      ,
    positionAxisXInvert, positionAxisYInvert, positionAxisZInvert,
    pivot
  `)
  const EulerPointer = WGLL.EulerPointer

  WGLL.EulerOrder = WGLL.defEnum(WGLL.EulerOrder || {}, `
    xzy, xyz, yxz, yzx, zyx, zxy
  `)
  const EulerOrder = WGLL.EulerOrder


  class EulerAngles {
    constructor (option = {}) {
      this.alpha       = 0
      this.alphaOffset = 0
      this.beta        = 0
      this.betaOffset  = 0
      this.gamma       = 0
      this.gammaOffset = 0
      this.c1          = 0
      this.c2          = 0
      this.c3          = 0
      this.s1          = 0
      this.s2          = 0
      this.s3          = 0
      this._order          = option.order           || EulerOrder.yxz
      this._axisX          = option._axisX          || glmx.vec3.create()
      this._axisY          = option._axisY          || glmx.vec3.create()
      this._axisZ          = option._axisZ          || glmx.vec3.create()
      this._axisXInvert    = option._axisXInvert    || glmx.vec3.create()
      this._axisYInvert    = option._axisYInvert    || glmx.vec3.create()
      this._axisZInvert    = option._axisZInvert    || glmx.vec3.create()
      this._rotationMatrix = option._rotationMatrix || glmx.mat4.create()
    }

    fromPointer (pointer) {
      /**
      ***@param{EulerPointer}
      ***@return{Vec3}
      **/
      switch(pointer) {
        case EulerPointer.axisX        : return this.axisX
        case EulerPointer.positionAxisX: return this.axisX
        case EulerPointer.axisY        : return this.axisY
        case EulerPointer.positionAxisY: return this.axisY
        case EulerPointer.axisZ        : return this.axisZ
        case EulerPointer.positionAxisZ: return this.axisZ
        case EulerPointer.axisXInvert        : return this.axisXInvert
        case EulerPointer.positionAxisXInvert: return this.axisXInvert
        case EulerPointer.axisYInvert        : return this.axisYInvert
        case EulerPointer.positionAxisYInvert: return this.axisYInvert
        case EulerPointer.axisZInvert        : return this.axisZInvert
        case EulerPointer.positionAxisZInvert: return this.axisZInvert
        case EulerPointer.pivot: return glmx.vec3.create()
      }
    }

    refreshParams (force = false) {
      if (WGLL.Starter.isCurrentFrame(this) || force) {
        let [radianA, radianB, radianG] = [(this.alpha+this.alphaOffset)/180*Math.PI, (this.beta+this.betaOffset)/180*Math.PI, (this.gamma+this.gammaOffset)/180*Math.PI];
        [this.c1,this.c2,this.c3,this.s1,this.s2,this.s3] = [Math.cos(radianA),Math.cos(radianB),Math.cos(radianG),Math.sin(radianA),Math.sin(radianB),Math.sin(radianG)]
      }
    }

    get axisX () {
      this.refreshParams()
      let [c1,c2,c3,s1,s2,s3] = [this.c1,this.c2,this.c3,this.s1,this.s2,this.s3]
      const set = glmx.vec3.set
      const out = this._axisX
      switch (this._order) {
        case EulerOrder.xzy: return set(out, c2*c3         , s1*s3+c1*c3*s2, c3*s1*s2-c1*s3)
        case EulerOrder.xyz: return set(out, c2*c3         , c1*s3+c3*s1*s2, s1*s3-c1*c3*s2)
        case EulerOrder.yxz: return set(out, c1*c3+s1*s2*s3, c2*s3         , c1*s2*s3-c3*s1)
        case EulerOrder.yzx: return set(out, c1*c2         , s2            , -c2*s1        )
        case EulerOrder.zyx: return set(out, c1*c2         , c2*s1         , -s2           )
        case EulerOrder.zxy: return set(out, c1*c3-s1*s2*s3, c3*s1+c1*s2*s3, -c2*s3        )
      }
    }

    get axisY () {
      this.refreshParams()
      let [c1,c2,c3,s1,s2,s3] = [this.c1,this.c2,this.c3,this.s1,this.s2,this.s3]
      const set = glmx.vec3.set
      const out = this._axisY
      switch (this._order) {
        case EulerOrder.xzy: return set(out, -s2           , c1*c2         , c2*s1         )
        case EulerOrder.xyz: return set(out, -c2*s3        , c1*c3-s1*s2*s3, c3*s1+c1*s2*s3)
        case EulerOrder.yxz: return set(out, c3*s1*s2-c1*s3, c2*c3         , c1*c3*s2+s1*s3)
        case EulerOrder.yzx: return set(out, s1*s3-c1*c3*s2, c2*c3         , c1*s3+c3*s1*s2)
        case EulerOrder.zyx: return set(out, c1*s2*s3-c3*s1, c1*c3+s1*s2*s3, c2*s3         )
        case EulerOrder.zxy: return set(out, -c2*s1        , c1*c2         , s2            )
      }
    }

    get axisZ () {
      this.refreshParams()
      let [c1,c2,c3,s1,s2,s3] = [this.c1,this.c2,this.c3,this.s1,this.s2,this.s3]
      const set = glmx.vec3.set
      const out = this._axisZ
      switch (this._order) {
        case EulerOrder.xzy: return set(out, c2*s3         , c1*s2*s3-c3*s1, c1*c3+s1*s2*s3)
        case EulerOrder.xyz: return set(out, s2            , -c2*s1        , c1*c2         )
        case EulerOrder.yxz: return set(out, c2*s1         , -s2           , c1*c2         )
        case EulerOrder.yzx: return set(out, c3*s1+c1*s2*s3, -c2*s3        , c1*c3-s1*s2*s3)
        case EulerOrder.zyx: return set(out, s1*s3+c1*c3*s2, c3*s1*s2-c1*s3, c2*c3         )
        case EulerOrder.zxy: return set(out, c1*s3+c3*s1*s2, s1*s3-c1*c3*s2, c2*c3         )
      }
    }

    get axisXInvert () {
      this.refreshParams()
      let [c1,c2,c3,s1,s2,s3] = [this.c1,this.c2,this.c3,this.s1,this.s2,this.s3]
      const set = glmx.vec3.set
      const out = this._axisXInvert
      switch (this._order) {
        case EulerOrder.xzy: return set(out, c2*c3          * -1, s1*s3+c1*c3*s2 * -1, c3*s1*s2-c1*s3 * -1)
        case EulerOrder.xyz: return set(out, c2*c3          * -1, c1*s3+c3*s1*s2 * -1, s1*s3-c1*c3*s2 * -1)
        case EulerOrder.yxz: return set(out, c1*c3+s1*s2*s3 * -1, c2*s3          * -1, c1*s2*s3-c3*s1 * -1)
        case EulerOrder.yzx: return set(out, c1*c2          * -1, s2             * -1, -c2*s1         * -1)
        case EulerOrder.zyx: return set(out, c1*c2          * -1, c2*s1          * -1, -s2            * -1)
        case EulerOrder.zxy: return set(out, c1*c3-s1*s2*s3 * -1, c3*s1+c1*s2*s3 * -1, -c2*s3         * -1)
      }
    }

    get axisYInvert () {
      this.refreshParams()
      let [c1,c2,c3,s1,s2,s3] = [this.c1,this.c2,this.c3,this.s1,this.s2,this.s3]
      const set = glmx.vec3.set
      const out = this._axisYInvert
      switch (this._order) {
        case EulerOrder.xzy: return set(out, -s2            * -1, c1*c2          * -1, c2*s1          * -1)
        case EulerOrder.xyz: return set(out, -c2*s3         * -1, c1*c3-s1*s2*s3 * -1, c3*s1+c1*s2*s3 * -1)
        case EulerOrder.yxz: return set(out, c3*s1*s2-c1*s3 * -1, c2*c3          * -1, c1*c3*s2+s1*s3 * -1)
        case EulerOrder.yzx: return set(out, s1*s3-c1*c3*s2 * -1, c2*c3          * -1, c1*s3+c3*s1*s2 * -1)
        case EulerOrder.zyx: return set(out, c1*s2*s3-c3*s1 * -1, c1*c3+s1*s2*s3 * -1, c2*s3          * -1)
        case EulerOrder.zxy: return set(out, -c2*s1         * -1, c1*c2          * -1, s2             * -1)
      }
    }

    get axisZInvert () {
      this.refreshParams()
      let [c1,c2,c3,s1,s2,s3] = [this.c1,this.c2,this.c3,this.s1,this.s2,this.s3]
      const set = glmx.vec3.set
      const out = this._axisXInvert
      switch (this._order) {
        case EulerOrder.xzy: return set(out, c2*s3          * -1, c1*s2*s3-c3*s1 * -1, c1*c3+s1*s2*s3 * -1)
        case EulerOrder.xyz: return set(out, s2             * -1, -c2*s1         * -1, c1*c2          * -1)
        case EulerOrder.yxz: return set(out, c2*s1          * -1, -s2            * -1, c1*c2          * -1)
        case EulerOrder.yzx: return set(out, c3*s1+c1*s2*s3 * -1, -c2*s3         * -1, c1*c3-s1*s2*s3 * -1)
        case EulerOrder.zyx: return set(out, s1*s3+c1*c3*s2 * -1, c3*s1*s2-c1*s3 * -1, c2*c3          * -1)
        case EulerOrder.zxy: return set(out, c1*s3+c3*s1*s2 * -1, s1*s3-c1*c3*s2 * -1, c2*c3          * -1)
      }
    }

    get rotationMatrix () {
      this.refreshParams()
      let [c1,c2,c3,s1,s2,s3] = [this.c1,this.c2,this.c3,this.s1,this.s2,this.s3]
      const set = glmx.mat4.set
      const out = this._rotationMatrix
      switch (this._order) {
        case EulerOrder.xzy: return set(out,
          c2*c3         , -s2           , c2*s3         , 0,
          s1*s3+c1*c3*s2, c1*c2         , c1*s2*s3-c3*s1, 0,
          c3*s1*s2-c1*s3, c2*s1         , c1*c3+s1*s2*s3, 0,
          0             , 0             , 0             , 1)
        case EulerOrder.xyz: return set(out,
          c2*c3         , -c2*s3        , s2            , 0,
          c1*s3+c3*s1*s2, c1*c3-s1*s2*s3, -c2*s1        , 0,
          s1*s3-c1*c3*s2, c3*s1+c1*s2*s3, c1*c2         , 0,
          0             , 0             , 0             , 1)
        case EulerOrder.yxz: return set(out,
          c1*c3+s1*s2*s3, c3*s1*s2-c1*s3, c2*s1         , 0,
          c2*s3         , c2*c3         , -s2           , 0,
          c1*s2*s3-c3*s1, c1*c3*s2+s1*s3, c1*c2         , 0,
          0             , 0             , 0             , 1)
        case EulerOrder.yzx: return set(out,
          c1*c2         , s1*s3-c1*c3*s2, c3*s1+c1*s2*s3, 0,
          s2            , c2*c3         , -c2*s3        , 0,
          -c2*s1        , c1*s3+c3*s1*s2, c1*c3-s1*s2*s3, 0,
          0             , 0             , 0             , 1)
        case EulerOrder.zyx: return set(out,
          c1*c2         , c1*s2*s3-c3*s1, s1*s3+c1*c3*s2, 0,
          c2*s1         , c1*c3+s1*s2*s3, c3*s1*s2-c1*s3, 0,
          -s2           , c2*s3         , c2*c3         , 0,
          0             , 0             , 0             , 1)
        case EulerOrder.zxy: return set(out,
          c1*c3-s1*s2*s3, -c2*s1        , c1*s3+c3*s1*s2, 0,
          c3*s1+c1*s2*s3, c1*c2         , s1*s3-c1*c3*s2, 0,
          -c2*s3        , s2            , c2*c3         , 0,
          0             , 0             , 0             , 1)
      }
    }

    get order () {return this._order}
    set order (value) {
      /**
      ***@param{EulerOrder}
      **/
      if (this._order != value) {
        let rm = this.rotationMatrix
        this._order = value
        switch (value) {
          case EulerOrder.xzy:
            this.beta = Math.asin(-rm[1])
            if ( Math.abs(rm[1]) < EulerAngles.subEPSILON) {
              this.alpha = Math.atan2( rm[9],  rm[5])
              this.gamma = Math.atan2( rm[2],  rm[0])
            } else {
              this.alpha = Math.atan2( rm[4], -rm[8])
              this.gamma = 0
            }
          break
          case EulerOrder.xyz:
            this.beta = Math.asin(rm[2])
            if ( Math.abs(rm[2]) < EulerAngles.subEPSILON) {
              this.alpha = Math.atan2(-rm[6], rm[10])
              this.gamma = Math.atan2(-rm[1],  rm[0])
            } else {
              this.alpha = Math.atan2( rm[8],  rm[4])
              this.gamma = 0
            }
          break
          case EulerOrder.yxz:
            this.beta = Math.asin(-rm[6])
            if ( Math.abs(rm[6]) < EulerAngles.subEPSILON) {
              this.alpha = Math.atan2( rm[2], rm[10])
              this.gamma = Math.atan2( rm[4],  rm[5])
            } else {
              this.alpha = Math.atan2(-rm[8],  rm[0])
              this.gamma = 0
            }
          break
          case EulerOrder.yzx:
            this.beta = Math.asin(rm[4])
            if ( Math.abs(rm[4]) < EulerAngles.subEPSILON) {
              this.alpha = Math.atan2(-rm[8],  rm[0])
              this.gamma = Math.atan2(-rm[6],  rm[5])
            } else {
              this.alpha = 0
              this.gamma = Math.atan2( rm[2], rm[10])
            }
          break
          case EulerOrder.zyx:
            this.beta = Math.asin(-rm[8])
            if ( Math.abs(rm[8]) < EulerAngles.subEPSILON) {
              this.alpha = Math.atan2( rm[4],  rm[0])
              this.gamma = Math.atan2( rm[9], rm[10])
            } else {
              this.alpha = 0
              this.gamma = Math.atan2( rm[2], -rm[1])
            }
          break
          case EulerOrder.zxy:
            this.beta = Math.asin(-rm[9])
            if ( Math.abs(rm[9]) < EulerAngles.subEPSILON) {
              this.alpha = Math.atan2(-rm[8], rm[10])
              this.gamma = Math.atan2(-rm[1],  rm[5])
            } else {
              this.alpha = 0
              this.gamma = Math.atan2( rm[2],  rm[0])
            }
          break
        }
        this.refreshParams(true)
      }
    }

  }
  WGLL.EulerAngles = EulerAngles
  WGLL.subEPSILON = 1 - glmx.glMatrix.EPSILON



  class Spherical extends EulerAngles {

    constructor (option = {}) {
      super(option)
      this._radius              = option.radius             || 1
      this.pivot                = option.pivot                || glmx.vec3.create()
      this._positionAxisX       = option._positionAxisX       || glmx.vec3.create()
      this._positionAxisY       = option._positionAxisY       || glmx.vec3.create()
      this._positionAxisZ       = option._positionAxisZ       || glmx.vec3.create()
      this._positionAxisXInvert = option._positionAxisXInvert || glmx.vec3.create()
      this._positionAxisYInvert = option._positionAxisYInvert || glmx.vec3.create()
      this._positionAxisZInvert = option._positionAxisZInvert || glmx.vec3.create()
    }

    fromPointer (pointer) {
      /**
      ***@param{EulerPointer}
      ***@return{Vec3}
      **/
      switch (pointer) {
        case EulerPointer.positionAxisX: return this.positionAxisX
        case EulerPointer.positionAxisY: return this.positionAxisY
        case EulerPointer.positionAxisZ: return this.positionAxisZ
        case EulerPointer.positionAxisXInvert: return this.positionAxisXInvert
        case EulerPointer.positionAxisYInvert: return this.positionAxisYInvert
        case EulerPointer.positionAxisZInvert: return this.positionAxisZInvert
        case EulerPointer.pivot: return this.pivot
        default: return super.fromPointer(pointer)
      }
    }

    get radius () {
      return this._radius
    }
    set radius (value) {
      this._radius = (Math.abs(value) > RedPlier.EPSILON ? value : (value > 0 ? RedPlier.EPSILON : -RedPlier.EPSILON))
    }

    get positionAxisX () {return this.combineToPosition(this._positionAxisX, this.axisX)}
    get positionAxisY () {return this.combineToPosition(this._positionAxisY, this.axisY)}
    get positionAxisZ () {return this.combineToPosition(this._positionAxisZ, this.axisZ)}

    get positionAxisXInvert () {return this.combineToPosition(this._positionAxisXInvert, this.axisXInvert)}
    get positionAxisYInvert () {return this.combineToPosition(this._positionAxisYInvert, this.axisYInvert)}
    get positionAxisZInvert () {return this.combineToPosition(this._positionAxisZInvert, this.axisZInvert)}

    combineToPosition (out , axis) {
      glmx.vec3.scale(out, axis, this.radius)
      glmx.vec3.add(out, out, this.pivot)
      return out
    }

  }
  WGLL.Spherical = Spherical

})(window.WGLL = window.WGLL || {})
