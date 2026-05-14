'use client'

import { AdminLayout } from '@/components/admin/layout'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Pencil, Trash2, Upload, Coffee, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  description?: string
  price: number
  imageKey?: string
  imageUrl: string
  isAvailable: boolean
  categoryId: string
  category: Category
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    imageKey: '',
    isAvailable: true,
    categoryId: '',
  })

  const loadData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/categories'),
      ])
      const prodData = await prodRes.json()
      const catData = await catRes.json()
      setProducts(Array.isArray(prodData) ? prodData : [])
      setCategories(Array.isArray(catData) ? catData : [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'cafe-products')

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (res.ok) {
        setForm({ ...form, imageKey: data.key })
        toast.success('تم رفع الصورة بنجاح')
      } else {
        toast.error('فشل رفع الصورة')
      }
    } catch {
      toast.error('خطأ في رفع الصورة')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.name || !form.price || !form.categoryId) {
      toast.error('يرجى تعبئة الحقول المطلوبة')
      return
    }

    setSaving(true)
    try {
      const url = editingProduct ? '/api/admin/products' : '/api/admin/products'
      const method = editingProduct ? 'PUT' : 'POST'
      const body = editingProduct
        ? { id: editingProduct.id, ...form }
        : form

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast.success(editingProduct ? 'تم تعديل المنتج بنجاح' : 'تم إضافة المنتج بنجاح')
        setDialogOpen(false)
        setEditingProduct(null)
        setForm({ name: '', description: '', price: '', imageKey: '', isAvailable: true, categoryId: '' })
        loadData()
      } else {
        toast.error('فشل في حفظ المنتج')
      }
    } catch {
      toast.error('خطأ في الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      imageKey: product.imageKey || '',
      isAvailable: product.isAvailable,
      categoryId: product.categoryId,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('تم حذف المنتج')
        loadData()
      }
    } catch {
      toast.error('فشل في الحذف')
    }
  }

  const handleToggleAvailability = async (product: Product) => {
    try {
      await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, isAvailable: !product.isAvailable }),
      })
      loadData()
    } catch {
      toast.error('فشل في التحديث')
    }
  }

  const openNewDialog = () => {
    setEditingProduct(null)
    setForm({ name: '', description: '', price: '', imageKey: '', isAvailable: true, categoryId: '' })
    setDialogOpen(true)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1A050D]">إدارة المنتجات</h1>
            <p className="text-[#78716C] mt-1">{products.length} منتج</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog} className="bg-[#581024] hover:bg-[#3A0A1A] text-white">
                <Plus className="w-4 h-4 ml-1" />
                إضافة منتج
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-white" dir="rtl">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>اسم المنتج *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="border-[#D6CFC7]"
                    placeholder="مثال: قهوة عربية"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الوصف</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="border-[#D6CFC7]"
                    placeholder="وصف المنتج"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>السعر (ر.س) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="border-[#D6CFC7]"
                      placeholder="0.00"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>القسم *</Label>
                    <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                      <SelectTrigger className="border-[#D6CFC7]">
                        <SelectValue placeholder="اختر القسم" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>صورة المنتج</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('product-image')?.click()}
                      className="border-[#D6CFC7]"
                      disabled={uploading}
                    >
                      {uploading ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Upload className="w-4 h-4 ml-1" />}
                      {uploading ? 'جاري الرفع...' : 'رفع صورة'}
                    </Button>
                    <input
                      id="product-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    {form.imageKey && (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-700">تم الرفع</Badge>
                        <Button size="icon" variant="ghost" onClick={() => setForm({ ...form, imageKey: '' })}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.isAvailable}
                    onCheckedChange={(v) => setForm({ ...form, isAvailable: v })}
                  />
                  <Label>متاح للبيع</Label>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave} disabled={saving} className="flex-1 bg-[#581024] hover:bg-[#3A0A1A] text-white">
                    {saving ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : null}
                    {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
                  </Button>
                  <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-[#D6CFC7]">
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* جدول المنتجات */}
        <Card className="border-[#D6CFC7]">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#581024]" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#D6CFC7] bg-[#E7E0D8]/30">
                      <th className="text-right py-3 px-4 font-medium text-[#78716C]">المنتج</th>
                      <th className="text-right py-3 px-4 font-medium text-[#78716C]">القسم</th>
                      <th className="text-right py-3 px-4 font-medium text-[#78716C]">السعر</th>
                      <th className="text-right py-3 px-4 font-medium text-[#78716C]">الحالة</th>
                      <th className="text-right py-3 px-4 font-medium text-[#78716C]">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-[#D6CFC7]/50 hover:bg-[#E7E0D8]/20">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#E7E0D8] overflow-hidden flex-shrink-0">
                              {product.imageUrl && product.imageUrl !== '/placeholder.jpg' ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Coffee className="w-5 h-5 text-[#581024]/30" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-[#1A050D]">{product.name}</p>
                              {product.description && (
                                <p className="text-xs text-[#78716C] truncate max-w-[200px]">{product.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#78716C]">{product.category?.name}</td>
                        <td className="py-3 px-4 font-bold text-[#581024]">{product.price} ر.س</td>
                        <td className="py-3 px-4">
                          <button onClick={() => handleToggleAvailability(product)}>
                            <Badge className={product.isAvailable ? 'bg-green-100 text-green-700 cursor-pointer' : 'bg-red-100 text-red-700 cursor-pointer'}>
                              {product.isAvailable ? 'متاح' : 'غير متاح'}
                            </Badge>
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" onClick={() => handleEdit(product)} className="text-[#78716C] hover:text-[#581024]">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(product.id)} className="text-[#78716C] hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
