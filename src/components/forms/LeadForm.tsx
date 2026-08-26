'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle } from 'lucide-react';
import { publicApi } from '@/lib/api';

const leadSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(7, 'Valid phone required'),
  email: z.string().email('Valid email required'),
  preferredContact: z.string().optional(),
  creditSituation: z.string().optional(),
  vehiclePreference: z.string().optional(),
  province: z.string().optional(),
  consent: z.boolean().refine((v) => v, 'Consent is required'),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormProps {
  variant?: 'hero' | 'compact' | 'full';
  sourcePage?: string;
  consentText?: string;
}

export function LeadForm({ variant = 'compact', sourcePage = '/', consentText }: LeadFormProps) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  });

  const onSubmit = async (data: LeadFormData) => {
    setError('');
    try {
      await publicApi.submitApplication({
        ...data,
        submissionType: 'application',
        sourcePage,
      });
      setSuccess(true);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
        <h3 className="font-display text-2xl text-white mb-2">Application Received</h3>
        <p className="text-ice-blue">We will contact you shortly to discuss your options.</p>
      </div>
    );
  }

  const isHero = variant === 'hero';
  const isFull = variant === 'full';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`${isHero ? 'bg-white/10 backdrop-blur-md border border-white/20 p-6 md:p-8 rounded-lg' : 'bg-white p-6 md:p-8 rounded-lg shadow-xl'}`}>
      <h3 className={`font-display text-xl md:text-2xl font-bold mb-6 ${isHero ? 'text-white' : 'text-midnight'}`}>
        Start Your Application
      </h3>

      <div className={`grid gap-4 ${isFull ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
        <div>
          <label className={`label-field ${isHero ? 'text-ice-blue' : ''}`}>Full Name *</label>
          <input {...register('name')} className="input-field" placeholder="Your full name" />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className={`label-field ${isHero ? 'text-ice-blue' : ''}`}>Phone *</label>
          <input {...register('phone')} className="input-field" placeholder="(416) 555-0123" />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
        </div>
        <div>
          <label className={`label-field ${isHero ? 'text-ice-blue' : ''}`}>Email *</label>
          <input {...register('email')} type="email" className="input-field" placeholder="you@email.com" />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className={`label-field ${isHero ? 'text-ice-blue' : ''}`}>Preferred Contact</label>
          <select {...register('preferredContact')} className="input-field">
            <option value="">Select...</option>
            <option value="phone">Phone</option>
            <option value="email">Email</option>
            <option value="text">Text Message</option>
          </select>
        </div>
        <div>
          <label className={`label-field ${isHero ? 'text-ice-blue' : ''}`}>Credit Situation</label>
          <select {...register('creditSituation')} className="input-field">
            <option value="">Select...</option>
            <option value="bad-credit">Bad Credit</option>
            <option value="no-credit">No Credit</option>
            <option value="bankruptcy">Bankruptcy</option>
            <option value="consumer-proposal">Consumer Proposal</option>
            <option value="self-employed">Self-Employed</option>
            <option value="newcomer">New to Canada</option>
            <option value="previous-denial">Previous Denial</option>
          </select>
        </div>
        <div>
          <label className={`label-field ${isHero ? 'text-ice-blue' : ''}`}>Vehicle Type</label>
          <select {...register('vehiclePreference')} className="input-field">
            <option value="">Select...</option>
            <option value="suv">SUV</option>
            <option value="sedan">Sedan</option>
            <option value="truck">Truck</option>
            <option value="van">Van</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className={`label-field ${isHero ? 'text-ice-blue' : ''}`}>Province</label>
          <select {...register('province')} className="input-field">
            <option value="">Select...</option>
            <option value="ON">Ontario</option>
            <option value="BC">British Columbia</option>
            <option value="AB">Alberta</option>
            <option value="QC">Quebec</option>
            <option value="MB">Manitoba</option>
            <option value="SK">Saskatchewan</option>
            <option value="NS">Nova Scotia</option>
            <option value="NB">New Brunswick</option>
            <option value="NL">Newfoundland</option>
            <option value="PE">PEI</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" {...register('consent')} className="mt-1 accent-electric" />
          <span className={`text-sm ${isHero ? 'text-ice-blue' : 'text-gray-600'}`}>
            {consentText || 'I consent to being contacted about vehicle financing options. Approval is subject to lender criteria.'}
          </span>
        </label>
        {errors.consent && <p className="text-red-500 text-sm mt-1">{errors.consent.message}</p>}
      </div>

      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-6">
        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Application'}
      </button>

      <p className={`text-xs mt-3 ${isHero ? 'text-white/50' : 'text-gray-400'}`}>
        Approval, rates and terms are subject to lender criteria. We do not guarantee approval.
      </p>
    </form>
  );
}
