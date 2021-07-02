import React, { useRef, useState } from 'react'
import { RGBColor, SketchPicker } from 'react-color'
import { Canvas, Tool } from './Canvas'
import { Preview } from './Preview'

export const App: React.FC<{}> = () => {
  const ref = useRef<Canvas>(null)
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [color, setColor] = useState<RGBColor>({ r: 0, g: 0, b: 0 })
  const [tool, setTool] = useState<Tool>('pen')

  return (
    <div>
      <div>
        <button
          onClick={() => {
            const imageData = ref.current?.getImageData()
            if (imageData != null) {
              setImageData(imageData)
            }
          }}
        >
          preview
        </button>
        <button onClick={() => ref.current?.clearCanvas()}>clear</button>
      </div>
      {imageData != null && (
        <Preview
          imageData={imageData}
          onClose={() => {
            setImageData(null)
          }}
        />
      )}
      <Canvas
        ref={ref}
        width={300}
        height={300}
        color={[color.r, color.g, color.b, Math.floor((color.a ?? 1) * 255)]}
        tool={tool}
      />
      <select value={tool} onChange={(e) => setTool(e.target.value as Tool)}>
        {(['pen', 'eraser', 'fill'] as const).map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <SketchPicker color={color} onChange={(color) => setColor(color.rgb)} />
    </div>
  )
}
