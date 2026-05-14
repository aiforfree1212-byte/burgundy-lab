// src/app/api/admin/customers/route.ts
// فك تشفير بيانات العميل الحساسة - PDPL
// يتم تسجيل كل وصول في سجل المراجعة (Audit Log)
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { decryptData } from '@/lib/crypto'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('id')

    if (!customerId) {
      return NextResponse.json({ error: 'معرف العميل مطلوب' }, { status: 400 })
    }

    const customer = await db.customer.findUnique({
      where: { id: customerId },
    })

    if (!customer) {
      return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })
    }

    // فك تشفير البيانات الحساسة - PDPL
    const decryptedPhone = decryptData(customer.phone)
    const decryptedAddress = decryptData(customer.address)

    // تسجيل الوصول في سجل المراجعة - Audit Log
    await db.auditLog.create({
      data: {
        adminId: (session.user as any).id || 'unknown',
        action: `عرض بيانات عميل حساسة - فك تشفير - العميل: ${customerId}`,
        details: `الاسم: ${customer.name} - تم فك تشفير رقم الجوال والعنوان`,
      },
    })

    return NextResponse.json({
      id: customer.id,
      name: customer.name,
      phone: decryptedPhone,
      address: decryptedAddress,
      consentGiven: customer.consentGiven,
      consentDate: customer.consentDate,
    })
  } catch (error) {
    console.error('خطأ في جلب بيانات العميل:', error)
    return NextResponse.json({ error: 'فشل في جلب بيانات العميل' }, { status: 500 })
  }
}
