'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { deleteClass } from './actions';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination from '@/components/ui/Pagination';

const ITEMS_PER_PAGE = 8;
const STATUS_OPTIONS = ['Tất cả', 'Sắp mở', 'Đang học', 'Đã kết thúc'];

const COLOR_MAP: Record<string, string> = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  secondary: 'bg-amber-50 text-amber-700 border-amber-200',
  tertiary: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  error: 'bg-error/10 text-error border-error/20',
};

interface ClassesClientProps {
  initialClasses: any[];
}

export default function ClassesClient({ initialClasses }: ClassesClientProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [classesList, setClassesList] = useState(initialClasses);
  useEffect(() => {
    setClassesList(initialClasses);
  }, [initialClasses]);

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa lớp học này? Mọi lịch học liên quan sẽ bị xóa.')) {
      setClassesList(prev => prev.filter(c => c.id !== id));
      
      startTransition(async () => {
        try {
          await deleteClass(id);
          router.refresh();
        } catch (error) {
          setClassesList(initialClasses);
          alert('Xóa thất bại. Vui lòng thử lại.');
        }
      });
    }
  };

  const filtered = useMemo(() => {
    return classesList.filter((c: any) => {
      const matchSearch =
        !search ||
        (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.code || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.teacherName || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'Tất cả' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [classesList, search, statusFilter]);

  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  return (
    <div className="flex flex-col gap-md pb-xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg text-on-background">Quản lý Lớp học</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Tổng cộng <span className="font-semibold text-primary">{classesList.length}</span> lớp học
          </p>
        </div>
        <div className="flex gap-sm">
          <Link href="/classes/new" className="btn-primary">
            <span className="material-symbols-outlined text-[16px]">add</span>
            Mở lớp mới
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-sm flex flex-col md:flex-row gap-sm items-center justify-between">
        <div className="relative w-full md:w-96 flex-shrink-0">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên, mã lớp, giáo viên..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-xl pr-md py-sm bg-surface-container hover:bg-surface-container-high focus:bg-surface transition-colors rounded-xl outline-none text-body-md text-on-surface placeholder:text-on-surface-variant/60"
          />
        </div>
        <div className="flex gap-xs overflow-x-auto w-full md:w-auto hide-scrollbar">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`px-md py-xs rounded-full text-label-sm whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-secondary-container text-on-secondary-container font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="card overflow-hidden">
        {/* Desktop Table View */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                {['Tên lớp', 'Giáo viên', 'Chương trình', 'Phòng học', 'Sĩ số', 'Lịch học', 'Ngày bắt đầu', 'Ngày kết thúc', 'Trạng thái', ''].map((h) => (
                  <th key={h} className="px-md py-md text-left text-label-sm text-on-surface-variant uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {paginated.map((c: any) => (
                <tr key={c.id} className="hover:bg-primary/[0.02] transition-colors group">
                  <td className="px-md py-md">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-xs">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${COLOR_MAP[c.colorKey] || COLOR_MAP['primary']}`}>
                          {c.code}
                        </span>
                      </div>
                      <span className="font-semibold text-body-md text-on-background mt-1">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-md py-md">
                    <div className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">person</span>
                      <span className="text-body-md text-on-surface">{c.teacherName}</span>
                    </div>
                  </td>
                  <td className="px-md py-md text-body-md text-on-surface-variant">{c.program}</td>
                  <td className="px-md py-md text-body-md text-on-surface-variant">{c.roomName}</td>
                  <td className="px-md py-md">
                    <p className="text-body-md font-semibold text-on-background">{c.enrolled}/{c.capacity}</p>
                    <div className="progress-bar mt-xs w-16">
                      <div className="progress-bar-fill bg-primary" style={{ width: `${(c.enrolled / c.capacity) * 100}%` }} />
                    </div>
                  </td>
                  <td className="px-md py-md text-body-md text-on-surface-variant">{c.schedule}</td>
                  <td className="px-md py-md text-body-md text-on-surface-variant">{c.startDate ? new Date(c.startDate).toLocaleDateString('vi-VN') : '—'}</td>
                  <td className="px-md py-md text-body-md text-on-surface-variant">{c.endDate ? new Date(c.endDate).toLocaleDateString('vi-VN') : '—'}</td>
                  <td className="px-md py-md">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-md py-md">
                    <div className="flex gap-xs opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                      <button 
                        onClick={() => router.push('/classes/' + c.id)}
                        className="p-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                        disabled={isPending}
                        className="p-xs text-error hover:bg-error-container/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Xóa lớp học"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-xl text-on-surface-variant">Không tìm thấy lớp học nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemLabel="lớp học"
        />
      </div>
    </div>
  );
}
