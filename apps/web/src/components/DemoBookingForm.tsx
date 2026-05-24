'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'next/navigation'
import { CreateDemoBookingSchema, type CreateDemoBookingInput } from '@amuzic/shared'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export default function DemoBookingForm() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'rate_limited' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateDemoBookingInput>({
    resolver: zodResolver(CreateDemoBookingSchema),
  })

  useEffect(() => {
    const course = searchParams.get('course')
    if (course) {
      setValue('course_interest', course as CreateDemoBookingInput['course_interest'])
    }
  }, [searchParams, setValue])

  async function onSubmit(data: CreateDemoBookingInput) {
    setStatus('loading')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/demos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.status === 429) {
        setStatus('rate_limited')
        return
      }

      if (!res.ok) throw new Error('Request failed')

      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" strokeWidth={1.5} />
        <h3 className="font-heading text-2xl font-semibold text-ink mb-2">You&apos;re In!</h3>
        <p className="font-body text-sm text-ink/55 leading-relaxed max-w-xs mx-auto">
          We&apos;ve received your demo booking. Our team will call you within 24 hours to confirm your slot.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {status === 'rate_limited' && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded p-4">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800 font-body">
            Too many requests. Please wait a few minutes before trying again.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded p-4">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 font-body">
            Something went wrong. Please try again or WhatsApp us directly.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-body font-medium text-ink/60 uppercase tracking-wide mb-1.5">
            Full Name <span className="text-burgundy">*</span>
          </label>
          <input
            {...register('full_name')}
            placeholder="e.g. Priya Sharma"
            className="input-field"
          />
          {errors.full_name && (
            <p className="mt-1 text-xs text-red-600 font-body">{errors.full_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-body font-medium text-ink/60 uppercase tracking-wide mb-1.5">
            Mobile Number <span className="text-burgundy">*</span>
          </label>
          <input
            {...register('phone')}
            placeholder="10-digit mobile number"
            maxLength={10}
            className="input-field"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-600 font-body">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-body font-medium text-ink/60 uppercase tracking-wide mb-1.5">
          Email <span className="text-ink/35">(optional)</span>
        </label>
        <input
          {...register('email')}
          type="email"
          placeholder="you@example.com"
          className="input-field"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-body font-medium text-ink/60 uppercase tracking-wide mb-1.5">
            Course Interest
          </label>
          <select {...register('course_interest')} className="input-field">
            <option value="">Select a course</option>
            <option value="keyboard">Keyboard</option>
            <option value="guitar">Guitar</option>
            <option value="drums">Drums</option>
            <option value="vocals">Vocals</option>
            <option value="unsure">Not sure yet</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-body font-medium text-ink/60 uppercase tracking-wide mb-1.5">
            Student Age Group
          </label>
          <select {...register('student_type')} className="input-field">
            <option value="">Select age group</option>
            <option value="child">Child (5–17)</option>
            <option value="adult">Adult (18–59)</option>
            <option value="senior">Senior (60+)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-body font-medium text-ink/60 uppercase tracking-wide mb-1.5">
            Preferred Date <span className="text-ink/35">(optional)</span>
          </label>
          <input
            {...register('preferred_date')}
            type="date"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-xs font-body font-medium text-ink/60 uppercase tracking-wide mb-1.5">
            Preferred Time <span className="text-ink/35">(optional)</span>
          </label>
          <select {...register('preferred_time')} className="input-field">
            <option value="">Any time</option>
            <option value="morning">Morning (9am–12pm)</option>
            <option value="afternoon">Afternoon (12pm–4pm)</option>
            <option value="evening">Evening (4pm–8pm)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-body font-medium text-ink/60 uppercase tracking-wide mb-1.5">
          Message <span className="text-ink/35">(optional)</span>
        </label>
        <textarea
          {...register('message')}
          placeholder="Any questions or special requests..."
          rows={3}
          maxLength={500}
          className="input-field resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn-primary w-full justify-center py-3.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Submitting...' : 'Book My Free Demo Class'}
      </button>

      <p className="text-xs text-ink/35 text-center font-body">
        By submitting, you agree to be contacted by our team. No spam — ever.
      </p>
    </form>
  )
}
