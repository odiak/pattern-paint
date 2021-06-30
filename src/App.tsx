import React, { useRef, useState } from 'react'
import { Canvas } from './Canvas'
import { Preview } from './Preview'

export const App: React.FC<{}> = () => {
  const ref = useRef<Canvas>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  return (
    <div>
      <div>
        <button
          onClick={() => {
            const imageUrl = ref.current?.exportImage()
            if (imageUrl != null) {
              setImageUrl(imageUrl)
            }
          }}
        >
          preview
        </button>
        <button onClick={() => ref.current?.clearCanvas()}>clear</button>
      </div>
      {imageUrl != null && (
        <Preview
          imageUrl={imageUrl}
          onClose={() => {
            setImageUrl(null)
          }}
        />
      )}
      <Canvas ref={ref} width={300} height={300} />
    </div>
  )
}
