import './globals.css';
import { Providers } from './providers';
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <Providers>
          {children}
        </Providers>
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      </body>
    </html>
  );
}