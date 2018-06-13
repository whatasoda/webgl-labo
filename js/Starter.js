;((WGLL) => {
  const requestAnimationFrame = (
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame
  )
  const Starter = {

    animate: function () {

      if (
        WGLL.RendererBase.using &&
        WGLL.Camera.using &&
        WGLL.Particle.using
      ) {
        Starter.currentFrame++
        WGLL.title.style.opacity = Math.max(Math.min((Starter.currentFrame / WGLL.speed - 1.375), 1), 0)
        if (Starter.currentFrame > 5 * WGLL.speed - 50 || Starter.currentFrame < 2) {
          WGLL.Particle.using.calc()
          WGLL.Camera.using.spherical.alpha += 0.3
          WGLL.Camera.using.fovy =
            (Math.pow(Math.sin(WGLL.Particle.using.frame * 0.003), 2) + 0.3) * Math.PI / 5
        }
        WGLL.RendererBase.using.render()

      }
      requestAnimationFrame(Starter.animate)
    },

    isCurrentFrame: function (target) {
      if (target.frame == Starter.currentFrame || isNaN(target.frame))
        return true
      else
        target.frame = Starter.currentFrame
      return false
    },

    restart: function () {
      Starter.currentFrame = 0
      WGLL.Particle.reset(false)
    }

  }
  Starter.currentFrame = 0
  WGLL.Starter = Starter

})(window.WGLL = window.WGLL || {})
