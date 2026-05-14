// src/app/api/admin/products/route.ts
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

    const products = await db.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    })

    const productsWithUrls = products.map((p) => ({
      ...p,
      imageUrl: getImageUrl('cafe-products', p.imageKey),
    }))

    return NextResponse.json(productsWithUrls)
  } catch (error) {
    console.error('خطأ في جلب المنتجات:', error)
    return NextResponse.json({ error: 'فشل في جلب المنتجات' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, imageKey, isAvailable, categoryId } = body

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: 'الحقول المطلوبة: الاسم، السعر، القسم' }, { status: 400 })
    }

    const product = await db.product.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        imageKey: imageKey || null,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        categoryId,
      },
      include: { category: true },
    })

    return NextResponse.json({
      ...product,
      imageUrl: getImageUrl('cafe-products', product.imageKey),
    }, { status: 201 })
  } catch (error) {
    console.error('خطأ في إضافة المنتج:', error)
    return NextResponse.json({ error: 'فشل في إضافة المنتج' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, description, price, imageKey, isAvailable, categoryId } = body

    if (!id) {
      return NextResponse.json({ error: 'معرف المنتج مطلوب' }, { status: 400 })
    }

    const product = await db.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(imageKey !== undefined && { imageKey }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(categoryId !== undefined && { categoryId }),
      },
      include: { category: true },
    })

    return NextResponse.json({
      ...product,
      imageUrl: getImageUrl('cafe-products', product.imageKey),
    })
  } catch (error) {
    console.error('خطأ في تعديل المنتج:', error)
    return NextResponse.json({ error: 'فشل في تعديل المنتج' }, { status: 500 })
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
      return NextResponse.json({ error: 'معرف المنتج مطلوب' }, { status: 400 })
    }

    await db.product.delete({ where: { id } })

    return NextResponse.json({ message: 'تم حذف المنتج بنجاح' })
  } catch (error) {
    console.error('خطأ في حذف المنتج:', error)
    return NextResponse.json({ error: 'فشل في حذف المنتج' }, { status: 500 })
  }
}
