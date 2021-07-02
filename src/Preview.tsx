import React, { createRef } from 'react'

type Props = {
  imageData: ImageData
  onClose: () => void
}
export const Preview: React.FC<Props> = ({ imageData, onClose }) => {
  return <PreviewCanvas imageData={imageData} />
}

class PreviewCanvas extends React.Component<{ imageData: ImageData }, {}> {
  private canvasRef = createRef<HTMLCanvasElement>()
  private renderingContext: CanvasRenderingContext2D | null = null
  private width = -1
  private height = -1
  private observerAndElement: [ResizeObserver, HTMLElement] | null = null
  private scaleFactor = 2
  private scale = 0.5
  private imageData: ImageData | null = null

  componentDidMount() {
    this.initCanvas()
  }

  private initCanvas() {
    const e = this.canvasRef.current
    if (e == null) return

    this.imageData = resizeImageData(this.props.imageData, this.scale)

    const { width, height } = e.parentElement!.getBoundingClientRect()
    this.width = e.width = width * this.scaleFactor
    this.height = e.height = height * this.scaleFactor
    e.style.width = `${width}px`
    e.style.height = `${height}px`

    this.renderingContext = e.getContext('2d')

    this.renderToCanvas()

    if (this.observerAndElement != null) {
      const [oldObserver, oldElement] = this.observerAndElement
      oldObserver.unobserve(oldElement)
    }

    const observer = new ResizeObserver(() => {
      const newRect = e.parentElement!.getBoundingClientRect()
      console.log('resize!')
      if (newRect.width !== width || newRect.height !== height) {
        this.width = e.width = newRect.width * this.scaleFactor
        this.height = e.height = newRect.height * this.scaleFactor
        e.style.width = `${newRect.width}px`
        e.style.height = `${newRect.height}px`
        this.renderingContext = e.getContext('2d')
        this.renderToCanvas()
      }
    })
    observer.observe(e.parentElement!)
    this.observerAndElement = [observer, e]
  }

  private renderToCanvas() {
    const ctx = this.renderingContext
    if (ctx == null) return

    const { imageData } = this
    if (imageData == null) return
    const iw = imageData.width
    const ih = imageData.height
    for (let x = 0; x < this.width; x += iw) {
      for (let y = 0; y < this.height; y += ih) {
        ctx.putImageData(imageData, x, y)
      }
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.imageData !== prevProps.imageData) {
      this.imageData = resizeImageData(this.props.imageData, this.scale)
      this.renderToCanvas()
    }
  }

  render() {
    return <canvas ref={this.canvasRef} style={{ display: 'block' }}></canvas>
  }
}

function resizeImageData(imageData: ImageData, scale: number): ImageData {
  const { width, height, data } = imageData
  const newWidth = Math.floor(width * scale)
  const newHeight = Math.floor(height * scale)
  const newData = new Uint8ClampedArray(newWidth * newHeight * 4)
  for (let x = 0; x < newWidth; x++) {
    for (let y = 0; y < newHeight; y++) {
      const i = (x + y * newWidth) * 4
      const oldX = Math.round(x / scale)
      const oldY = Math.round(y / scale)
      const j = (oldX + oldY * width) * 4
      for (let n = 0; n < 4; n++) {
        newData[i + n] = data[j + n]
      }
    }
  }
  return new ImageData(newData, newWidth, newHeight)
}
