import 'server-only'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'node:crypto'

/**
 * Загрузка фото катеров в Yandex Object Storage (S3-совместимое API).
 * Бакет должен быть публичным на чтение (ACL public-read или bucket policy),
 * чтобы готовая ссылка сразу открывалась в <img src>.
 */

let _client: S3Client | undefined

function getClient(): S3Client {
  if (!_client) {
    _client = new S3Client({
      region: 'ru-central1',
      endpoint: process.env.YC_S3_ENDPOINT || 'https://storage.yandexcloud.net',
      credentials: {
        accessKeyId: process.env.YC_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.YC_S3_SECRET_ACCESS_KEY!,
      },
    })
  }
  return _client
}

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024 // 5 МБ
export const MAX_PHOTOS_PER_BOAT = 5

export function isAllowedImageType(contentType: string): boolean {
  return contentType in ALLOWED_TYPES
}

export async function uploadBoatPhoto(ownerId: string, file: File): Promise<string> {
  const bucket = process.env.YC_S3_BUCKET
  if (!bucket) throw new Error('YC_S3_BUCKET не задан')

  const ext = ALLOWED_TYPES[file.type]
  if (!ext) throw new Error('Неподдерживаемый тип файла')
  if (file.size > MAX_PHOTO_BYTES) throw new Error('Файл больше 5 МБ')

  const key = `boats/${ownerId}/${randomUUID()}.${ext}`
  const bytes = new Uint8Array(await file.arrayBuffer())

  await getClient().send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: bytes,
    ContentType: file.type,
    ACL: 'public-read',
  }))

  const publicBase = process.env.YC_S3_PUBLIC_URL || `https://${bucket}.storage.yandexcloud.net`
  return `${publicBase}/${key}`
}
