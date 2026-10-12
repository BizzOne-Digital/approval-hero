import { FinancingApplicationWizard } from '@/components/forms/application/FinancingApplicationWizard';
import { pageSeo } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  ...pageSeo({
    title: 'Vehicle Finance Application',
    description: 'Apply for vehicle financing with Approval Hero. Secure, step-by-step application with no obligation.',
    path: '/apply',
  }),
  robots: { index: true, follow: true },
};

export default async function ApplyPage() {
  return <FinancingApplicationWizard />;
}
