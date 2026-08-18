import type { Metadata } from 'next';
import './globals.css';
import { identity } from '@data/profile';

export const metadata: Metadata = {
  title: `${identity.shortName} — ${identity.role}`,
  description: identity.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
