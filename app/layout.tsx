import { cn } from '@/lib/utils';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import IconGithub from '~icons/radix-icons/github-logo';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'M3U8 Downloader',
  description: 'Download M3U8 videos from the internet',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='pt-BR'>
      <body
        className={cn(
          inter.className,
          'grid h-screen grid-rows-[auto,_1fr,_auto]',
        )}
      >
        <header className='border-b p-3'>M3U8 Downloader</header>

        <main className='p-3'>{children}</main>

        <footer className='border-t p-3'>
          Developed by{' '}
          <a
            href='https://www.github.com/marcosvnmelo'
            target='_blank'
            className='underline'
          >
            Marcos Vinícius
            <IconGithub className='ml-1 inline-block h-5 w-5' />
          </a>
        </footer>
      </body>
    </html>
  );
}
