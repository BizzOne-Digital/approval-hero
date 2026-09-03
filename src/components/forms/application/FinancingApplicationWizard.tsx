'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Shield, ChevronLeft, ChevronRight, Loader2, Check, Lock, Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HeaderLogoLink } from '@/components/brand/ApprovalHeroLogo';
import { useApplicationSession } from './useApplicationSession';
import {
  type StepId,
  type ApplicationState,
  getActiveSteps,
  getNextStepId,
  getPrevStepId,
  getStepIndex,
  PROVINCES,
  formatPhone,
  trackApplicationEvent,
} from './stepConfig';

interface OptionItem { id: string; label: string; imageUrl?: string; description?: string }

interface WizardSettings {
  vehicleTypes?: OptionItem[];
  downPaymentOptions?: OptionItem[];
  creditCategories?: OptionItem[];
  purchaseTimelines?: OptionItem[];
  residencyStatuses?: OptionItem[];
  employmentStatuses?: OptionItem[];
  incomeRanges?: OptionItem[];
  incomeDurations?: OptionItem[];
  contactMethods?: OptionItem[];
  bestTimeOptions?: OptionItem[];
  consentWording?: Record<string, string>;
  successMessage?: { heading: string; body: string; expectedResponseTime: string };
  trustIndicators?: string[];
  downPaymentDisclaimer?: string;
  privacyNotice?: string;
}

function RadioCards({
  options,
  value,
  onSelect,
  columns = 2,
  imageCards = false,
}: {
  options: OptionItem[];
  value?: string;
  onSelect: (id: string) => void;
  columns?: number;
  imageCards?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      className={cn(
        'grid gap-3',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-1 sm:grid-cols-2',
        columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="radio"
          aria-checked={value === opt.id}
          onClick={() => onSelect(opt.id)}
          className={cn(
            'text-left rounded-xl border-2 transition-all duration-200 overflow-hidden',
            'hover:border-electric hover:shadow-md focus:outline-none focus:ring-2 focus:ring-electric/50',
            value === opt.id ? 'border-electric bg-electric/5 shadow-md' : 'border-gray-200 bg-white',
            imageCards ? 'p-0' : 'p-4',
          )}
        >
          {imageCards && opt.imageUrl && (
            <div className="relative h-28 w-full bg-gray-100">
              <Image src={opt.imageUrl} alt="" fill className="object-cover" sizes="300px" />
            </div>
          )}
          <div className={imageCards ? 'p-4' : ''}>
            <span className="font-medium text-midnight">{opt.label}</span>
            {opt.description && <p className="text-sm text-gray-500 mt-1">{opt.description}</p>}
          </div>
        </button>
      ))}
    </div>
  );
}

function Field({ label, error, children, optional }: { label: string; error?: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-midnight mb-1.5">
        {label}{optional && <span className="text-gray-400 font-normal"> (optional)</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-sm mt-1" role="alert">{error}</p>}
    </div>
  );
}

const inputClass = 'w-full border border-gray-200 rounded-lg px-4 py-3 text-midnight focus:outline-none focus:ring-2 focus:ring-electric/40 focus:border-electric';

export function FinancingApplicationWizard() {
  const reducedMotion = useReducedMotion();
  const { state, settings, currentStep: savedStep, loading, error, saveStep, sendOtp, verifyOtp, submit } = useApplicationSession();
  const [currentStepId, setCurrentStepId] = useState<StepId>('vehicleType');
  const [local, setLocal] = useState<ApplicationState>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ referenceNumber: string; successMessage?: WizardSettings['successMessage'] } | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpError, setOtpError] = useState('');
  const [mockOtpHint, setMockOtpHint] = useState('');
  const [consents, setConsents] = useState({ accuracy: false, contact: false, privacy: false, partnerShare: false, marketing: false });

  const cfg = (settings || {}) as WizardSettings;
  const merged = useMemo(() => ({ ...state, ...local }), [state, local]);
  const steps = useMemo(() => getActiveSteps(merged), [merged]);
  const stepIndex = getStepIndex(steps, currentStepId);
  const currentMeta = steps[stepIndex];
  const progress = steps.length > 1 ? Math.round(((stepIndex + 1) / steps.length) * 100) : 0;

  const hasSyncedStep = useRef(false);

  useEffect(() => {
    if (hasSyncedStep.current || !savedStep || submitted) return;
    setCurrentStepId(savedStep as StepId);
    hasSyncedStep.current = true;
  }, [savedStep, submitted]);

  useEffect(() => {
    if (state.status === 'Submitted' && state.referenceNumber) {
      setSubmitted(true);
      setSubmitResult({ referenceNumber: state.referenceNumber, successMessage: cfg.successMessage });
    }
  }, [state.status, state.referenceNumber, cfg.successMessage]);

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const t = setTimeout(() => setOtpCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [otpCooldown]);

  const updateLocal = useCallback((patch: Partial<ApplicationState>) => {
    setLocal((prev) => ({ ...prev, ...patch }));
    setErrors({});
  }, []);

  const goToStep = useCallback((id: StepId) => {
    setCurrentStepId(id);
    setErrors({});
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [reducedMotion]);

  const advance = useCallback(async (stepId: StepId, data: Record<string, unknown>) => {
    const tentative: ApplicationState = { ...merged };
    if (stepId === 'knowsSpecificVehicle') tentative.knowsSpecificVehicle = data.knowsSpecificVehicle as boolean;
    if (stepId === 'tradeIn' || stepId === 'tradeInDetails') {
      tentative.tradeIn = { ...merged.tradeIn, ...data, planning: String(data.planning || merged.tradeIn?.planning || '') };
    }
    const nextSteps = getActiveSteps(tentative);
    const nextId = getNextStepId(nextSteps, stepId);
    setSaving(true);
    try {
      await saveStep(stepId, data, nextId || stepId);
      setLocal({});
      if (nextId) goToStep(nextId);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Failed to save' });
    } finally {
      setSaving(false);
    }
  }, [merged, saveStep, goToStep]);

  const handleBack = () => {
    const prev = getPrevStepId(steps, currentStepId);
    if (prev) {
      trackApplicationEvent('application_step_back', { step: currentStepId });
      goToStep(prev);
    }
  };

  const handleSaveExit = () => {
    trackApplicationEvent('application_abandoned', { step: currentStepId });
    window.location.href = '/';
  };

  const motionProps = reducedMotion
    ? {}
    : { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 }, transition: { duration: 0.3 } };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-electric" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">Try Again</button>
      </div>
    );
  }

  if (submitted && submitResult) {
    const sm = submitResult.successMessage || cfg.successMessage;
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="font-display text-3xl text-midnight mb-4">{sm?.heading || 'Your Application Has Been Received'}</h1>
        <p className="text-gray-600 mb-6">{sm?.body}</p>
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <p className="text-sm text-gray-500 mb-1">Application Reference Number</p>
          <p className="font-display text-2xl text-electric tracking-wider">{submitResult.referenceNumber}</p>
          {sm?.expectedResponseTime && <p className="text-sm text-gray-500 mt-3">{sm.expectedResponseTime}</p>}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">Return to Home</Link>
          <Link href="/faqs" className="btn-outline">View FAQs</Link>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStepId) {
      case 'vehicleType':
        return (
          <RadioCards
            imageCards
            columns={3}
            options={cfg.vehicleTypes || []}
            value={local.vehicleType || merged.vehicleType}
            onSelect={(id) => advance('vehicleType', { vehicleType: id })}
          />
        );

      case 'knowsSpecificVehicle':
        return (
          <RadioCards
            columns={1}
            options={[
              { id: 'yes', label: 'Yes, I know what I want' },
              { id: 'no', label: 'No, I am still deciding' },
            ]}
            value={local.knowsSpecificVehicle !== undefined ? (local.knowsSpecificVehicle ? 'yes' : 'no') : (merged.knowsSpecificVehicle ? 'yes' : merged.knowsSpecificVehicle === false ? 'no' : undefined)}
            onSelect={(id) => advance('knowsSpecificVehicle', { knowsSpecificVehicle: id === 'yes' })}
          />
        );

      case 'preferredVehicle': {
        const pv = local.preferredVehicle || merged.preferredVehicle || {};
        return (
          <div className="space-y-6">
            <div className="relative h-48 sm:h-56 rounded-xl overflow-hidden">
              <Image
                src="/images/vehicles/truck-highway.png"
                alt="Truck on the highway"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
                priority
              />
            </div>
            <form onSubmit={(e) => {
            e.preventDefault();
            if (!pv.make?.trim()) { setErrors({ make: 'Make is required' }); return; }
            if (!pv.model?.trim()) { setErrors({ model: 'Model is required' }); return; }
            advance('preferredVehicle', { make: pv.make, model: pv.model, year: pv.year, notes: pv.notes });
          }} className="space-y-4">
            <Field label="Vehicle Make" error={errors.make}>
              <input className={inputClass} value={pv.make || ''} onChange={(e) => updateLocal({ preferredVehicle: { ...pv, make: e.target.value } })} />
            </Field>
            <Field label="Vehicle Model" error={errors.model}>
              <input className={inputClass} value={pv.model || ''} onChange={(e) => updateLocal({ preferredVehicle: { ...pv, model: e.target.value } })} />
            </Field>
            <Field label="Preferred Year" optional>
              <input className={inputClass} value={pv.year || ''} onChange={(e) => updateLocal({ preferredVehicle: { ...pv, year: e.target.value } })} />
            </Field>
            <Field label="Additional Notes" optional>
              <textarea className={inputClass} rows={3} value={pv.notes || ''} onChange={(e) => updateLocal({ preferredVehicle: { ...pv, notes: e.target.value } })} />
            </Field>
            <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ChevronRight className="w-4 h-4" /></>}
            </button>
          </form>
          </div>
        );
      }

      case 'tradeIn':
        return (
          <RadioCards
            columns={1}
            options={[
              { id: 'yes', label: 'Yes' },
              { id: 'no', label: 'No' },
              { id: 'not-sure', label: 'Not Sure' },
            ]}
            value={local.tradeIn?.planning || merged.tradeIn?.planning}
            onSelect={(id) => advance('tradeIn', { planning: id })}
          />
        );

      case 'tradeInDetails': {
        const ti = local.tradeIn || merged.tradeIn || {};
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            advance('tradeInDetails', { ...ti, planning: 'yes' });
          }} className="space-y-4">
            <Field label="Current Vehicle Year" optional><input className={inputClass} value={ti.year || ''} onChange={(e) => updateLocal({ tradeIn: { ...ti, year: e.target.value } })} /></Field>
            <Field label="Make" optional><input className={inputClass} value={ti.make || ''} onChange={(e) => updateLocal({ tradeIn: { ...ti, make: e.target.value } })} /></Field>
            <Field label="Model" optional><input className={inputClass} value={ti.model || ''} onChange={(e) => updateLocal({ tradeIn: { ...ti, model: e.target.value } })} /></Field>
            <Field label="Approximate Kilometres" optional><input className={inputClass} value={ti.kilometres || ''} onChange={(e) => updateLocal({ tradeIn: { ...ti, kilometres: e.target.value } })} /></Field>
            <Field label="Existing Loan Balance" optional><input className={inputClass} value={ti.loanBalance || ''} onChange={(e) => updateLocal({ tradeIn: { ...ti, loanBalance: e.target.value } })} /></Field>
            <Field label="Trade-In Notes" optional><textarea className={inputClass} rows={2} value={ti.notes || ''} onChange={(e) => updateLocal({ tradeIn: { ...ti, notes: e.target.value } })} /></Field>
            <div className="flex flex-col gap-3">
              <button type="submit" disabled={saving} className="btn-primary w-full">Continue</button>
              <button type="button" onClick={() => advance('tradeInDetails', { planning: 'yes', detailsSkipped: true })} className="text-sm text-gray-500 hover:text-electric">
                Skip for now — complete with an advisor later
              </button>
            </div>
          </form>
        );
      }

      case 'downPayment':
        return (
          <>
            <RadioCards
              columns={2}
              options={cfg.downPaymentOptions || []}
              value={local.downPaymentRange || merged.downPaymentRange}
              onSelect={(id) => advance('downPayment', { downPaymentRange: id })}
            />
            {cfg.downPaymentDisclaimer && (
              <p className="text-sm text-gray-500 mt-6 p-4 bg-gray-50 rounded-lg">{cfg.downPaymentDisclaimer}</p>
            )}
          </>
        );

      case 'creditSituation':
        return (
          <RadioCards
            columns={1}
            options={cfg.creditCategories || []}
            value={local.creditCategory || merged.creditCategory}
            onSelect={(id) => advance('creditSituation', { creditCategory: id })}
          />
        );

      case 'purchaseTiming':
        return (
          <RadioCards
            columns={1}
            options={cfg.purchaseTimelines || []}
            value={local.purchaseTimeline || merged.purchaseTimeline}
            onSelect={(id) => advance('purchaseTiming', { purchaseTimeline: id })}
          />
        );

      case 'residencyStatus':
        return (
          <RadioCards
            columns={1}
            options={cfg.residencyStatuses || []}
            value={local.residencyStatus || merged.residencyStatus}
            onSelect={(id) => advance('residencyStatus', { residencyStatus: id })}
          />
        );

      case 'employmentStatus':
        return (
          <RadioCards
            columns={1}
            options={cfg.employmentStatuses || []}
            value={local.employmentStatus || merged.employmentStatus}
            onSelect={(id) => advance('employmentStatus', { employmentStatus: id })}
          />
        );

      case 'monthlyIncome':
        return (
          <RadioCards
            columns={1}
            options={cfg.incomeRanges || []}
            value={local.monthlyIncomeRange || merged.monthlyIncomeRange}
            onSelect={(id) => advance('monthlyIncome', { monthlyIncomeRange: id })}
          />
        );

      case 'incomeDuration':
        return (
          <RadioCards
            columns={1}
            options={cfg.incomeDurations || []}
            value={local.incomeDuration || merged.incomeDuration}
            onSelect={(id) => advance('incomeDuration', { incomeDuration: id })}
          />
        );

      case 'employmentDetails': {
        const emp = merged.employmentStatus || '';
        const ed = local.employerDetails || merged.employerDetails || {};
        const setEd = (k: string, v: string) => updateLocal({ employerDetails: { ...ed, [k]: v } });
        return (
          <form onSubmit={(e) => { e.preventDefault(); advance('employmentDetails', ed); }} className="space-y-4">
            {(emp === 'full-time' || emp === 'part-time') && (
              <>
                <Field label="Employer Name"><input className={inputClass} value={ed.employerName || ''} onChange={(e) => setEd('employerName', e.target.value)} required /></Field>
                <Field label="Job Title"><input className={inputClass} value={ed.jobTitle || ''} onChange={(e) => setEd('jobTitle', e.target.value)} required /></Field>
                <Field label="Employment Start Date or Duration"><input className={inputClass} value={ed.startDate || ''} onChange={(e) => setEd('startDate', e.target.value)} required /></Field>
                <Field label="Employer Phone" optional><input className={inputClass} value={ed.employerPhone || ''} onChange={(e) => setEd('employerPhone', e.target.value)} /></Field>
              </>
            )}
            {emp === 'self-employed' && (
              <>
                <Field label="Business Name"><input className={inputClass} value={ed.businessName || ''} onChange={(e) => setEd('businessName', e.target.value)} required /></Field>
                <Field label="Industry"><input className={inputClass} value={ed.industry || ''} onChange={(e) => setEd('industry', e.target.value)} required /></Field>
                <Field label="Time in Business"><input className={inputClass} value={ed.timeInBusiness || ''} onChange={(e) => setEd('timeInBusiness', e.target.value)} required /></Field>
                <Field label="Business Phone" optional><input className={inputClass} value={ed.businessPhone || ''} onChange={(e) => setEd('businessPhone', e.target.value)} /></Field>
              </>
            )}
            {emp === 'retired' && (
              <>
                <Field label="Income Source"><input className={inputClass} value={ed.incomeSource || ''} onChange={(e) => setEd('incomeSource', e.target.value)} required /></Field>
                <Field label="Time Receiving Income"><input className={inputClass} value={ed.timeReceiving || ''} onChange={(e) => setEd('timeReceiving', e.target.value)} required /></Field>
              </>
            )}
            {emp === 'other-income' && (
              <Field label="Income Source"><input className={inputClass} value={ed.incomeSource || ''} onChange={(e) => setEd('incomeSource', e.target.value)} required /></Field>
            )}
            {(emp === 'not-employed' || emp === 'prefer-discuss') && (
              <p className="text-gray-600 text-sm">No additional employment details required. Continue to the next step.</p>
            )}
            <button type="submit" disabled={saving} className="btn-primary w-full">Continue</button>
          </form>
        );
      }

      case 'address': {
        const addr = local.address || merged.address || { country: 'Canada', province: 'ON' };
        const setAddr = (k: string, v: string) => updateLocal({ address: { ...addr, [k]: v, entryMode: 'manual' } });
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!addr.street?.trim()) { setErrors({ street: 'Street address is required' }); return; }
            if (!addr.city?.trim()) { setErrors({ city: 'City is required' }); return; }
            if (!addr.postalCode?.trim()) { setErrors({ postalCode: 'Postal code is required' }); return; }
            advance('address', { ...addr, entryMode: 'manual' });
          }} className="space-y-4">
            <p className="text-sm text-gray-500">Enter your address manually. Autocomplete is optional when Google Maps is available.</p>
            <Field label="Street Address" error={errors.street}><input className={inputClass} value={addr.street || ''} onChange={(e) => setAddr('street', e.target.value)} /></Field>
            <Field label="Unit Number" optional><input className={inputClass} value={addr.unit || ''} onChange={(e) => setAddr('unit', e.target.value)} /></Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="City" error={errors.city}><input className={inputClass} value={addr.city || ''} onChange={(e) => setAddr('city', e.target.value)} /></Field>
              <Field label="Province">
                <select className={inputClass} value={addr.province || 'ON'} onChange={(e) => setAddr('province', e.target.value)}>
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Postal Code" error={errors.postalCode}><input className={inputClass} value={addr.postalCode || ''} onChange={(e) => setAddr('postalCode', e.target.value.toUpperCase())} /></Field>
              <Field label="Country"><input className={inputClass} value={addr.country || 'Canada'} onChange={(e) => setAddr('country', e.target.value)} /></Field>
            </div>
            <Field label="Time at Current Address">
              <select className={inputClass} value={addr.timeAtAddress || ''} onChange={(e) => setAddr('timeAtAddress', e.target.value)} required>
                <option value="">Select...</option>
                <option value="lt-1">Less than 1 year</option>
                <option value="1-2">1–2 years</option>
                <option value="2-5">2–5 years</option>
                <option value="5+">5+ years</option>
              </select>
            </Field>
            <button type="submit" disabled={saving} className="btn-primary w-full">Continue</button>
          </form>
        );
      }

      case 'dateOfBirth': {
        const dob = local.dateOfBirth || merged.dateOfBirth || {};
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const m = Number(dob.month), d = Number(dob.day), y = Number(dob.year);
            if (!m || !d || !y) { setErrors({ form: 'Complete date of birth required' }); return; }
            const date = new Date(y, m - 1, d);
            if (date.getMonth() !== m - 1) { setErrors({ form: 'Invalid date' }); return; }
            if (date > new Date()) { setErrors({ form: 'Date cannot be in the future' }); return; }
            const age = new Date().getFullYear() - y;
            if (age < 18) { setErrors({ form: 'You must be 18 or older' }); return; }
            advance('dateOfBirth', { month: m, day: d, year: y });
          }} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Month">
                <select className={inputClass} value={dob.month || ''} onChange={(e) => updateLocal({ dateOfBirth: { ...dob, month: e.target.value } })} required>
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                  ))}
                </select>
              </Field>
              <Field label="Day">
                <select className={inputClass} value={dob.day || ''} onChange={(e) => updateLocal({ dateOfBirth: { ...dob, day: e.target.value } })} required>
                  <option value="">DD</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
                  ))}
                </select>
              </Field>
              <Field label="Year">
                <select className={inputClass} value={dob.year || ''} onChange={(e) => updateLocal({ dateOfBirth: { ...dob, year: e.target.value } })} required>
                  <option value="">YYYY</option>
                  {Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 18 - i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </Field>
            </div>
            {errors.form && <p className="text-red-500 text-sm" role="alert">{errors.form}</p>}
            <button type="submit" disabled={saving} className="btn-primary w-full">Continue</button>
          </form>
        );
      }

      case 'contactDetails': {
        const cd = { ...merged, ...local };
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const errs: Record<string, string> = {};
            if (!cd.firstName?.trim()) errs.firstName = 'Required';
            if (!cd.lastName?.trim()) errs.lastName = 'Required';
            if (!cd.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Valid email required';
            if ((cd.phone || '').replace(/\D/g, '').length < 10) errs.phone = 'Valid Canadian phone required';
            if (Object.keys(errs).length) { setErrors(errs); return; }
            advance('contactDetails', {
              firstName: cd.firstName,
              lastName: cd.lastName,
              email: cd.email,
              phone: (cd.phone || '').replace(/\D/g, ''),
              preferredContactMethod: cd.preferredContactMethod || 'phone',
              bestTimeToContact: cd.bestTimeToContact || 'anytime',
            });
          }} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="First Name" error={errors.firstName}><input className={inputClass} value={cd.firstName || ''} onChange={(e) => updateLocal({ firstName: e.target.value })} /></Field>
              <Field label="Last Name" error={errors.lastName}><input className={inputClass} value={cd.lastName || ''} onChange={(e) => updateLocal({ lastName: e.target.value })} /></Field>
            </div>
            <Field label="Email" error={errors.email}><input type="email" className={inputClass} value={cd.email || ''} onChange={(e) => updateLocal({ email: e.target.value })} /></Field>
            <Field label="Phone Number" error={errors.phone}>
              <input className={inputClass} value={cd.phone || ''} onChange={(e) => updateLocal({ phone: formatPhone(e.target.value) })} />
            </Field>
            <p className="text-sm text-gray-500 flex items-center gap-2"><Mail className="w-4 h-4" /> A verification code will be sent to your email.</p>
            <Field label="Preferred Contact Method">
              <div className="flex gap-3">
                {(cfg.contactMethods || []).map((m) => (
                  <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="pcm" checked={(cd.preferredContactMethod || 'phone') === m.id} onChange={() => updateLocal({ preferredContactMethod: m.id })} />
                    {m.label}
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Best Time to Contact">
              <select className={inputClass} value={cd.bestTimeToContact || ''} onChange={(e) => updateLocal({ bestTimeToContact: e.target.value })}>
                <option value="">Select...</option>
                {(cfg.bestTimeOptions || []).map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </Field>
            <button type="submit" disabled={saving} className="btn-primary w-full">Continue</button>
          </form>
        );
      }

      case 'emailVerification': {
        const maskedEmail = merged.email
          ? merged.email.replace(/(.{1})(.*)(@.*)/, (_, a, mid, domain) => a + '*'.repeat(Math.min(mid.length, 6)) + domain)
          : 'your email';
        return (
          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              We will send a 6-digit code to <strong>{maskedEmail}</strong>.
            </p>
            {!otpSent ? (
              <button
                type="button"
                onClick={async () => {
                  setOtpError('');
                  try {
                    const res = await sendOtp();
                    if (res.sent) {
                      setOtpSent(true);
                      setOtpCooldown(60);
                      if (res.mockCode) setMockOtpHint(`Dev code: ${res.mockCode}`);
                    } else if (res.cooldownSeconds) {
                      setOtpCooldown(res.cooldownSeconds);
                      setOtpError(`Please wait ${res.cooldownSeconds}s before resending`);
                    }
                  } catch (err) {
                    setOtpError(err instanceof Error ? err.message : 'Failed to send code');
                  }
                }}
                className="btn-primary w-full"
              >
                Send Code to Email
              </button>
            ) : (
              <>
                <Field label="Enter 6-digit code">
                  <input
                    className={cn(inputClass, 'text-center text-2xl tracking-[0.5em] font-mono')}
                    maxLength={6}
                    inputMode="numeric"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    aria-label="Verification code"
                  />
                </Field>
                {otpError && <p className="text-red-500 text-sm" role="alert">{otpError}</p>}
                {mockOtpHint && process.env.NODE_ENV !== 'production' && (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">{mockOtpHint}</p>
                )}
                <button
                  type="button"
                  disabled={otpCode.length !== 6 || saving}
                  onClick={async () => {
                    setSaving(true);
                    setOtpError('');
                    try {
                      await verifyOtp(otpCode);
                      goToStep('reviewConsent');
                    } catch (err) {
                      setOtpError(err instanceof Error ? err.message : 'Invalid code');
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Continue'}
                </button>
                <button
                  type="button"
                  disabled={otpCooldown > 0}
                  onClick={async () => {
                    try {
                      const res = await sendOtp();
                      if (res.sent) { setOtpCooldown(60); if (res.mockCode) setMockOtpHint(`Dev code: ${res.mockCode}`); }
                    } catch (err) {
                      setOtpError(err instanceof Error ? err.message : 'Resend failed');
                    }
                  }}
                  className="text-sm text-electric disabled:text-gray-400 w-full"
                >
                  {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend Code'}
                </button>
              </>
            )}
          </div>
        );
      }

      case 'reviewConsent': {
        const cw = cfg.consentWording || {};
        const label = (id: string) => {
          const opt = [
            ...(cfg.vehicleTypes || []), ...(cfg.downPaymentOptions || []), ...(cfg.creditCategories || []),
            ...(cfg.purchaseTimelines || []), ...(cfg.residencyStatuses || []), ...(cfg.employmentStatuses || []),
            ...(cfg.incomeRanges || []),
          ].find((o) => o.id === id);
          return opt?.label || id || '—';
        };
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-5 space-y-3 text-sm">
              <SummaryRow label="Vehicle Type" value={label(merged.vehicleType || '')} stepId="vehicleType" onEdit={goToStep} />
              <SummaryRow label="Trade-In" value={merged.tradeIn?.planning || '—'} stepId="tradeIn" onEdit={goToStep} />
              <SummaryRow label="Down Payment" value={label(merged.downPaymentRange || '')} stepId="downPayment" onEdit={goToStep} />
              <SummaryRow label="Purchase Timeline" value={label(merged.purchaseTimeline || '')} stepId="purchaseTiming" onEdit={goToStep} />
              <SummaryRow label="Employment" value={label(merged.employmentStatus || '')} stepId="employmentStatus" onEdit={goToStep} />
              <SummaryRow label="Income" value={label(merged.monthlyIncomeRange || '')} stepId="monthlyIncome" onEdit={goToStep} />
              <SummaryRow label="Contact" value={`${merged.firstName} ${merged.lastName}`} stepId="contactDetails" onEdit={goToStep} />
            </div>

            <div className="space-y-3">
              {(['accuracy', 'contact', 'privacy', 'partnerShare'] as const).map((key) => (
                <label key={key} className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={consents[key]} onChange={(e) => setConsents((c) => ({ ...c, [key]: e.target.checked }))} className="mt-1" required />
                  <span className="text-sm text-gray-700">{cw[key] || key}</span>
                </label>
              ))}
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={consents.marketing} onChange={(e) => setConsents((c) => ({ ...c, marketing: e.target.checked }))} className="mt-1" />
                <span className="text-sm text-gray-700">{cw.marketing || 'I would like to receive promotional updates.'}</span>
              </label>
            </div>

            {errors.form && <p className="text-red-500 text-sm" role="alert">{errors.form}</p>}

            <button
              type="button"
              disabled={saving || !consents.accuracy || !consents.contact || !consents.privacy || !consents.partnerShare}
              onClick={async () => {
                if (!merged.emailVerified && !merged.phoneVerified) {
                  setOtpError('');
                  goToStep('emailVerification');
                  return;
                }
                setSaving(true);
                try {
                  const result = await submit(consents);
                  setSubmitResult({ referenceNumber: result.referenceNumber, successMessage: result.successMessage });
                  setSubmitted(true);
                } catch (err) {
                  setErrors({ form: err instanceof Error ? err.message : 'Submission failed' });
                } finally {
                  setSaving(false);
                }
              }}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Application'}
            </button>
            <p className="text-xs text-gray-500 text-center">Submission does not guarantee financing approval.</p>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-ice-blue/30">
      {/* Application Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <HeaderLogoLink height={36} />
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Lock className="w-3.5 h-3.5 text-electric" />
              <span>Secure & Encrypted</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="font-medium text-midnight">{currentMeta?.category}</span>
            <span>Step {stepIndex + 1} of {steps.length}</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Application progress"
            className="h-1.5 bg-gray-100 rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-electric to-bright-blue rounded-full"
              animate={{ width: `${progress}%` }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.4 }}
            />
          </div>
          <div className="flex items-center justify-between mt-3">
            {stepIndex > 0 ? (
              <button type="button" onClick={handleBack} className="flex items-center gap-1 text-sm text-gray-600 hover:text-electric">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : <span />}
            <button type="button" onClick={handleSaveExit} className="text-sm text-gray-500 hover:text-electric">
              Save & Exit
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10" id="main-content">
        {saving && (
          <div className="fixed inset-0 bg-white/50 z-40 flex items-center justify-center pointer-events-none">
            <Loader2 className="w-8 h-8 animate-spin text-electric" />
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={currentStepId} {...motionProps}>
            <h1 className="font-display text-2xl sm:text-3xl text-midnight mb-2">{currentMeta?.question}</h1>
            {(cfg.trustIndicators || []).length > 0 && currentStepId === 'vehicleType' && (
              <div className="flex flex-wrap gap-3 mb-8">
                {(cfg.trustIndicators || []).map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                    <Shield className="w-3.5 h-3.5 text-electric" /> {t}
                  </span>
                ))}
              </div>
            )}
            {errors.form && currentStepId !== 'dateOfBirth' && currentStepId !== 'reviewConsent' && (
              <p className="text-red-500 text-sm mb-4" role="alert">{errors.form}</p>
            )}
            <div className="mt-6">{renderStep()}</div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function SummaryRow({ label, value, stepId, onEdit }: { label: string; value: string; stepId: StepId; onEdit: (id: StepId) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <span className="text-gray-500">{label}</span>
        <p className="font-medium text-midnight capitalize">{value}</p>
      </div>
      <button type="button" onClick={() => onEdit(stepId)} className="text-xs text-electric hover:underline shrink-0">Edit</button>
    </div>
  );
}
