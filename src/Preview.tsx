import React, { createRef } from 'react'

type Props = {
  imageUrl: string
  onClose: () => void
}
export const Preview: React.FC<Props> = ({ imageUrl, onClose }) => {
  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }}
    >
      <PreviewCanvas imageUrl={imageUrl} />
      <button onClick={onClose} style={{ position: 'absolute' }}>
        close
      </button>
    </div>
  )
}

class PreviewCanvas extends React.Component<{ imageUrl: string }, {}> {
  private canvasRef = createRef<HTMLCanvasElement>()
  private renderingContext: CanvasRenderingContext2D | null = null
  private imagePromise: Promise<HTMLImageElement> | null = null
  private width = -1
  private height = -1
  private observerAndElement: [ResizeObserver, HTMLElement] | null = null
  private scaleFactor = 2
  private scale = 0.2

  componentDidMount() {
    this.initCanvas()
    this.imagePromise = new Promise((resolve) => {
      const image = new Image()
      image.src = this.props.imageUrl
      image.onload = () => {
        resolve(image)
      }
    })
  }

  private initCanvas() {
    const e = this.canvasRef.current
    if (e == null) return

    const rect = e.getBoundingClientRect()
    this.width = e.width = rect.width
    this.height = e.height = rect.height

    this.renderingContext = e.getContext('2d')

    this.renderToCanvas()

    if (this.observerAndElement != null) {
      const [oldObserver, oldElement] = this.observerAndElement
      oldObserver.unobserve(oldElement)
    }

    const observer = new ResizeObserver(() => {
      this.initCanvas()
    })
    observer.observe(e)
    this.observerAndElement = [observer, e]
  }

  private async renderToCanvas() {
    if (this.imagePromise == null) return
    const image = await this.imagePromise

    const ctx = this.renderingContext
    if (ctx == null) return

    const iw = (image.width / this.scaleFactor) * this.scale
    const ih = (image.height / this.scaleFactor) * this.scale
    for (let x = 0; x < this.width; x += iw) {
      for (let y = 0; y < this.height; y += ih) {
        ctx.drawImage(image, x, y, iw, ih)
      }
    }
  }

  render() {
    return (
      <canvas
        ref={this.canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      ></canvas>
    )
  }
}
