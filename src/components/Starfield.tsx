import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  radius: number
  phase: number
  period: number
}

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return

    const ctx = canvas.getContext('2d')
    if (ctx === null) return

    let stars: Star[] = []
    let animationFrame = 0

    const resize = (): void => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const count = Math.min(
        300,
        Math.floor((canvas.width * canvas.height) / 6000),
      )
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 0.5 + Math.random() * 1,
        phase: Math.random() * Math.PI * 2,
        period: 3 + Math.random() * 3,
      }))
    }

    const draw = (time: number): void => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#eef1ff'
      for (const star of stars) {
        const twinkle =
          0.35 +
          0.65 *
            (0.5 +
              0.5 *
                Math.sin(
                  (time / 1000) * ((Math.PI * 2) / star.period) + star.phase,
                ))
        ctx.globalAlpha = twinkle
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      animationFrame = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize)
    resize()
    animationFrame = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return <canvas className="starfield" ref={canvasRef} />
}
