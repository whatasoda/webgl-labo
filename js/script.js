;((WGLL) => {
  WGLL.EPSILON = 0.00001
  class BezierShader extends WGLL.ShaderBase {
    constructor(gl) {
      super(gl, {
        bezier: {frag: WGLL.bezier.frag, vert: WGLL.bezier.vert}
      })
    }
    render (gl, Renderer) {
      const bezi = this.shaders.bezier
      const Bezier = WGLL.SVGConverter.using
      const Camera = WGLL.Camera.using
      const mvpMatrix = Camera.vpMatrix
      Renderer.clear([0,0,0,1])
      gl.useProgram(bezi.prog)
      gl.enable(gl.BLEND)
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
      for (const attrName in Bezier.buffer) {
        if (bezi.attr[attrName]) {
          gl.bindBuffer(gl.ARRAY_BUFFER, Bezier.buffer[attrName])
          gl.enableVertexAttribArray(bezi.attr[attrName].location)
          gl.vertexAttribPointer(bezi.attr[attrName].location, bezi.attr[attrName].size, gl.FLOAT, false, 0, 0)
        }
      }
      gl.uniformMatrix4fv(bezi.unif.mvpMatrix.location, false, mvpMatrix)
      const width = 1500
      gl.uniform1f(bezi.unif.width.location, width)
      gl.uniform1f(bezi.unif.margin.location, width)
      gl.uniform2f(bezi.unif.resolution.location, Renderer.canvas.width, Renderer.canvas.height)
      gl.drawArrays(gl.POINTS, 0, 1)
      // gl.drawArrays(gl.POINTS, 0, 1)
      // gl.drawArrays(gl.POINTS, 1, 1)
      // gl.drawArrays(gl.POINTS, 2, 1)
      // gl.drawArrays(gl.POINTS, 3, 1)
    }
  }


  const Camera = new WGLL.Perspective({
    spherical: new WGLL.Spherical({ radius: 200}),
    far: 10000,
  })
  Camera.setCurrent()

  const Renderer = new WGLL.RendererBase(1000,1000,
    [BezierShader]
  )
  document.getElementById('canvas').append(Renderer.canvas)
  Renderer.setCurrent()

  WGLL.SVGConverter.using = new WGLL.SVGConverter(document.getElementById('svgtest'))

  Renderer.render()


  console.log(WGLL.Data);
  const testV = glmx.vec4.fromValues(WGLL.Data.CV3[0], WGLL.Data.CV3[1], 0, 1)
  const outV = glmx.vec4.create()
  glmx.vec4.transformMat4(outV, testV, WGLL.Camera.using.vpMatrix)
  console.log(outV);
  glmx.vec4.scale(outV, outV, 1/outV[3])
  console.log(outV);

})(window.WGLL = window.WGLL || {})
