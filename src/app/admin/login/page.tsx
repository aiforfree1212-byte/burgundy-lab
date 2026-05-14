'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Lock, Mail } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      } else {
        router.push('/admin')
        toast.success('تم تسجيل الدخول بنجاح')
      }
    } catch (error) {
      toast.error('حدث خطأ في تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1A050D] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* الشعار */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center mb-4">
            <span className="text-4xl font-bold text-[#FBF7F4] leading-tight">برغندي</span>
            <span className="text-xs font-medium tracking-[0.3em] text-[#FBF7F4]/60 leading-tight mt-1">BURGUNDY LAB</span>
          </div>
          <h1 className="text-2xl font-bold text-[#D4AF37]">لوحة الإدارة</h1>
          <p className="text-[#F5F0EB]/60 mt-2">سجّل دخولك لإدارة برغندي</p>
        </div>

        {/* نموذج تسجيل الدخول */}
        <Card className="bg-[#3A0A1A] border-[#4A1525]">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#F5F0EB]">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#78716C]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@burgundy.sa"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-10 bg-[#1A050D] border-[#4A1525] text-[#F5F0EB] placeholder:text-[#78716C] focus:border-[#D4AF37]"
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#F5F0EB]">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#78716C]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 bg-[#1A050D] border-[#4A1525] text-[#F5F0EB] placeholder:text-[#78716C] focus:border-[#D4AF37]"
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#D4AF37] text-[#1A050D] hover:bg-[#B8941F] font-bold py-6 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  'تسجيل الدخول'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-[#78716C] text-sm mt-6">
          البيانات الافتراضية: admin@cafe.sa / admin123
        </p>
      </div>
    </div>
  )
}
