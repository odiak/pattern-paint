import React, { useRef, useState } from 'react'
import { Canvas } from './Canvas'
import { Preview } from './Preview'

export const App: React.FC<{}> = () => {
  const ref = useRef<Canvas>(null)
  const [imageData, setImageData] = useState<ImageData | null>(null)

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
      <Canvas ref={ref} width={300} height={300} />
    </div>
  )
}
