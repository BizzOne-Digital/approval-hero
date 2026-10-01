import { FinancingApplicationWizard } from '@/components/forms/application/FinancingApplicationWizard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vehicle Finance Application',
  description: 'Apply for vehicle financing with Approval Hero. Secure, step-by-step application with no obligation.',
  robots: { index: true, follow: true },
};

export default async function ApplyPage() {
  return <FinancingApplicationWizard />;
}
