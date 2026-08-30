import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Scissors, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { authApi } from '../api'
import { setCredentials } from '../store/slices/authSlice'

const BUSINESS_TYPES = [
  'Handmade Crafts', 'Bakery', 'Candle Making', 'Jewelry',
  'Crochet & Knitting', 'Custom Gifts', 'Pottery', 'Art & Prints',
  'Soap Making', 'Home Decor', 'Fashion & Accessories', 'Other'
]

interface RegisterForm {
  businessName: string
  businessType: string
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showPwd, setShowPwd] = useState(false)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterForm>()
  const password = watch('password')

  async function onSubmit(data: RegisterForm) {
    try {
      const res = await authApi.register({
        businessName: data.businessName,
        businessType: data.businessType,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      })
      dispatch(setCredentials(res.data))
      toast.success('Business registered! Welcome to CraftFlow 🎉')
      navigate('/')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 items-center justify-center mb-4 shadow-lg">
            <Scissors size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Start your free workspace</h1>
          <p className="text-gray-500 mt-1">Join thousands of home-based businesses on CraftFlow</p>
        </div>

        {/* Benefits */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {['Order Management','Inventory Tracking','Production Kanban','Customer CRM'].map(b => (
            <div key={b} className="flex items-center gap-1.5 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-full border border-gray-200">
              <CheckCircle2 size={14} className="text-green-500" />
              {b}
            </div>
          ))}
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="label">Business Name *</label>
                <input {...register('businessName', { required: 'Required', minLength: { value: 2, message: 'Too short' } })}
                  className="input" placeholder="e.g. Priya's Candle Studio" />
                {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName.message}</p>}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="label">Business Type</label>
                <select {...register('businessType')} className="input">
                  <option value="">Select type...</option>
                  {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">First Name *</label>
                <input {...register('firstName', { required: 'Required' })} className="input" placeholder="Priya" />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input {...register('lastName', { required: 'Required' })} className="input" placeholder="Sharma" />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
              <div>
                <label className="label">Email *</label>
                <input {...register('email', { required: 'Required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid' } })}
                  type="email" className="input" placeholder="priya@example.com" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="label">Phone</label>
                <input {...register('phone')} className="input" placeholder="+91 9876543210" />
              </div>
              <div>
                <label className="label">Password *</label>
                <div className="relative">
                  <input {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })}
                    type={showPwd ? 'text' : 'password'} className="input pr-10" placeholder="Min 8 characters" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="label">Confirm Password *</label>
                <input {...register('confirmPassword', {
                  required: 'Required',
                  validate: v => v === password || 'Passwords do not match'
                })} type="password" className="input" placeholder="Repeat password" />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <button type="submit" disabled={isSubmitting}
              className="btn-primary w-full justify-center py-3 text-base mt-2">
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Create My Workspace — Free'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
