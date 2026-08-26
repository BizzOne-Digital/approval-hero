'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { applicationApi } from '@/lib/api';
import type { ApplicationState } from './stepConfig';
import { trackApplicationEvent } from './stepConfig';

const TOKEN_KEY = 'ah_application_token';

function getUtmParams() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
  };
}

function getDeviceCategory(): string {
  if (typeof window === 'undefined') return 'unknown';
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

export function useApplicationSession() {
  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<ApplicationState>({});
  const [currentStep, setCurrentStep] = useState<string>('vehicleType');
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const initRef = useRef(false);

  const applySession = useCallback((session: Record<string, unknown>) => {
    setState({
      vehicleType: session.vehicleType as string,
      knowsSpecificVehicle: session.knowsSpecificVehicle as boolean,
      preferredVehicle: session.preferredVehicle as ApplicationState['preferredVehicle'],
      tradeIn: session.tradeIn as ApplicationState['tradeIn'],
      downPaymentRange: session.downPaymentRange as string,
      creditCategory: session.creditCategory as string,
      purchaseTimeline: session.purchaseTimeline as string,
      residencyStatus: session.residencyStatus as string,
      employmentStatus: session.employmentStatus as string,
      monthlyIncomeRange: session.monthlyIncomeRange as string,
      incomeDuration: session.incomeDuration as string,
      employerDetails: session.employerDetails as Record<string, string>,
      address: session.address as ApplicationState['address'],
      firstName: session.firstName as string,
      lastName: session.lastName as string,
      email: session.email as string,
      phone: session.phone as string,
      preferredContactMethod: session.preferredContactMethod as string,
      bestTimeToContact: session.bestTimeToContact as string,
      emailVerified: session.emailVerified as boolean,
      phoneVerified: session.phoneVerified as boolean,
      status: session.status as string,
      referenceNumber: session.referenceNumber as string,
      dateOfBirth: session.dateOfBirth
        ? {
            year: (session.dateOfBirth as string).split('-')[0],
            month: (session.dateOfBirth as string).split('-')[1],
            day: (session.dateOfBirth as string).split('-')[2],
          }
        : undefined,
    });
    if (session.settings) setSettings(session.settings as Record<string, unknown>);
    if (session.currentStep) setCurrentStep(String(session.currentStep));
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    async function init() {
      try {
        const stored = localStorage.getItem(TOKEN_KEY);
        if (stored) {
          const session = await applicationApi.getSession(stored);
          setToken(stored);
          applySession(session as Record<string, unknown>);
          setLoading(false);
          return;
        }

        const utm = getUtmParams();
        const result = await applicationApi.start({
          source: 'apply',
          referrer: document.referrer || undefined,
          deviceCategory: getDeviceCategory(),
          ...utm,
        });
        localStorage.setItem(TOKEN_KEY, result.token);
        setToken(result.token);
        trackApplicationEvent('application_started');
        const session = await applicationApi.getSession(result.token);
        applySession(session as Record<string, unknown>);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start application');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [applySession]);

  const saveStep = useCallback(async (stepId: string, data: Record<string, unknown>, nextStep?: string) => {
    if (!token) throw new Error('No session');
    const payload = { ...data, nextStep };
    const session = await applicationApi.saveStep(token, stepId, payload);
    applySession(session as Record<string, unknown>);
    trackApplicationEvent('application_step_completed', { step: stepId });
    return session;
  }, [token, applySession]);

  const sendOtp = useCallback(async () => {
    if (!token) throw new Error('No session');
    trackApplicationEvent('email_verification_requested');
    return applicationApi.sendOtp(token);
  }, [token]);

  const verifyOtp = useCallback(async (code: string) => {
    if (!token) throw new Error('No session');
    const session = await applicationApi.verifyOtp(token, code);
    applySession(session as Record<string, unknown>);
    trackApplicationEvent('email_verified');
    return session;
  }, [token, applySession]);

  const submit = useCallback(async (consents: {
    accuracy: boolean;
    contact: boolean;
    privacy: boolean;
    partnerShare: boolean;
    marketing?: boolean;
  }) => {
    if (!token) throw new Error('No session');
    const result = await applicationApi.submit(token, consents);
    trackApplicationEvent('application_submitted');
    setState((prev) => ({ ...prev, referenceNumber: result.referenceNumber, status: 'Submitted' }));
    return result;
  }, [token]);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  return {
    token,
    state,
    setState,
    settings,
    currentStep,
    loading,
    error,
    saveStep,
    sendOtp,
    verifyOtp,
    submit,
    clearSession,
    applySession,
  };
}
