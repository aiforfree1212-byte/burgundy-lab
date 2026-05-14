// src/app/api/admin/seed/route.ts
// إنشاء بيانات تجريبية ومستخدم أدمن افتراضي
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hash } from 'bcryptjs'

export async function POST() {
  try {
    // التحقق من وجود أدمن
    const existingAdmin = await db.admin.findFirst()
    if (existingAdmin) {
      return NextResponse.json({ message: 'البيانات التجريبية موجودة بالفعل' })
    }

    // إنشاء أدمن افتراضي
    const hashedPassword = await hash('admin123', 10)
    const admin = await db.admin.create({
      data: {
        email: 'admin@cafe.sa',
        password: hashedPassword,
        role: 'superadmin',
      },
    })

    // إنشاء الأقسام
    const categories = await Promise.all([
      db.category.create({ data: { name: 'مشروبات ساخنة', nameEn: 'Hot Drinks', icon: 'Coffee', order: 1 } }),
      db.category.create({ data: { name: 'مشروبات باردة', nameEn: 'Cold Drinks', icon: 'GlassWater', order: 2 } }),
      db.category.create({ data: { name: 'حلويات', nameEn: 'Desserts', icon: 'Cake', order: 3 } }),
      db.category.create({ data: { name: 'معجنات', nameEn: 'Pastries', icon: 'Croissant', order: 4 } }),
      db.category.create({ data: { name: 'سندويشات', nameEn: 'Sandwiches', icon: 'Sandwich', order: 5 } }),
    ])

    // إنشاء منتجات تجريبية
    const productsData = [
      { name: 'قهوة عربية', description: 'قهوة عربية أصيلة مع هيل', price: 15, categoryId: categories[0].id, isAvailable: true },
      { name: 'كابتشينو', description: 'كابتشينو كلاسيكي برغوة مخملية', price: 22, categoryId: categories[0].id, isAvailable: true },
      { name: 'لاتيه', description: 'لاتيه بنكهة الفانيليا', price: 24, categoryId: categories[0].id, isAvailable: true },
      { name: 'نسكافيه', description: 'نسكافيه على الطريقة التركية', price: 18, categoryId: categories[0].id, isAvailable: true },
      { name: 'شوكولاتة ساخنة', description: 'شوكولاتة ساخنة غنية بالكريمة', price: 20, categoryId: categories[0].id, isAvailable: true },
      { name: 'موهيتو فراولة', description: 'موهيتو بالفراولة الطازجة', price: 25, categoryId: categories[1].id, isAvailable: true },
      { name: 'سموذي مانجو', description: 'سموذي المانجو الاستوائي', price: 28, categoryId: categories[1].id, isAvailable: true },
      { name: 'عصير برتقال طازج', description: 'عصير برتقال طبيعي 100%', price: 18, categoryId: categories[1].id, isAvailable: true },
      { name: 'آيس لاتيه', description: 'لاتيه مثلج منعش', price: 26, categoryId: categories[1].id, isAvailable: true },
      { name: 'كنافة نابلسية', description: 'كنافة بالجبنة طازجة', price: 30, categoryId: categories[2].id, isAvailable: true },
      { name: 'تشيز كيك', description: 'تشيز كيك نيويورك كلاسيك', price: 28, categoryId: categories[2].id, isAvailable: true },
      { name: 'بتي فور', description: 'بتي فور مشكل فاخر', price: 20, categoryId: categories[2].id, isAvailable: true },
      { name: 'تيراميسو', description: 'تيراميسو إيطالي أصلي', price: 32, categoryId: categories[2].id, isAvailable: true },
      { name: 'كرواسون', description: 'كرواسون زبدة طازج', price: 15, categoryId: categories[3].id, isAvailable: true },
      { name: 'فطيرة جبنة', description: 'فطيرة بالجبنة البيضاء', price: 18, categoryId: categories[3].id, isAvailable: true },
      { name: 'بقلاوة', description: 'بقلاوة بالفستق الحلبي', price: 25, categoryId: categories[3].id, isAvailable: true },
      { name: 'سندويش شاورما', description: 'شاورما دجاج طازجة', price: 30, categoryId: categories[4].id, isAvailable: true },
      { name: 'برجر كافيه', description: 'برجر لحم أنقس مع جبنة شيدر', price: 35, categoryId: categories[4].id, isAvailable: true },
      { name: 'كلوب ساندويش', description: 'كلوب ساندويش دجاج وبيض', price: 32, categoryId: categories[4].id, isAvailable: true },
    ]

    await Promise.all(productsData.map((p) => db.product.create({ data: p })))

    // إنشاء بانرات تجريبية
    await db.banner.create({
      data: {
        title: 'عرض الصيف - خصم 20%',
        isActive: true,
      },
    })
    await db.banner.create({
      data: {
        title: 'مشروبات شهر رمضان المبارك',
        isActive: true,
      },
    })

    return NextResponse.json({
      message: 'تم إنشاء البيانات التجريبية بنجاح',
      admin: { email: 'admin@cafe.sa', password: 'admin123' },
      categories: categories.length,
      products: productsData.length,
    })
  } catch (error) {
    console.error('خطأ في إنشاء البيانات التجريبية:', error)
    return NextResponse.json({ error: 'فشل في إنشاء البيانات التجريبية' }, { status: 500 })
  }
}
