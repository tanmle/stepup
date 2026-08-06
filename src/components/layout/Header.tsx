'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

const BREADCRUMB_MAP: Record<string, string> = {
  '/dashboard': 'Tổng quan',
  '/students': 'Quản lý học viên',
  '/students/new': 'Thêm học viên',
  '/parents': 'Quản lý Phụ huynh',
  '/teachers': 'Quản lý giáo viên',
  '/classes': 'Quản lý Lớp học',
  '/schedule': 'Lịch dạy',
  '/tuition': 'Học phí & Công nợ',
  '/reports': 'Báo cáo tài chính',
  '/settings': 'Cài đặt',
};

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);

  const title = BREADCRUMB_MAP[pathname] ?? 'StepUp';

  return (
    <header className="fixed top-0 left-0 lg:left-sidebar right-0 h-16 glass-header z-40 flex items-center justify-between px-md lg:px-xl shadow-header transition-all duration-300">
      {/* Left: Search & Menu */}
      <div className="flex-1 flex items-center gap-sm">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-sm rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
        <div className="w-48 sm:w-64 md:w-96 hidden sm:block">
        <div className="relative flex items-center bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-2 transition-all duration-200 cursor-text group">
          <span className="material-symbols-outlined text-on-surface-variant mr-2 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm hoặc nhập lệnh..."
            className="text-on-surface text-body-md w-full bg-transparent border-none outline-none placeholder-on-surface-variant/70"
          />
          <div className="flex items-center gap-xs ml-sm">
            <kbd className="px-sm py-xs bg-surface-container-high border border-outline-variant/50 rounded-md text-[10px] text-on-surface-variant font-sans">
              ⌘
            </kbd>
            <kbd className="px-sm py-xs bg-surface-container-high border border-outline-variant/50 rounded-md text-[10px] text-on-surface-variant font-sans">
              K
            </kbd>
          </div>
        </div>
      </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-md ml-xl">
        {/* Notification */}
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative p-sm rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-surface animate-pulse-dot" />
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-outline-variant/30" />

        {/* Help */}
        <button className="p-sm rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined text-[22px]">help</span>
        </button>

        {/* Page title badge */}
        <div className="hidden lg:flex items-center gap-sm bg-surface-container px-md py-xs rounded-xl">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-label-sm text-on-surface-variant">{title}</span>
        </div>
      </div>
    </header>
  );
}
