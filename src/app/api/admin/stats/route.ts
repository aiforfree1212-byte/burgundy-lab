// src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // إحصائيات اليوم
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayOrders = await db.order.findMany({
      where: { createdAt: { gte: today } },
    })

    const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = todayOrders.length

    // الطلبات حسب الحالة
    const newOrders = todayOrders.filter((o) => o.status === 'NEW').length
    const preparingOrders = todayOrders.filter((o) => o.status === 'PREPARING').length
    const readyOrders = todayOrders.filter((o) => o.status === 'READY').length

    // آخر 5 طلبات
    const recentOrders = await db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true } },
        items: { select: { quantity: true } },
      },
    })

    const totalProducts = await db.product.count()
    const totalCustomers = await db.customer.count()

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      newOrders,
      preparingOrders,
      readyOrders,
      totalProducts,
      totalCustomers,
      recentOrders,
    })
  } catch (error) {
    console.error('خطأ في جلب الإحصائيات:', error)
    return NextResponse.json({ error: 'فشل في جلب الإحصائيات' }, { status: 500 })
  }
}
