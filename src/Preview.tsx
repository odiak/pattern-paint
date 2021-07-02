import React, { createRef } from 'react'

type Props = {
  imageData: ImageData
  onClose: () => void
}
export const Preview: React.FC<Props> = ({ imageData, onClose }) => {
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
      <PreviewCanvas imageData={imageData} />
      <button onClick={onClose} style={{ position: 'absolute' }}>
        close
      </button>
    </div>
  )
}

class PreviewCanvas extends React.Component<{ imageData: ImageData }, {}> {
  private canvasRef = createRef<HTMLCanvasElement>()
  private renderingContext: CanvasRenderingContext2D | null = null
  private width = -1
  private height = -1
  private observerAndElement: [ResizeObserver, HTMLElement] | null = null
  private scaleFactor = 2
  private scale = 0.8

  componentDidMount() {
    this.initCanvas()
  }

  private initCanvas() {
    const e = this.canvasRef.current
    if (e == null) return

    const rect = e.getBoundingClientRect()
    this.width = e.width = rect.width * this.scaleFactor
    this.height = e.height = rect.height * this.scaleFactor

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

  private renderToCanvas() {
    const ctx = this.renderingContext
    if (ctx == null) return

    const { imageData } = this.props
    const iw = imageData.width
    const ih = imageData.height
    for (let x = 0; x < this.width; x += iw) {
      for (let y = 0; y < this.height; y += ih) {
        ctx.putImageData(imageData, x, y)
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
