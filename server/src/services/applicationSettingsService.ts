import { ApplicationSettings, IApplicationSettings } from '../models/ApplicationSettings';

export const DEFAULT_APPLICATION_SETTINGS = {
  version: '1.0.0',
  vehicleTypes: [
    { id: 'sedan', label: 'Sedan', imageUrl: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600', enabled: true },
    { id: 'suv', label: 'SUV / Crossover', imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600', enabled: true },
    { id: 'truck', label: 'Truck', imageUrl: '/images/vehicles/truck-highway.png', enabled: true },
    { id: 'coupe', label: 'Coupe', imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600', enabled: true },
    { id: 'hatchback', label: 'Hatchback', imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600', enabled: true },
    { id: 'minivan', label: 'Minivan', imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600', enabled: true },
    { id: 'not-sure', label: 'Not Sure', imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600', enabled: true },
  ],
  downPaymentOptions: [
    { id: '0', label: '$0', enabled: true },
    { id: '500-1000', label: '$500–$1,000', enabled: true },
    { id: '1000-2500', label: '$1,000–$2,500', enabled: true },
    { id: '2500-5000', label: '$2,500–$5,000', enabled: true },
    { id: '5000+', label: '$5,000+', enabled: true },
    { id: 'not-sure', label: 'Not Sure', enabled: true },
  ],
  creditCategories: [
    { id: 'good', label: 'Good — approximately 650+', enabled: true },
    { id: 'fair', label: 'Fair — approximately 550–650', enabled: true },
    { id: 'challenging', label: 'Challenging — below approximately 550', enabled: true },
    { id: 'bankruptcy', label: 'Current or Previous Bankruptcy', enabled: true },
    { id: 'proposal', label: 'Consumer Proposal', enabled: true },
    { id: 'no-credit', label: 'No Established Credit', enabled: true },
    { id: 'denied', label: 'Previous Financing Denial', enabled: true },
    { id: 'not-sure', label: 'Not Sure', enabled: true },
  ],
  purchaseTimelines: [
    { id: '7-days', label: 'Within 7 Days', enabled: true },
    { id: '2-weeks', label: 'Within 2 Weeks', enabled: true },
    { id: '30-days', label: 'Within 30 Days', enabled: true },
    { id: '1-3-months', label: 'Within 1–3 Months', enabled: true },
    { id: 'exploring', label: 'Just Exploring My Options', enabled: true },
  ],
  residencyStatuses: [
    { id: 'citizen', label: 'Canadian Citizen', enabled: true },
    { id: 'permanent-resident', label: 'Permanent Resident', enabled: true },
    { id: 'work-permit', label: 'Work Permit', enabled: true },
    { id: 'student-visa', label: 'Student Visa', enabled: true },
    { id: 'visitor', label: 'Visitor', enabled: true },
    { id: 'other', label: 'Other / Prefer to Discuss', enabled: true },
  ],
  employmentStatuses: [
    { id: 'full-time', label: 'Employed Full-Time', enabled: true },
    { id: 'part-time', label: 'Employed Part-Time', enabled: true },
    { id: 'self-employed', label: 'Self-Employed', enabled: true },
    { id: 'retired', label: 'Retired / Pension', enabled: true },
    { id: 'other-income', label: 'Other Income', enabled: true },
    { id: 'not-employed', label: 'Currently Not Employed', enabled: true },
    { id: 'prefer-discuss', label: 'Prefer to Discuss', enabled: true },
  ],
  incomeRanges: [
    { id: 'below-2000', label: 'Below $2,000', enabled: true },
    { id: '2000-3000', label: '$2,000–$3,000', enabled: true },
    { id: '3000-4000', label: '$3,000–$4,000', enabled: true },
    { id: '4000-5000', label: '$4,000–$5,000', enabled: true },
    { id: '5000+', label: '$5,000+', enabled: true },
    { id: 'prefer-discuss', label: 'Prefer to Discuss', enabled: true },
  ],
  incomeDurations: [
    { id: 'lt-3-months', label: 'Less Than 3 Months', enabled: true },
    { id: '3-months-1-year', label: '3 Months–1 Year', enabled: true },
    { id: '1-2-years', label: '1–2 Years', enabled: true },
    { id: '2-plus-years', label: '2+ Years', enabled: true },
  ],
  contactMethods: [
    { id: 'phone', label: 'Phone', enabled: true },
    { id: 'text', label: 'Text', enabled: true },
    { id: 'email', label: 'Email', enabled: true },
  ],
  bestTimeOptions: [
    { id: 'morning', label: 'Morning', enabled: true },
    { id: 'afternoon', label: 'Afternoon', enabled: true },
    { id: 'evening', label: 'Evening', enabled: true },
    { id: 'anytime', label: 'Anytime', enabled: true },
  ],
  consentWording: {
    accuracy: 'I confirm that the information provided is accurate.',
    contact: 'I consent to being contacted about my application.',
    privacy: 'I have reviewed the Privacy Policy.',
    partnerShare: 'I authorize Approval Hero to share my application with relevant dealer or lending partners as described in the consent wording.',
    marketing: 'I would like to receive promotional updates.',
    version: '1.0.0',
  },
  successMessage: {
    heading: 'Your Application Has Been Received',
    body: 'An Approval Hero representative will review your information and contact you regarding the next steps. Submission does not guarantee financing approval.',
    expectedResponseTime: 'We typically respond within one business day.',
  },
  trustIndicators: ['Secure & Encrypted', 'No SIN Required', 'No Credit Check During Application'],
  downPaymentDisclaimer: '$0 down options may be available to qualified applicants. Eligibility and lender conditions apply.',
  privacyNotice: 'Your information is handled securely and used only to process your financing application.',
  dataRetentionDays: 365,
};

export async function getApplicationSettings() {
  let settings = await ApplicationSettings.findOne();
  if (!settings) {
    settings = await ApplicationSettings.create(DEFAULT_APPLICATION_SETTINGS);
  }
  return settings;
}
