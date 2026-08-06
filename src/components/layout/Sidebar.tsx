'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Tổng quan', icon: 'home', href: '/dashboard' },
  { label: 'Quản lý học viên', icon: 'school', href: '/students' },
  { label: 'Quản lý giáo viên', icon: 'co_present', href: '/teachers' },
  { label: 'Học phí & Công nợ', icon: 'payments', href: '/tuition' },
  { label: 'Báo cáo tài chính', icon: 'analytics', href: '/reports' },
];

const BOTTOM_NAV = [{ label: 'Cài đặt', icon: 'settings', href: '/settings' }];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <aside className="fixed left-0 top-0 h-full w-sidebar glass-sidebar z-50 flex flex-col shadow-sidebar">
      {/* Logo */}
      <div className="h-16 flex items-center px-lg gap-sm border-b border-outline-variant/20">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-md">
          <span className="material-symbols-outlined text-on-primary text-[18px]">bolt</span>
        </div>
        <div>
          <span className="font-headline-md text-[18px] font-bold text-primary tracking-tight">StepUp</span>
          <p className="text-[10px] text-on-surface-variant font-label-sm leading-none mt-0.5">English Center</p>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-sm py-md space-y-xs overflow-y-auto">
        <p className="text-label-sm text-on-surface-variant/60 uppercase tracking-wider px-md mb-sm">
          Quản lý
        </p>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${active ? 'nav-link-active' : ''}`}
            >
              <span
                className={`material-symbols-outlined text-[20px] transition-transform group-hover:scale-110 ${
                  active ? 'text-primary' : 'text-on-surface-variant'
                }`}
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="text-body-md font-medium">{item.label}</span>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}

        <div className="border-t border-outline-variant/20 mt-md pt-md">
          <p className="text-label-sm text-on-surface-variant/60 uppercase tracking-wider px-md mb-sm">
            Hệ thống
          </p>
          {BOTTOM_NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${active ? 'nav-link-active' : ''}`}
              >
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <span className="text-body-md font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="px-sm py-md border-t border-outline-variant/20">
        <div className="flex items-center gap-sm p-sm rounded-xl hover:bg-surface-container-high cursor-pointer transition-colors group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-on-primary font-bold text-sm">A</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-body-md font-semibold text-on-surface truncate">Administrator</p>
            <p className="text-label-sm text-on-surface-variant truncate">admin@stepup.edu.vn</p>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant/60 text-[18px] group-hover:text-on-surface transition-colors">
            more_vert
          </span>
        </div>
      </div>
    </aside>
  );
}
