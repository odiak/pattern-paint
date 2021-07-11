type Color = [number, number, number, number]

export class VirtualImageData {
  public readonly width: number
  public readonly height: number
  public readonly horizontalSpace: number
  public readonly verticalSpace: number
  public readonly lineWidth: number

  constructor(public readonly imageData: ImageData, scaleFactor: number) {
    this.lineWidth = Math.round(scaleFactor)
    this.horizontalSpace = Math.floor(imageData.width / 2)
    this.verticalSpace = Math.floor(imageData.height / 2)
    this.width = imageData.width + this.lineWidth * 2 + this.horizontalSpace * 2
    this.height = imageData.height + this.lineWidth * 2 + this.verticalSpace * 2
  }

  drawToCanvas(context: CanvasRenderingContext2D): void {
    const {
      imageData,
      horizontalSpace: hSpace,
      verticalSpace: vSpace,
      lineWidth,
      width,
      height
    } = this
    const { width: originalWidth, height: originalHeight } = imageData
    for (let x = -(originalWidth - hSpace); x < width; x += lineWidth + originalWidth) {
      for (let y = -(originalHeight - vSpace); y < height; y += lineWidth + originalHeight) {
        context.putImageData(imageData, x, y)
      }
    }
    context.fillStyle = '#000'
    context.fillRect(0, vSpace, width, lineWidth)
    context.fillRect(0, vSpace + lineWidth + originalHeight, width, lineWidth)
    context.fillRect(hSpace, 0, lineWidth, height)
    context.fillRect(hSpace + lineWidth + originalWidth, 0, lineWidth, height)
  }

  private toIndex(x: number, y: number): number {
    const { horizontalSpace: hSpace, verticalSpace: vSpace, lineWidth, width, height } = this
    const { width: originalWidth, height: originalHeight } = this.imageData
    let trueX: number
    let trueY: number

    const x1 = hSpace
    const x2 = x1 + lineWidth
    const x3 = x2 + originalWidth
    const x4 = x3 + lineWidth
    const restWidth = originalWidth - hSpace

    const y1 = vSpace
    const y2 = y1 + lineWidth
    const y3 = y2 + originalHeight
    const y4 = y3 + lineWidth
    const restHeight = originalHeight - vSpace

    if ((x >= x1 && x < x2) || (x >= x3 && x < x4)) {
      return -1
    }

    if ((y >= y1 && y < y2) || (y >= y3 && y < y4)) {
      return -1
    }

    if (x >= 0 && x < x1) {
      trueX = x + restWidth
    } else if (x >= x2 && x < x3) {
      trueX = x - x2
    } else if (x >= x4 && x < width) {
      trueX = x - x4
    } else {
      throw new Error(`x is out of range: ${x}`)
    }

    if (y >= 0 && y < y1) {
      trueY = y + restHeight
    } else if (y >= y2 && y < y3) {
      trueY = y - y2
    } else if (y >= y4 && y < height) {
      trueY = y - y4
    } else {
      throw new Error(`y is out of range: ${y}`)
    }

    return (trueX + trueY * originalWidth) * 4
  }

  getColorAt(x: number, y: number): Color {
    const i = this.toIndex(x, y)
    if (i === -1) {
      return [-1, -1, -1, -1]
    }
    const { data } = this.imageData
    return [data[i], data[i + 1], data[i + 2], data[i + 3]]
  }

  setColorAt(x: number, y: number, color: Color): void {
    const i = this.toIndex(x, y)
    if (i === -1) return
    const { data } = this.imageData
    data[i] = color[0]
    data[i + 1] = color[1]
    data[i + 2] = color[2]
    data[i + 3] = color[3]
  }
}
