export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/session'
import { uploadBoatPhoto, isAllowedImageType, MAX_PHOTO_BYTES } from '@/lib/storage'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || (session.role !== 'OWNER' && session.role !== 'ADMIN')) {
    return Response.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) {
    return Response.json({ error: 'Файл не передан' }, { status: 400 })
  }
  if (!isAllowedImageType(file.type)) {
    return Response.json({ error: 'Поддерживаются только JPG, PNG, WEBP' }, { status: 400 })
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return Response.json({ error: 'Файл больше 5 МБ' }, { status: 400 })
  }

  try {
    const url = await uploadBoatPhoto(session.userId, file)
    return Response.json({ url })
  } catch (e) {
    console.error('upload photo failed', e)
    return Response.json({ error: 'Не удалось загрузить фото. Попробуйте позже.' }, { status: 500 })
  }
}
