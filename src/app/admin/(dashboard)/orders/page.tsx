'use client'

import { AdminLayout } from '@/components/admin/layout'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Eye, Loader2, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  product: { name: string }
}

interface Order {
  id: string
  status: string
  total: number
  notes?: string
  createdAt: string
  updatedAt: string
  customerId: string
  customer: {
    id: string
    name: string
    phone: string
    address: string
    consentGiven: boolean
    consentDate: string
  }
  items: OrderItem[]
}

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [customerDialog, setCustomerDialog] = useState(false)
  const [customerData, setCustomerData] = useState<any>(null)
  const [loadingCustomer, setLoadingCustomer] = useState(false)

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders')
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      })
      if (res.ok) {
        toast.success('تم تحديث حالة الطلب')
        loadOrders()
      }
    } catch {
      toast.error('فشل في تحديث الحالة')
    }
  }

  const handleViewCustomer = async (customerId: string) => {
    setCustomerDialog(true)
    setLoadingCustomer(true)
    try {
      const res = await fetch(`/api/admin/customers?id=${customerId}`)
      const data = await res.json()
      setCustomerData(data)
    } catch {
      toast.error('فشل في جلب بيانات العميل')
    } finally {
      setLoadingCustomer(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1A050D]">إدارة الطلبات</h1>
          <p className="text-[#78716C] mt-1">{orders.length} طلب</p>
        </div>

        <Card className="border-[#D6CFC7]">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#581024]" />
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center text-[#78716C]">لا توجد طلبات حالياً</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#D6CFC7] bg-[#E7E0D8]/30">
                      <th className="text-right py-3 px-4 font-medium text-[#78716C]">رقم الطلب</th>
                      <th className="text-right py-3 px-4 font-medium text-[#78716C]">العميل</th>
                      <th className="text-right py-3 px-4 font-medium text-[#78716C]">عدد الأصناف</th>
                      <th className="text-right py-3 px-4 font-medium text-[#78716C]">المبلغ</th>
                      <th className="text-right py-3 px-4 font-medium text-[#78716C]">الحالة</th>
                      <th className="text-right py-3 px-4 font-medium text-[#78716C]">التاريخ</th>
                      <th className="text-right py-3 px-4 font-medium text-[#78716C]">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-[#D6CFC7]/50 hover:bg-[#E7E0D8]/20">
                        <td className="py-3 px-4 font-mono text-xs">{order.id.substring(0, 12)}...</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-[#1A050D]">{order.customer?.name}</p>
                            <p className="text-xs text-[#78716C]">{order.customer?.phone}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#78716C]">{order.items?.length || 0}</td>
                        <td className="py-3 px-4 font-bold text-[#581024]">{order.total.toFixed(2)} ر.س</td>
                        <td className="py-3 px-4">
                          <Select
                            value={order.status}
                            onValueChange={(v) => handleStatusChange(order.id, v)}
                          >
                            <SelectTrigger className="w-[140px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NEW">جديد</SelectItem>
                              <SelectItem value="PREPARING">قيد التحضير</SelectItem>
                              <SelectItem value="READY">جاهز</SelectItem>
                              <SelectItem value="DELIVERED">تم التوصيل</SelectItem>
                              <SelectItem value="CANCELED">ملغي</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-4 text-[#78716C] text-xs">
                          {new Date(order.createdAt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewCustomer(order.customerId)}
                            className="border-[#581024] text-[#581024] hover:bg-[#581024] hover:text-white"
                          >
                            <Eye className="w-3 h-3 ml-1" />
                            بيانات العميل
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* نافذة بيانات العميل - PDPL */}
        <Dialog open={customerDialog} onOpenChange={setCustomerDialog}>
          <DialogContent className="max-w-md bg-white" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#581024]" />
                بيانات العميل (مشفرة - PDPL)
              </DialogTitle>
            </DialogHeader>
            {loadingCustomer ? (
              <div className="py-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#581024]" />
                <p className="text-sm text-[#78716C] mt-2">جاري فك التشفير...</p>
              </div>
            ) : customerData ? (
              <div className="space-y-4 mt-4">
                <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/30 rounded-lg p-3">
                  <p className="text-xs text-[#581024] font-medium mb-1">⚠️ تنبيه PDPL: تم فك تشفير البيانات الحساسة وتسجيل الوصول في سجل المراجعة</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-[#78716C]">الاسم</p>
                    <p className="font-medium text-[#1A050D]">{customerData.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#78716C]">رقم الجوال</p>
                    <p className="font-medium text-[#1A050D] font-mono" dir="ltr">{customerData.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#78716C]">العنوان</p>
                    <p className="font-medium text-[#1A050D]">{customerData.address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#78716C]">موافقة الخصوصية</p>
                    <Badge className={customerData.consentGiven ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {customerData.consentGiven ? 'موافق' : 'غير موافق'}
                    </Badge>
                  </div>
                  {customerData.consentDate && (
                    <div>
                      <p className="text-xs text-[#78716C]">تاريخ الموافقة</p>
                      <p className="text-sm text-[#1A050D]">{new Date(customerData.consentDate).toLocaleDateString('ar-SA')}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
