'use client'

import { useState } from 'react'

// Чтобы добавить реальное фото/видео Ладоги — положи файлы:
//   public/hero/ladoga-summer.jpg   (фото-обложка)
//   public/hero/ladoga-summer.mp4   (видео-петля)
// Они подхватятся автоматически. Пока используется фото с Unsplash.
const VIDEO_SRC = '/hero/ladoga-summer.mp4'
const LOCAL_IMAGE = '/hero/ladoga-summer.jpg'
// Красивое фото северного озера (озеро Сайма, Финляндия — очень похоже на Ладогу):
// Фото: Республика Карелия, Россия (Владимир Федотов, Unsplash, free license)
const UNSPLASH_IMAGE = 'https://images.unsplash.com/photo-1660488996194-b3dc1a5bfcdc?w=1920&q=85&auto=format&fit=crop'

export default function HeroBackground() {
  const [videoFailed, setVideoFailed] = useState(false)
  // Начинаем сразу с Unsplash, потом заменяем на локальный если он загрузится
  const [imgSrc, setImgSrc] = useState(LOCAL_IMAGE)
  const [imgVisible, setImgVisible] = useState(false)

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700">
      {/* Фото всегда загружаем в фоне */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt="Ладожские шхеры летом"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${imgVisible ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setImgVisible(true)}
        onError={() => {
          if (imgSrc === LOCAL_IMAGE) {
            setImgSrc(UNSPLASH_IMAGE)
          }
        }}
      />
      {/* Видео поверх фото если доступно */}
      {!videoFailed && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={imgSrc}
          onError={() => setVideoFailed(true)}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/75 via-blue-800/65 to-teal-700/55" />
    </div>
  )
}
