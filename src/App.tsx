import React, { useRef, useState } from 'react'
import { RGBColor, SketchPicker } from 'react-color'
import { Canvas, Tool } from './Canvas'
import { Preview } from './Preview'
import styled, { css } from 'styled-components'

const ToolButtonsContainer = styled.div`
  margin: 8px 0;
`

const ToolButton = styled.button<{ selected?: boolean }>`
  border: 1px solid #888;
  background: #eee;
  border-radius: 4px;
  margin-right: 6px;
  padding: 4px 6px;
  ${({ selected }) =>
    selected &&
    css`
      border-color: #333;
      background: #666;
      color: #fff;
    `}
`

export const App: React.FC<{}> = () => {
  const ref = useRef<Canvas>(null)
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [color, setColor] = useState<RGBColor>({ r: 0, g: 0, b: 0 })
  const [tool, setTool] = useState<Tool>('pen')
  const [offset, setOffset] = useState(0)

  return (
    <div style={{ display: 'flex', width: '100%' }}>
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
        <Canvas
          ref={ref}
          width={300}
          height={300}
          color={[color.r, color.g, color.b, Math.floor((color.a ?? 1) * 255)]}
          tool={tool}
        />
        <ToolButtonsContainer>
          {(['pen', 'eraser', 'fill'] as const).map((t) => (
            <ToolButton key={t} selected={tool === t} onClick={() => setTool(t)}>
              {t}
            </ToolButton>
          ))}
        </ToolButtonsContainer>
        <SketchPicker color={color} onChange={(color) => setColor(color.rgb)} />
      </div>
      <div style={{ flex: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={offset}
            onChange={(e) => setOffset(e.target.valueAsNumber)}
          />
        </div>
        {imageData != null && <Preview imageData={imageData} offset={offset} />}
      </div>
    </div>
  )
}
