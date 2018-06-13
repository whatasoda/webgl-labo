;((WGLL) => {
  const glmx = window.glmx

  class RendererBase {
    constructor (width, height, shaders, option = {}) {
      this.availability = true
      this.canvas = document.createElement("canvas")
      if (option.container instanceof Element) {
        if (option.container.firstChild)
          option.container.insertBefore(this.canvas, option.container.firstChild)
        else
          option.container.append(this.canvas)
      }
      this.width = width
      this.height = height
      this.shaders = []
      this.clearDepth = option.clearDepth || 1
      this.clearColor = option.clearColor || glmx.vec4.fromValues(0,0,0,1)
      const gl = this.canvas.getContext('webgl', {antialias: false}) || this.canvas.getContext('experimental-webgl', {antialias: true})
      this.gl = gl
      for (const shader of shaders) {
        let shaderTmp = new shader(gl)
        if (shaderTmp.availability)
          this.shaders.push(shaderTmp)
      }
      // gl.enable(gl.CULL_FACE)
      // gl.depthFunc(gl.LEQUAL);
      // gl.blendEquation(gl.FUNC_ADD)
      // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
    }

    setCurrent () {
      WGLL.RendererBase.using = this
    }

    render () {
      if (this.availability) {
        const gl = this.gl

        gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight)
        gl.canvas.width  = gl.canvas.clientWidth
        gl.canvas.height = gl.canvas.clientHeight
        if (WGLL.Camera.using)
          WGLL.Camera.using.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight

        for (const shader of this.shaders)
          shader.render(gl, this)

        gl.flush()
      } else
        console.warn("This renderer is not available.")
    }

    clear (color) {
      const gl = this.gl
      gl.clearColor(...(color || this.clearColor))
      gl.clearDepth(this.clearDepth)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    }

    get aspect() {
      return this.canvas.width / this.canvas.height
    }

    get width() {
      return this.canvas.width
    }
    set width(value) {
      this.canvas.width = value
    }
    get height() {
      return this.canvas.height
    }
    set height(value) {
      this.canvas.height = value
    }

  }
  WGLL.RendererBase = RendererBase
  WGLL.RendererBase.using = null

  class ShaderBase {

    constructor (gl, shaderTexts = {}) {
      this.availability = true
      this.shaders = {}
      for (const name in shaderTexts) {
        const compileResults = this.getProgram(gl, shaderTexts[name], name)
        if (compileResults) {
          compileResults.name = name
          this.shaders[name] = compileResults
        } else
          this.availability = false
      }
    }

    getProgram (gl, shaderText, name) {
      if (typeof shaderText.vert === 'string' && typeof shaderText.frag === 'string') {
        const vert = this.getShader(gl, shaderText.vert, gl.VERTEX_SHADER)
        const frag = this.getShader(gl, shaderText.frag, gl.FRAGMENT_SHADER)
        const prog = gl.createProgram()
        if (frag && vert && prog) {
          gl.attachShader(prog, vert)
          gl.attachShader(prog, frag)
          gl.linkProgram(prog)
          if ( gl.getProgramParameter(prog, gl.LINK_STATUS) ) {
            let tmpMatch
            const attrLength = ( tmpMatch = shaderText.vert.match(ShaderBase.Patterns.attribute) ) && tmpMatch.length
            const unifLength = (( tmpMatch = shaderText.vert.match(ShaderBase.Patterns.uniform)  ) && tmpMatch.length) +
                               (( tmpMatch = shaderText.frag.match(ShaderBase.Patterns.uniform)  ) && tmpMatch.length)
            const attributes = {}
            const uniforms = {}
            let info,
              attrCount = 0,
              unifCount = 0
            while ( attrCount < attrLength && (info = gl.getActiveAttrib(prog, attrCount++)) ) {
              const name = info.name.replace(/\[0\]/, '')
              attributes[name] = {}
              attributes[name].location = gl.getAttribLocation(prog, info.name)
              attributes[name].size     = this.getAttrSize(gl, info.type)
            }
            if (gl.getError() === gl.INVALID_VALUE)
              console.warn(`${name}: GL_INVALID_VALUE: glGetActiveAttrib`);
            while ( unifCount < unifLength && (info = gl.getActiveUniform(prog, unifCount++)) ) {
              const name = info.name.replace(/\[0\]/, '')
              uniforms[name] = {}
              uniforms[name].location = gl.getUniformLocation(prog, info.name)
            }
            if (gl.getError() === gl.INVALID_VALUE)
              console.warn(`${name}: GL_INVALID_VALUE: glGetActiveUniform`);
            return {
              prog: prog, vert: vert, frag: frag,
              attr: attributes,
              unif: uniforms,
            }
          } else
            console.warn( name + ' ' + gl.getProgramInfoLog(prog) )
        }
      }
      console.warn("This shader is not available.")
      return null
    }

    getShader (gl, shaderText, glShaderConst) {
      let shader = gl.createShader(glShaderConst)
      gl.shaderSource(shader, shaderText)
      gl.compileShader(shader)
      if ( gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) return shader
      else {
        let type
        switch (glShaderConst) {
          case gl.VERTEX_SHADER:    type = 'vert'; break
          case gl.FRAGMENT_SHADER:  type = 'frag'; break
          default:                  type = 'anonymous shader'
        }
        console.warn(`${type}: ${gl.getShaderInfoLog(shader)}`)
        return null
      }
    }

    getAttrSize (gl, type) {
      switch (type) {
        case gl.BOOL:
        case gl.FLOAT:
        case gl.INT:
          return 1
        case gl.FLOAT_VEC2:
        case gl.INT_VEC2:
        case gl.BOOL_VEC2:
        case gl.FLOAT_MAT2:
          return 2
        case gl.FLOAT_VEC3:
        case gl.INT_VEC3:
        case gl.BOOL_VEC3:
        case gl.FLOAT_MAT3:
          return 3
        case gl.FLOAT_VEC4:
        case gl.INT_VEC4:
        case gl.BOOL_VEC4:
        case gl.FLOAT_MAT4:
          return 4
        case gl.SAMPLER_2D:
        case gl.SAMPLER_CUBE:
          return null
        default:
          return 0
      }
    }

    render (gl) {
    }

  }
  ShaderBase.Patterns = {}
  ShaderBase.Patterns.attribute = /\s*attribute\s/g
  ShaderBase.Patterns.uniform   = /\s*uniform\s/g
  WGLL.ShaderBase = ShaderBase





})(window.WGLL = window.WGLL || {})
