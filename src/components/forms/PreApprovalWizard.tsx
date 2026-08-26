'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, ChevronRight, ChevronLeft, Loader2, Check,
  Car, Truck, Users, Gauge,
} from 'lucide-react';
import { publicApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { ApprovalHeroLogo } from '@/components/brand/ApprovalHeroLogo';

const VEHICLE_TYPES = [
  { id: 'sedan', label: 'Sedans', icon: Car, image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400' },
  { id: 'suv', label: 'SUVs / Crossovers', icon: Users, image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400' },
  { id: 'truck', label: 'Trucks', icon: Truck, image: 'https://images.unsplash.com/photo-1533473359331-30c20e68572a?w=400' },
  { id: 'coupe', label: 'Coupes', icon: Gauge, image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400' },
  { id: 'hatchback', label: 'Hatchbacks', icon: Car, image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400' },
  { id: 'minivan', label: 'Minivans', icon: Users, image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400' },
];

const STEPS = [
  { id: 1, label: 'Vehicle Type' },
  { id: 2, label: 'Contact Info' },
  { id: 3, label: 'Address' },
  { id: 4, label: 'Employment' },
  { id: 5, label: 'Review & Submit' },
];

const PROVINCES = ['ON', 'BC', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE'];

export interface ApplicationData {
  vehicleType: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  timeAtAddress: string;
  housingStatus: string;
  dateOfBirth: string;
  employmentStatus: string;
  employerName: string;
  occupation: string;
  monthlyIncome: string;
  isEmployed: boolean;
  creditSituation: string;
  consent: boolean;
}

const initialData: ApplicationData = {
  vehicleType: '',
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  province: 'ON',
  postalCode: '',
  timeAtAddress: '',
  housingStatus: '',
  dateOfBirth: '',
  employmentStatus: '',
  employerName: '',
  occupation: '',
  monthlyIncome: '',
  isEmployed: true,
  creditSituation: '',
  consent: false,
};

const WHAT_HAPPENS_NEXT = [
  'Our team reviews your application and matches you with dealer and lending partners.',
  'A financing specialist contacts you within one business day to discuss options.',
  'You explore available vehicles and financing terms that may fit your situation.',
  'Complete any required documentation with your selected partner.',
];

interface PreApprovalWizardProps {
  consentText?: string;
  businessName?: string;
}

export function PreApprovalWizard({ consentText, businessName = 'Approval Hero' }: PreApprovalWizardProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ApplicationData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const progress = step === 0 ? 0 : Math.round((step / STEPS.length) * 100);
  const currentStep = STEPS[step - 1];

  const update = useCallback((field: keyof ApplicationData, value: string | boolean) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 1 && !data.vehicleType) e.vehicleType = 'Please select a vehicle type';
    if (s === 2) {
      if (!data.firstName.trim()) e.firstName = 'Required';
      if (!data.lastName.trim()) e.lastName = 'Required';
      if (!data.phone.trim() || data.phone.length < 7) e.phone = 'Valid phone required';
      if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email)) e.email = 'Valid email required';
    }
    if (s === 3) {
      if (!data.address.trim()) e.address = 'Required';
      if (!data.city.trim()) e.city = 'Required';
      if (!data.postalCode.trim()) e.postalCode = 'Required';
    }
    if (s === 4) {
      if (!data.employmentStatus) e.employmentStatus = 'Required';
      if (data.isEmployed && !data.employerName.trim()) e.employerName = 'Required';
      if (!data.monthlyIncome.trim()) e.monthlyIncome = 'Required';
    }
    if (s === 5) {
      if (!data.creditSituation) e.creditSituation = 'Please select your credit situation';
      if (!data.consent) e.consent = 'Consent is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 0) {
      setStep(1);
      return;
    }
    if (!validateStep(step)) return;
    if (step < STEPS.length) setStep(step + 1);
    else handleSubmit();
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await publicApi.submitApplication({
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        timeAtAddress: data.timeAtAddress,
        housingStatus: data.housingStatus,
        dateOfBirth: data.dateOfBirth,
        vehicleType: data.vehicleType,
        vehiclePreference: data.vehicleType,
        employmentStatus: data.employmentStatus,
        employerName: data.employerName,
        occupation: data.occupation,
        monthlyIncome: data.monthlyIncome,
        income: data.monthlyIncome,
        incomeFrequency: 'monthly',
        isEmployed: data.isEmployed,
        creditSituation: data.creditSituation,
        consent: data.consent,
        submissionType: 'application',
        sourcePage: '/apply',
        applicationStep: 'completed',
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-success" strokeWidth={2.5} />
          </div>
          <h2 className="font-display text-3xl font-bold text-midnight mb-3">Application Received</h2>
          <p className="text-gray-600 mb-8">
            Thank you, {data.firstName}. We have received your pre-approval request and will be in touch shortly.
          </p>
          <div className="bg-soft rounded-lg p-6 text-left">
            <p className="font-display font-semibold text-midnight mb-4 uppercase tracking-wider text-sm">What happens next</p>
            <ol className="space-y-4">
              {WHAT_HAPPENS_NEXT.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-600">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-electric text-white flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            Approval, rates, terms and zero-down options are subject to lender criteria. {businessName} does not guarantee approval.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <ApprovalHeroLogo height={36} />
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Shield className="w-3.5 h-3.5 text-success" />
            <span>Secure &amp; Encrypted</span>
          </div>
        </div>

        {step > 0 && (
          <div className="max-w-3xl mx-auto px-4 pb-3">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-electric rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span className="font-medium text-electric">Step {step} of {STEPS.length}</span>
              <span>{currentStep?.label}</span>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Landing / intro */}
          {step === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h1 className="font-display text-3xl md:text-4xl font-bold text-midnight leading-tight mb-4">
                Get pre-approved for the vehicle you want at terms that may work for you
              </h1>
              <p className="text-gray-600 text-lg mb-8">Applying takes about 60 seconds. No obligation.</p>

              <div className="flex flex-wrap justify-center gap-4 mb-10 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-electric" /> Secure Application</span>
                <span>Challenging Credit Welcome</span>
                <span>Dealer Partner Network</span>
                <span>Fast Response</span>
              </div>

              <button onClick={next} className="btn-primary text-lg px-12">
                Start Application <ChevronRight className="w-5 h-5" />
              </button>
              <p className="text-xs text-gray-400 mt-4">No SIN or banking details required at this stage.</p>
            </motion.div>
          )}

          {/* Step 1: Vehicle */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="font-display text-2xl font-bold text-midnight mb-2">What type of vehicle are you looking for?</h2>
              <p className="text-gray-500 mb-6">Select one to continue</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {VEHICLE_TYPES.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => update('vehicleType', v.id)}
                    className={cn(
                      'relative rounded-lg overflow-hidden border-2 transition-all text-left group',
                      data.vehicleType === v.id ? 'border-electric ring-2 ring-electric/30' : 'border-gray-200 hover:border-electric/50'
                    )}
                  >
                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={v.image} alt={v.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-midnight/70 to-transparent" />
                      <span className="absolute bottom-2 left-2 right-2 font-display text-white text-sm font-semibold">{v.label}</span>
                    </div>
                    {data.vehicleType === v.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-electric rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {errors.vehicleType && <p className="text-red-500 text-sm mt-3">{errors.vehicleType}</p>}
            </motion.div>
          )}

          {/* Step 2: Contact */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="font-display text-2xl font-bold text-midnight mb-6">Tell us who you are</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label-field">First Name *</label>
                  <input value={data.firstName} onChange={(e) => update('firstName', e.target.value)} className="input-field" autoComplete="given-name" />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="label-field">Last Name *</label>
                  <input value={data.lastName} onChange={(e) => update('lastName', e.target.value)} className="input-field" autoComplete="family-name" />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
                <div>
                  <label className="label-field">Phone *</label>
                  <input value={data.phone} onChange={(e) => update('phone', e.target.value)} className="input-field" type="tel" autoComplete="tel" placeholder="(416) 555-0123" />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="label-field">Email *</label>
                  <input value={data.email} onChange={(e) => update('email', e.target.value)} className="input-field" type="email" autoComplete="email" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="label-field">Date of Birth</label>
                  <input value={data.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} className="input-field" type="date" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Address */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="font-display text-2xl font-bold text-midnight mb-6">Your address</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label-field">Street Address *</label>
                  <input value={data.address} onChange={(e) => update('address', e.target.value)} className="input-field" autoComplete="street-address" />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label className="label-field">City *</label>
                  <input value={data.city} onChange={(e) => update('city', e.target.value)} className="input-field" autoComplete="address-level2" />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="label-field">Province *</label>
                  <select value={data.province} onChange={(e) => update('province', e.target.value)} className="input-field">
                    {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-field">Postal Code *</label>
                  <input value={data.postalCode} onChange={(e) => update('postalCode', e.target.value.toUpperCase())} className="input-field" placeholder="M5V 1A1" />
                  {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                </div>
                <div>
                  <label className="label-field">Time at Address</label>
                  <select value={data.timeAtAddress} onChange={(e) => update('timeAtAddress', e.target.value)} className="input-field">
                    <option value="">Select...</option>
                    <option value="less-than-1">Less than 1 year</option>
                    <option value="1-2">1-2 years</option>
                    <option value="2-5">2-5 years</option>
                    <option value="5-plus">5+ years</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">Housing Status</label>
                  <select value={data.housingStatus} onChange={(e) => update('housingStatus', e.target.value)} className="input-field">
                    <option value="">Select...</option>
                    <option value="own">Own</option>
                    <option value="mortgage">Mortgage</option>
                    <option value="rent">Rent</option>
                    <option value="with-parents">With Parents</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Employment */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="font-display text-2xl font-bold text-midnight mb-6">Employment &amp; income</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label-field">Are you currently employed? *</label>
                  <div className="flex gap-4 mt-1">
                    {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map((o) => (
                      <button
                        key={String(o.v)}
                        type="button"
                        onClick={() => update('isEmployed', o.v)}
                        className={cn('flex-1 py-3 rounded border-2 font-medium transition-colors', data.isEmployed === o.v ? 'border-electric bg-electric/5 text-electric' : 'border-gray-200 text-gray-600')}
                      >
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label-field">Employment Status *</label>
                  <select value={data.employmentStatus} onChange={(e) => update('employmentStatus', e.target.value)} className="input-field">
                    <option value="">Select...</option>
                    <option value="employed">Employed</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="retired">Retired</option>
                    <option value="other-income">Other Income</option>
                    <option value="unemployed">Unemployed</option>
                  </select>
                  {errors.employmentStatus && <p className="text-red-500 text-xs mt-1">{errors.employmentStatus}</p>}
                </div>
                <div>
                  <label className="label-field">Monthly Income (before tax) *</label>
                  <input value={data.monthlyIncome} onChange={(e) => update('monthlyIncome', e.target.value)} className="input-field" type="number" placeholder="e.g. 4500" />
                  {errors.monthlyIncome && <p className="text-red-500 text-xs mt-1">{errors.monthlyIncome}</p>}
                </div>
                {data.isEmployed && (
                  <>
                    <div>
                      <label className="label-field">Employer Name *</label>
                      <input value={data.employerName} onChange={(e) => update('employerName', e.target.value)} className="input-field" />
                      {errors.employerName && <p className="text-red-500 text-xs mt-1">{errors.employerName}</p>}
                    </div>
                    <div>
                      <label className="label-field">Occupation</label>
                      <input value={data.occupation} onChange={(e) => update('occupation', e.target.value)} className="input-field" />
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="font-display text-2xl font-bold text-midnight mb-6">Almost done</h2>

              <div className="mb-6">
                <label className="label-field">Credit Situation *</label>
                <select value={data.creditSituation} onChange={(e) => update('creditSituation', e.target.value)} className="input-field">
                  <option value="">Select your situation...</option>
                  <option value="good">Good Credit</option>
                  <option value="fair">Fair Credit</option>
                  <option value="bad-credit">Bad Credit</option>
                  <option value="no-credit">No Credit / First-Time Buyer</option>
                  <option value="bankruptcy">Bankruptcy</option>
                  <option value="consumer-proposal">Consumer Proposal</option>
                  <option value="previous-denial">Previous Financing Denial</option>
                  <option value="self-employed">Self-Employed</option>
                  <option value="newcomer">New to Canada</option>
                </select>
                {errors.creditSituation && <p className="text-red-500 text-xs mt-1">{errors.creditSituation}</p>}
              </div>

              <div className="bg-soft rounded-lg p-4 mb-6 text-sm space-y-2">
                <p><strong>Vehicle:</strong> {VEHICLE_TYPES.find((v) => v.id === data.vehicleType)?.label}</p>
                <p><strong>Name:</strong> {data.firstName} {data.lastName}</p>
                <p><strong>Contact:</strong> {data.phone} / {data.email}</p>
                <p><strong>Location:</strong> {data.city}, {data.province} {data.postalCode}</p>
                <p><strong>Income:</strong> ${data.monthlyIncome}/month</p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer mb-4">
                <input type="checkbox" checked={data.consent} onChange={(e) => update('consent', e.target.checked)} className="mt-1 accent-electric" />
                <span className="text-sm text-gray-600">
                  {consentText || 'I consent to being contacted about vehicle financing options. I understand that approval, rates and terms are subject to lender criteria and eligibility. Approval Hero does not guarantee financing approval.'}
                </span>
              </label>
              {errors.consent && <p className="text-red-500 text-xs mb-4">{errors.consent}</p>}
              {submitError && <p className="text-red-500 text-sm mb-4">{submitError}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        {step > 0 && (
          <div className="flex gap-4 mt-10 pt-6 border-t border-gray-100">
            <button type="button" onClick={back} className="flex items-center gap-1 px-6 py-3 text-gray-600 hover:text-midnight transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="button"
              onClick={step === STEPS.length ? handleSubmit : next}
              disabled={submitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : step === STEPS.length ? 'Submit Application' : <>Continue <ChevronRight className="w-4 h-4" /></>}
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 py-6 px-4 text-center">
        <p className="text-xs text-gray-400 max-w-xl mx-auto">
          Approval, rates, terms and zero-down options are subject to lender criteria, credit assessment and eligibility.
          {businessName} does not guarantee financing approval. Your information is transmitted securely.
        </p>
      </footer>
    </div>
  );
}
