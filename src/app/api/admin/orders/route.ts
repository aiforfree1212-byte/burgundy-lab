// src/app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { decryptData } from '@/lib/crypto'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const orders = await db.order.findMany({
      include: {
        customer: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // لا يتم فك تشفير بيانات العميل هنا - فقط عند الطلب الصريح
    const safeOrders = orders.map((order) => ({
      ...order,
      customer: {
        id: order.customer.id,
        name: order.customer.name,
        phone: '[مشفر]', // PDPL - لا يتم عرض البيانات المشفرة في القائمة
        address: '[مشفر]',
        consentGiven: order.customer.consentGiven,
        consentDate: order.customer.consentDate,
      },
    }))

    return NextResponse.json(safeOrders)
  } catch (error) {
    console.error('خطأ في جلب الطلبات:', error)
    return NextResponse.json({ error: 'فشل في جلب الطلبات' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'معرف الطلب والحالة مطلوبان' }, { status: 400 })
    }

    const validStatuses = ['NEW', 'PREPARING', 'READY', 'DELIVERED', 'CANCELED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'حالة غير صالحة' }, { status: 400 })
    }

    const order = await db.order.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('خطأ في تحديث الطلب:', error)
    return NextResponse.json({ error: 'فشل في تحديث الطلب' }, { status: 500 })
  }
}
