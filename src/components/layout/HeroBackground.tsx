'use client'

import { useState } from 'react'

// Drop real footage/photos here and the gradient fallback below disappears automatically:
//   public/hero/ladoga-summer.mp4   (short looping summer clip of the skerries/bays)
//   public/hero/ladoga-summer.jpg   (poster frame / fallback photo, same scene)
const VIDEO_SRC = '/hero/ladoga-summer.mp4'
const IMAGE_SRC = '/hero/ladoga-summer.jpg'

export default function HeroBackground() {
  const [videoFailed, setVideoFailed] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700">
      {!videoFailed && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={IMAGE_SRC}
          onError={() => setVideoFailed(true)}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      )}
      {videoFailed && !imageFailed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={IMAGE_SRC}
          alt="Ладожские шхеры летом"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/75 via-blue-800/65 to-teal-700/55" />
    </div>
  )
}
