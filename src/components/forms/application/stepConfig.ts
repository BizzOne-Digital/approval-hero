export type StepId =
  | 'vehicleType'
  | 'knowsSpecificVehicle'
  | 'preferredVehicle'
  | 'tradeIn'
  | 'tradeInDetails'
  | 'downPayment'
  | 'creditSituation'
  | 'purchaseTiming'
  | 'residencyStatus'
  | 'employmentStatus'
  | 'monthlyIncome'
  | 'incomeDuration'
  | 'employmentDetails'
  | 'address'
  | 'dateOfBirth'
  | 'contactDetails'
  | 'emailVerification'
  | 'reviewConsent';

export interface StepMeta {
  id: StepId;
  category: string;
  question: string;
}

export interface ApplicationState {
  vehicleType?: string;
  knowsSpecificVehicle?: boolean;
  preferredVehicle?: { make?: string; model?: string; year?: string; notes?: string };
  tradeIn?: {
    planning?: string;
    year?: string;
    make?: string;
    model?: string;
    kilometres?: string;
    loanBalance?: string;
    notes?: string;
    detailsSkipped?: boolean;
  };
  downPaymentRange?: string;
  creditCategory?: string;
  purchaseTimeline?: string;
  residencyStatus?: string;
  employmentStatus?: string;
  monthlyIncomeRange?: string;
  incomeDuration?: string;
  employerDetails?: Record<string, string>;
  address?: {
    street?: string;
    unit?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
    timeAtAddress?: string;
    entryMode?: string;
  };
  dateOfBirth?: { month?: string; day?: string; year?: string };
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  preferredContactMethod?: string;
  bestTimeToContact?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  status?: string;
  referenceNumber?: string;
}

const BASE_STEPS: Omit<StepMeta, 'question'>[] = [
  { id: 'vehicleType', category: 'Vehicle' },
  { id: 'knowsSpecificVehicle', category: 'Vehicle' },
  { id: 'preferredVehicle', category: 'Vehicle' },
  { id: 'tradeIn', category: 'Trade-In' },
  { id: 'tradeInDetails', category: 'Trade-In' },
  { id: 'downPayment', category: 'Financing' },
  { id: 'creditSituation', category: 'Credit' },
  { id: 'purchaseTiming', category: 'Timeline' },
  { id: 'residencyStatus', category: 'Residency' },
  { id: 'employmentStatus', category: 'Employment' },
  { id: 'monthlyIncome', category: 'Income' },
  { id: 'incomeDuration', category: 'Income' },
  { id: 'employmentDetails', category: 'Employment' },
  { id: 'address', category: 'Address' },
  { id: 'dateOfBirth', category: 'Personal' },
  { id: 'contactDetails', category: 'Contact' },
  { id: 'emailVerification', category: 'Verification' },
  { id: 'reviewConsent', category: 'Review' },
];

const QUESTIONS: Record<StepId, string> = {
  vehicleType: 'What type of vehicle are you interested in?',
  knowsSpecificVehicle: 'Do you already have a specific vehicle in mind?',
  preferredVehicle: 'Tell us about your preferred vehicle',
  tradeIn: 'Are you planning to trade in a vehicle?',
  tradeInDetails: 'Tell us about your trade-in vehicle',
  downPayment: 'How much are you planning to put down?',
  creditSituation: 'How would you describe your current credit situation?',
  purchaseTiming: 'When are you hoping to purchase a vehicle?',
  residencyStatus: 'What is your current residency status?',
  employmentStatus: 'What is your current employment status?',
  monthlyIncome: 'What is your approximate monthly income before deductions?',
  incomeDuration: 'How long have you been receiving this income?',
  employmentDetails: 'Tell us about your employment',
  address: 'What is your current address?',
  dateOfBirth: 'What is your date of birth?',
  contactDetails: 'How can we reach you?',
  emailVerification: 'Verify your email address',
  reviewConsent: 'Review and submit your application',
};

export function shouldIncludeStep(id: StepId, state: ApplicationState): boolean {
  switch (id) {
    case 'preferredVehicle':
      return state.knowsSpecificVehicle === true;
    case 'tradeInDetails':
      return state.tradeIn?.planning === 'yes' && !state.tradeIn?.detailsSkipped;
    default:
      return true;
  }
}

export function getActiveSteps(state: ApplicationState): StepMeta[] {
  return BASE_STEPS
    .filter((s) => shouldIncludeStep(s.id, state))
    .map((s) => ({ ...s, question: QUESTIONS[s.id] }));
}

export function getStepIndex(steps: StepMeta[], stepId: StepId): number {
  return steps.findIndex((s) => s.id === stepId);
}

export function getNextStepId(steps: StepMeta[], currentId: StepId): StepId | null {
  const idx = getStepIndex(steps, currentId);
  if (idx < 0 || idx >= steps.length - 1) return null;
  return steps[idx + 1].id;
}

export function getPrevStepId(steps: StepMeta[], currentId: StepId): StepId | null {
  const idx = getStepIndex(steps, currentId);
  if (idx <= 0) return null;
  return steps[idx - 1].id;
}

export const PROVINCES = ['ON', 'BC', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'NT', 'NU', 'YT'];

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function trackApplicationEvent(event: string, detail?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return;
  const safe = { event, ...detail };
  window.dispatchEvent(new CustomEvent('ah-analytics', { detail: safe }));
  if (typeof window.gtag === 'function') {
    window.gtag('event', event, detail);
  }
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
