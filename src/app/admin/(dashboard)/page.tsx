'use client'

import { AdminLayout } from '@/components/admin/layout'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Package, ShoppingCart, DollarSign, Users, TrendingUp, Clock } from 'lucide-react'

interface Stats {
  totalOrders: number
  totalRevenue: number
  newOrders: number
  preparingOrders: number
  readyOrders: number
  totalProducts: number
  totalCustomers: number
  recentOrders: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    {
      title: 'طلبات اليوم',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      title: 'إيرادات اليوم',
      value: `${(stats?.totalRevenue || 0).toFixed(2)} ر.س`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'طلبات جديدة',
      value: stats?.newOrders || 0,
      icon: Clock,
      color: 'bg-orange-500',
    },
    {
      title: 'قيد التحضير',
      value: stats?.preparingOrders || 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'جاهزة للتوصيل',
      value: stats?.readyOrders || 0,
      icon: Package,
      color: 'bg-[#581024]',
    },
    {
      title: 'إجمالي العملاء',
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: 'bg-[#D4AF37]',
    },
  ]

  const statusLabels: Record<string, string> = {
    NEW: 'جديد',
    PREPARING: 'قيد التحضير',
    READY: 'جاهز',
    DELIVERED: 'تم التوصيل',
    CANCELED: 'ملغي',
  }

  const statusColors: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-700',
    PREPARING: 'bg-orange-100 text-orange-700',
    READY: 'bg-green-100 text-green-700',
    DELIVERED: 'bg-[#581024]/10 text-[#581024]',
    CANCELED: 'bg-red-100 text-red-700',
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1A050D]">لوحة التحكم</h1>
          <p className="text-[#78716C] mt-1">مرحباً بك في لوحة إدارة برغندي</p>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.title} className="border-[#D6CFC7]">
                <CardContent className="p-4">
                  <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm text-[#78716C]">{card.title}</p>
                  <p className="text-xl font-bold text-[#1A050D] mt-1">{card.value}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* آخر الطلبات */}
        <Card className="border-[#D6CFC7]">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-[#1A050D] mb-4">آخر الطلبات</h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-[#E7E0D8] rounded animate-pulse" />
                ))}
              </div>
            ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#D6CFC7]">
                      <th className="text-right py-3 px-2 font-medium text-[#78716C]">رقم الطلب</th>
                      <th className="text-right py-3 px-2 font-medium text-[#78716C]">العميل</th>
                      <th className="text-right py-3 px-2 font-medium text-[#78716C]">المبلغ</th>
                      <th className="text-right py-3 px-2 font-medium text-[#78716C]">الحالة</th>
                      <th className="text-right py-3 px-2 font-medium text-[#78716C]">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order: any) => (
                      <tr key={order.id} className="border-b border-[#D6CFC7]/50 hover:bg-[#E7E0D8]/30">
                        <td className="py-3 px-2 font-mono text-xs">{order.id.substring(0, 12)}...</td>
                        <td className="py-3 px-2">{order.customer?.name}</td>
                        <td className="py-3 px-2 font-bold text-[#581024]">{order.total.toFixed(2)} ر.س</td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || ''}`}>
                            {statusLabels[order.status] || order.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-[#78716C]">
                          {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[#78716C] text-center py-8">لا توجد طلبات حالياً</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
