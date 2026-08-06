import type { Metadata } from 'next';
import './globals.css';
import MainLayout from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: {
    default: 'StepUp English Center',
    template: '%s | StepUp',
  },
  description: 'Hệ thống quản lý trung tâm Anh ngữ StepUp — Quản lý học viên, giáo viên, học phí và báo cáo tài chính.',
  keywords: ['english center', 'trung tâm anh ngữ', 'quản lý học viên', 'stepup'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
