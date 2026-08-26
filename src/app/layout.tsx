import { Oswald, Inter } from 'next/font/google';
import { Providers } from '@/components/providers/Providers';
import { SmoothScroll } from '@/components/animations/SmoothScroll';
import { ApplyRouteWrapper } from '@/components/layout/ApplyRouteWrapper';
import './globals.css';

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'Approval Hero | Vehicle Financing Assistance',
    template: '%s | Approval Hero',
  },
  description: 'Approval Hero connects customers with dealer and lending partners who understand challenging credit situations.',
  icons: {
    icon: [{ url: '/images/favicon.png', type: 'image/png' }],
    apple: [{ url: '/images/favicon.png', type: 'image/png' }],
    shortcut: '/images/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${oswald.variable} ${inter.variable}`}>
      <body>
        <Providers>
          <SmoothScroll />
          <ApplyRouteWrapper>
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-electric text-white px-4 py-2 z-[100]">
              Skip to content
            </a>
            {children}
          </ApplyRouteWrapper>
        </Providers>
      </body>
    </html>
  );
}
