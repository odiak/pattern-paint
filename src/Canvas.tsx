import React, { createRef } from 'react'

type Props = {
  width: number
  height: number
  color: Color
  tool: Tool
}

type State = {}

export type Tool = 'pen' | 'eraser' | 'fill'
export type Color = [number, number, number, number]

export class Canvas extends React.Component<Props, State> {
  private canvasRef = createRef<HTMLCanvasElement>()
  private renderingContext: CanvasRenderingContext2D | null = null

  private scaleFactor = 2
  private lineWidth = 3

  private prevX = -1
  private prevY = -1
  private isPointerActive = false
  private isPointerMoved = false

  private imageData: ImageData

  private isRequestingFrame = false

  constructor(props: Props) {
    super(props)

    this.imageData = new ImageData(
      this.props.width * this.scaleFactor,
      this.props.height * this.scaleFactor
    )
    clear(this.imageData)
  }

  componentDidMount() {
    const e = requireNotNull(this.canvasRef.current)
    const ctx = requireNotNull(e.getContext('2d'))
    this.renderingContext = ctx

    this.requestFrame()

    e.addEventListener('pointerdown', this.onPointerDown)
    e.addEventListener('pointermove', this.onPointerMove)
    e.addEventListener('pointerup', this.onPointerUp)
  }

  onPointerDown = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()

    switch (this.props.tool) {
      case 'pen':
      case 'eraser':
        this.prevX = e.offsetX
        this.prevY = e.offsetY
        this.isPointerActive = true
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        break

      case 'fill':
        fill(
          this.imageData,
          e.offsetX * this.scaleFactor,
          e.offsetY * this.scaleFactor,
          this.props.color
        )
        this.requestFrame()
        break
    }
  }

  onPointerMove = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    IF: if (this.isPointerActive) {
      this.isPointerMoved = true

      let lineWidth: number
      let color: Color
      switch (this.props.tool) {
        case 'fill':
          break IF
        case 'pen':
          lineWidth = this.lineWidth
          color = this.props.color
          break

        case 'eraser':
          lineWidth = this.lineWidth
          color = [255, 255, 255, 255]
          break
      }

      const x = e.offsetX
      const y = e.offsetY
      drawLine(
        this.imageData,
        this.prevX * this.scaleFactor,
        this.prevY * this.scaleFactor,
        x * this.scaleFactor,
        y * this.scaleFactor,
        lineWidth * this.scaleFactor,
        color
      )
      this.requestFrame()

      this.prevX = x
      this.prevY = y
    }
  }

  onPointerUp = (e: PointerEvent) => {
    if (this.isPointerActive) {
      e.preventDefault()
      e.stopPropagation()

      this.isPointerActive = false
      this.isPointerMoved = false

      IF: if (!this.isPointerMoved) {
        const s = this.scaleFactor
        let lineWidth: number
        let color: Color
        switch (this.props.tool) {
          case 'fill':
            break IF
          case 'pen':
            lineWidth = this.lineWidth
            color = this.props.color
            break

          case 'eraser':
            lineWidth = this.lineWidth
            color = [255, 255, 255, 255]
            break
        }
        drawLine(
          this.imageData,
          this.prevX * s,
          this.prevY * s,
          this.prevX * s + 0.01,
          this.prevY * s,
          lineWidth * s,
          color
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
      this.renderingContext!!.putImageData(this.imageData, 0, 0)
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

  getImageData(): ImageData {
    const { data, width, height } = this.imageData
    return new ImageData(data, width, height)
  }

  clearCanvas() {
    const ctx = requireNotNull(this.renderingContext)
    clear(this.imageData)
    ctx.putImageData(this.imageData, 0, 0)
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

function fill(imageData: ImageData, x: number, y: number, color: Color): void {
  const { width, height, data } = imageData
  x = Math.floor(x)
  y = Math.floor(y)
  const isFilled: boolean[] = new Array(width * height).fill(false)
  const colorAtPoint = getColorAt(data, (x + y * width) * 4, true)
  const q: Array<{ x: number; y: number }> = [{ x, y }]
  while (q.length !== 0) {
    const { x, y } = q.shift()!
    const i = x + y * width
    if (isFilled[i]) continue
    const j = i * 4
    if (!isEqualColor(colorAtPoint, getColorAt(data, j))) continue
    data.set(color, j)
    isFilled[i] = true
    if (x > 0) q.push({ x: x - 1, y })
    if (y > 0) q.push({ x, y: y - 1 })
    if (x < width - 1) q.push({ x: x + 1, y })
    if (y < height - 1) q.push({ x, y: y + 1 })
  }
}

function getColorAt(data: Uint8ClampedArray, i: number, copy: boolean = false): Color {
  const color = data.subarray(i, i + 4) as unknown as Color
  return copy ? [...color] : color
}

function isEqualColor(color1: Color, color2: Color): boolean {
  return color1.every((c, i) => c === color2[i])
}
