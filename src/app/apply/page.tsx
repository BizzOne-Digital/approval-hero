import { FinancingApplicationWizard } from '@/components/forms/application/FinancingApplicationWizard';
import { publicApi } from '@/lib/api';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vehicle Finance Application',
  description: 'Apply for vehicle financing with Approval Hero. Secure, step-by-step application with no obligation.',
  robots: { index: true, follow: true },
};

export default async function ApplyPage() {
  let settings;
  try {
    settings = await publicApi.getSettings();
  } catch {
    settings = undefined;
  }

  const phone = settings?.general?.phone || '416-700-2656';

  return <FinancingApplicationWizard phone={phone} />;
}
