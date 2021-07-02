import React, { createRef } from 'react'

type Props = {
  width: number
  height: number
}

type State = {}

type Color = [number, number, number, number]

export class Canvas extends React.Component<Props, State> {
  private canvasRef = createRef<HTMLCanvasElement>()
  private renderingContext: CanvasRenderingContext2D | null = null

  private scaleFactor = 2
  private lineWidth = 3
  private lineColor: Color = [0, 0, 0, 255]

  private prevX = -1
  private prevY = -1
  private isPointerActive = false
  private isPointerMoved = false

  private imageData: ImageData | null = null

  private isRequestingFrame = false

  componentDidMount() {
    const e = requireNotNull(this.canvasRef.current)
    const ctx = requireNotNull(e.getContext('2d'))
    this.renderingContext = ctx
    const imageData = new ImageData(
      this.props.width * this.scaleFactor,
      this.props.height * this.scaleFactor
    )
    clear(imageData)

    // drawLine(imageData, 30 * 2, 180 * 2, 200 * 2, 250 * 2, 30 * 2, [255, 0, 0])
    this.imageData = imageData
    // ctx.putImageData(imageData, 0, 0)

    e.addEventListener('pointerdown', this.onPointerDown)
    e.addEventListener('pointermove', this.onPointerMove)
    document.body.addEventListener('pointerup', this.onGlobalPointerUp)
  }

  onPointerDown = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    this.prevX = e.offsetX
    this.prevY = e.offsetY
    this.isPointerActive = true
  }

  onPointerMove = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const imageData = requireNotNull(this.imageData)
    if (this.isPointerActive) {
      this.isPointerMoved = true

      const x = e.offsetX
      const y = e.offsetY
      drawLine(
        imageData,
        this.prevX * this.scaleFactor,
        this.prevY * this.scaleFactor,
        x * this.scaleFactor,
        y * this.scaleFactor,
        this.lineWidth * this.scaleFactor,
        this.lineColor
      )
      this.requestFrame()

      this.prevX = x
      this.prevY = y
    }
  }

  onGlobalPointerUp = (e: PointerEvent) => {
    if (this.isPointerActive) {
      this.isPointerActive = false
      this.isPointerMoved = false

      const imageData = requireNotNull(this.imageData)
      if (!this.isPointerMoved) {
        const s = this.scaleFactor
        drawLine(
          imageData,
          this.prevX * s,
          this.prevY * s,
          this.prevX * s + 0.01,
          this.prevY * s,
          this.lineWidth * s,
          this.lineColor
        )
        this.requestFrame()
      }
    }
  }

  requestFrame() {
    if (this.isRequestingFrame) return

    this.isRequestingFrame = true
    requestAnimationFrame(() => {
      this.isRequestingFrame = false
      this.renderingContext!!.putImageData(this.imageData!, 0, 0)
    })
  }

  render() {
    return (
      <canvas
        ref={this.canvasRef}
        width={this.props.width * this.scaleFactor}
        height={this.props.height * this.scaleFactor}
        style={{
          border: '1px solid #000',
          width: this.props.width,
          height: this.props.height,
          touchAction: 'none'
        }}
      ></canvas>
    )
  }

  getImageData(): ImageData | null {
    return this.imageData
  }

  clearCanvas() {
    const ctx = requireNotNull(this.renderingContext)
    const imageData = requireNotNull(this.imageData)
    clear(imageData)
    ctx.putImageData(imageData, 0, 0)
  }
}

function requireNotNull<T>(v: T | null | undefined): T {
  if (v == null) throw new Error('null or undefined!')
  return v
}

function drawLine(
  imageData: ImageData,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  lineWidth: number,
  [colorR, colorG, colorB, colorA]: Color
) {
  const { width, height } = imageData
  const w2 = lineWidth / 2
  const w22 = w2 * w2
  const minX = Math.round(Math.max(0, Math.min(x0, x1) - w2 - 1))
  const minY = Math.round(Math.max(0, Math.min(y0, y1) - w2 - 1))
  const maxX = Math.round(Math.min(width - 1, Math.max(x0, x1) + w2 + 1))
  const maxY = Math.round(Math.min(height - 1, Math.max(y0, y1) + w2 + 1))
  const a = y0 - y1
  const b = x1 - x0
  const c = x0 * y1 - x1 * y0
  const a2 = a * a
  const b2 = b * b
  const a2b2 = a2 + b2
  const ab = a * b
  const ac = a * c
  const bc = b * c
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      const x2 = (b2 * x - ab * y - ac) / a2b2
      const y2 = (-ab * x + a2 * y - bc) / a2b2
      const vx0 = x2 - x0
      const vy0 = y2 - y0
      const vx1 = x2 - x1
      const vy1 = y2 - y1
      const vx2 = x1 - x0
      const vy2 = y1 - y0
      const where = vx0 * vx1 + vy0 * vy1 < 0 ? 2 : vx0 * vx2 + vy0 * vy2 < 0 ? 0 : 1
      let fill = false
      switch (where) {
        case 0:
          fill = norm2(x - x0, y - y0) <= w22
          break
        case 1:
          fill = norm2(x - x1, y - y1) <= w22
          break
        case 2:
          fill = norm2(x - x2, y - y2) <= w22
          break
      }
      if (fill) {
        const i = (x + y * width) * 4
        imageData.data[i] = colorR
        imageData.data[i + 1] = colorG
        imageData.data[i + 2] = colorB
        imageData.data[i + 3] = colorA
      }
    }
  }
}

function norm2(x: number, y: number): number {
  return x * x + y * y
}

function clear(imageData: ImageData) {
  imageData.data.fill(255)
}
