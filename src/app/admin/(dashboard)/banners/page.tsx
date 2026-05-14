'use client'

import { AdminLayout } from '@/components/admin/layout'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Upload, ImageIcon, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Banner {
  id: string
  title: string
  imageKeyDesktop?: string
  imageKeyMobile?: string
  desktopUrl: string
  mobileUrl: string
  link?: string
  isActive: boolean
  startDate?: string
  endDate?: string
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [uploading, setUploading] = useState<'desktop' | 'mobile' | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    imageKeyDesktop: '',
    imageKeyMobile: '',
    link: '',
    isActive: true,
    startDate: '',
    endDate: '',
  })

  const loadBanners = async () => {
    try {
      const res = await fetch('/api/admin/banners')
      const data = await res.json()
      setBanners(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBanners()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(type)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'cafe-banners')

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (res.ok) {
        if (type === 'desktop') {
          setForm({ ...form, imageKeyDesktop: data.key })
        } else {
          setForm({ ...form, imageKeyMobile: data.key })
        }
        toast.success('تم رفع الصورة بنجاح')
      } else {
        toast.error('فشل رفع الصورة')
      }
    } catch {
      toast.error('خطأ في رفع الصورة')
    } finally {
      setUploading(null)
    }
  }

  const handleSave = async () => {
    if (!form.title) {
      toast.error('يرجى إدخال عنوان البانر')
      return
    }

    setSaving(true)
    try {
      const body = editingBanner
        ? {
            id: editingBanner.id,
            ...form,
            startDate: form.startDate || null,
            endDate: form.endDate || null,
          }
        : {
            ...form,
            startDate: form.startDate || null,
            endDate: form.endDate || null,
          }

      const res = await fetch('/api/admin/banners', {
        method: editingBanner ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast.success(editingBanner ? 'تم تعديل البانر بنجاح' : 'تم إضافة البانر بنجاح')
        setDialogOpen(false)
        setEditingBanner(null)
        setForm({ title: '', imageKeyDesktop: '', imageKeyMobile: '', link: '', isActive: true, startDate: '', endDate: '' })
        loadBanners()
      } else {
        toast.error('فشل في حفظ البانر')
      }
    } catch {
      toast.error('خطأ في الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setForm({
      title: banner.title,
      imageKeyDesktop: banner.imageKeyDesktop || '',
      imageKeyMobile: banner.imageKeyMobile || '',
      link: banner.link || '',
      isActive: banner.isActive,
      startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
      endDate: banner.endDate ? banner.endDate.split('T')[0] : '',
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا البانر؟')) return
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('تم حذف البانر')
        loadBanners()
      }
    } catch {
      toast.error('فشل في الحذف')
    }
  }

  const openNewDialog = () => {
    setEditingBanner(null)
    setForm({ title: '', imageKeyDesktop: '', imageKeyMobile: '', link: '', isActive: true, startDate: '', endDate: '' })
    setDialogOpen(true)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1A050D]">إدارة البانرات</h1>
            <p className="text-[#78716C] mt-1">{banners.length} بانر</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog} className="bg-[#581024] hover:bg-[#3A0A1A] text-white">
                <Plus className="w-4 h-4 ml-1" />
                إضافة بانر
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-white" dir="rtl">
              <DialogHeader>
                <DialogTitle>{editingBanner ? 'تعديل البانر' : 'إضافة بانر جديد'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>عنوان البانر *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="border-[#D6CFC7]"
                    placeholder="مثال: عرض الصيف"
                  />
                </div>
                <div className="space-y-2">
                  <Label>رابط (اختياري)</Label>
                  <Input
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    className="border-[#D6CFC7]"
                    placeholder="/menu"
                    dir="ltr"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>صورة الديسكتوب</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('banner-desktop')?.click()}
                      className="w-full border-[#D6CFC7]"
                      disabled={uploading === 'desktop'}
                    >
                      {uploading === 'desktop' ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Upload className="w-4 h-4 ml-1" />}
                      {form.imageKeyDesktop ? 'تغيير' : 'رفع'}
                    </Button>
                    <input id="banner-desktop" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'desktop')} />
                    {form.imageKeyDesktop && <Badge className="bg-green-100 text-green-700 text-xs">تم الرفع</Badge>}
                  </div>
                  <div className="space-y-2">
                    <Label>صورة الجوال</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('banner-mobile')?.click()}
                      className="w-full border-[#D6CFC7]"
                      disabled={uploading === 'mobile'}
                    >
                      {uploading === 'mobile' ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Upload className="w-4 h-4 ml-1" />}
                      {form.imageKeyMobile ? 'تغيير' : 'رفع'}
                    </Button>
                    <input id="banner-mobile" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'mobile')} />
                    {form.imageKeyMobile && <Badge className="bg-green-100 text-green-700 text-xs">تم الرفع</Badge>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>تاريخ البداية</Label>
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="border-[#D6CFC7]"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>تاريخ الانتهاء</Label>
                    <Input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="border-[#D6CFC7]"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                  />
                  <Label>نشط</Label>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave} disabled={saving} className="flex-1 bg-[#581024] hover:bg-[#3A0A1A] text-white">
                    {saving ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : null}
                    {editingBanner ? 'حفظ التعديلات' : 'إضافة البانر'}
                  </Button>
                  <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-[#D6CFC7]">
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* قائمة البانرات */}
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#581024]" />
          </div>
        ) : banners.length === 0 ? (
          <Card className="border-[#D6CFC7]">
            <CardContent className="p-12 text-center">
              <ImageIcon className="w-16 h-16 text-[#581024]/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[#1A050D] mb-2">لا توجد بانرات</h3>
              <p className="text-[#78716C]">أضف بانرات لعرضها في الصفحة الرئيسية</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((banner) => (
              <Card key={banner.id} className="border-[#D6CFC7] overflow-hidden">
                <div className="h-40 bg-[#E7E0D8] relative">
                  {banner.desktopUrl && banner.desktopUrl !== '/placeholder.jpg' ? (
                    <img src={banner.desktopUrl} alt={banner.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-[#581024]/30" />
                    </div>
                  )}
                  <Badge className={`absolute top-2 left-2 ${banner.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {banner.isActive ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-[#1A050D] mb-2">{banner.title}</h3>
                  {banner.link && <p className="text-xs text-[#78716C] mb-2">الرابط: {banner.link}</p>}
                  <div className="flex items-center gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(banner)} className="border-[#D6CFC7]">
                      <Pencil className="w-3 h-3 ml-1" />
                      تعديل
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(banner.id)} className="border-red-200 text-red-600 hover:bg-red-50">
                      <Trash2 className="w-3 h-3 ml-1" />
                      حذف
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
