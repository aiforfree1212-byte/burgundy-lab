// src/app/api/admin/banners/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getImageUrl } from '@/lib/upload'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const banners = await db.banner.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const bannersWithUrls = banners.map((b) => ({
      ...b,
      desktopUrl: getImageUrl('cafe-banners', b.imageKeyDesktop),
      mobileUrl: getImageUrl('cafe-banners', b.imageKeyMobile),
    }))

    return NextResponse.json(bannersWithUrls)
  } catch (error) {
    console.error('خطأ في جلب البانرات:', error)
    return NextResponse.json({ error: 'فشل في جلب البانرات' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { title, imageKeyDesktop, imageKeyMobile, link, isActive, startDate, endDate } = body

    if (!title) {
      return NextResponse.json({ error: 'عنوان البانر مطلوب' }, { status: 400 })
    }

    const banner = await db.banner.create({
      data: {
        title,
        imageKeyDesktop: imageKeyDesktop || null,
        imageKeyMobile: imageKeyMobile || null,
        link: link || null,
        isActive: isActive !== undefined ? isActive : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    })

    return NextResponse.json({
      ...banner,
      desktopUrl: getImageUrl('cafe-banners', banner.imageKeyDesktop),
      mobileUrl: getImageUrl('cafe-banners', banner.imageKeyMobile),
    }, { status: 201 })
  } catch (error) {
    console.error('خطأ في إضافة البانر:', error)
    return NextResponse.json({ error: 'فشل في إضافة البانر' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { id, title, imageKeyDesktop, imageKeyMobile, link, isActive, startDate, endDate } = body

    if (!id) {
      return NextResponse.json({ error: 'معرف البانر مطلوب' }, { status: 400 })
    }

    const banner = await db.banner.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(imageKeyDesktop !== undefined && { imageKeyDesktop }),
        ...(imageKeyMobile !== undefined && { imageKeyMobile }),
        ...(link !== undefined && { link }),
        ...(isActive !== undefined && { isActive }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
    })

    return NextResponse.json({
      ...banner,
      desktopUrl: getImageUrl('cafe-banners', banner.imageKeyDesktop),
      mobileUrl: getImageUrl('cafe-banners', banner.imageKeyMobile),
    })
  } catch (error) {
    console.error('خطأ في تعديل البانر:', error)
    return NextResponse.json({ error: 'فشل في تعديل البانر' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'معرف البانر مطلوب' }, { status: 400 })
    }

    await db.banner.delete({ where: { id } })

    return NextResponse.json({ message: 'تم حذف البانر بنجاح' })
  } catch (error) {
    console.error('خطأ في حذف البانر:', error)
    return NextResponse.json({ error: 'فشل في حذف البانر' }, { status: 500 })
  }
}
