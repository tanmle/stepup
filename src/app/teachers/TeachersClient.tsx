'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { deleteTeacher } from './actions';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination from '@/components/ui/Pagination';

const ITEMS_PER_PAGE = 10;
const STATUS_FILTERS = ['Tất cả', 'Đang làm việc', 'Nghỉ phép', 'Nghỉ thai sản', 'Đã nghỉ việc'];
const TEACHER_KPIS = [
  { label: 'Tổng giáo viên', value: '45', sub: '+2 tháng này', icon: 'co_present', color: 'text-primary' },
  { label: 'Giáo viên IELTS', value: '28', sub: '62% tổng số', icon: 'school', color: 'text-primary' },
  { label: 'Giáo viên Giao tiếp', value: '17', sub: '38% tổng số', icon: 'record_voice_over', color: 'text-primary' },
  { label: 'Lịch trống tuần này', value: '12', sub: 'Cần xếp lớp sớm', icon: 'event_available', color: 'text-error' },
];

interface TeachersClientProps {
  initialTeachers: any[];
}

export default function TeachersClient({ initialTeachers }: TeachersClientProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [teachersList, setTeachersList] = useState(initialTeachers);
  useEffect(() => {
    setTeachersList(initialTeachers);
  }, [initialTeachers]);

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa giáo viên này? Hành động này không thể hoàn tác.')) {
      setTeachersList(prev => prev.filter(t => t.id !== id));
      
      startTransition(async () => {
        try {
          await deleteTeacher(id);
          router.refresh();
        } catch (error) {
          setTeachersList(initialTeachers);
          alert('Xóa thất bại. Vui lòng thử lại.');
        }
      });
    }
  };

  const filtered = useMemo(() => {
    return teachersList.filter((t: any) => {
      const matchSearch =
        !search ||
        t.fullName.toLowerCase().includes(search.toLowerCase()) ||
        t.code.toLowerCase().includes(search.toLowerCase()) ||
        t.specializations.some((s: any) => s.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'Tất cả' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [teachersList, search, statusFilter]);

  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  return (
    <div className="flex flex-col gap-md pb-xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg text-on-background">Quản lý giáo viên</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Tổng cộng <span className="font-semibold text-primary">{teachersList.length}</span> giáo viên
          </p>
        </div>
        <div className="flex gap-sm">
          <button className="btn-secondary">
            <span className="material-symbols-outlined text-[16px]">upload</span>
            Nhập Excel
          </button>
          <button className="btn-secondary">
            <span className="material-symbols-outlined text-[16px]">download</span>
            Xuất
          </button>
          <Link href="/teachers/new" className="btn-primary">
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            Thêm giáo viên
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        {TEACHER_KPIS.map((kpi, i) => (
          <div key={kpi.label} className="card p-md" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between mb-md">
              <span className="text-label-sm text-on-surface-variant">{kpi.label}</span>
              <span className={`material-symbols-outlined text-[20px] ${kpi.color}/70`}>{kpi.icon}</span>
            </div>
            <p className={`text-[28px] font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-label-sm text-on-surface-variant mt-xs">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="card p-md flex items-center gap-md flex-wrap">
        <div className="flex-1 min-w-60 relative">
          <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Tìm theo tên, mã GV, chuyên môn..."
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-xs">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setStatusFilter(f); setCurrentPage(1); }}
              className={`px-md py-xs rounded-full text-label-sm transition-all ${
                statusFilter === f
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List Container */}
      <div className="card overflow-hidden">
        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col divide-y divide-outline-variant/10">
          {paginated.map((teacher: any) => (
            <div key={teacher.id} className="p-md flex flex-col gap-sm hover:bg-surface-container-low transition-colors cursor-pointer" onClick={() => window.location.href = `/teachers/${teacher.id}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${teacher.avatarColor}`}>
                    {teacher.avatarInitials}
                  </div>
                  <div>
                    <h3 className="text-body-lg font-medium text-on-surface leading-tight">{teacher.fullName}</h3>
                    <p className="text-label-sm font-mono text-primary/80">{teacher.code}</p>
                  </div>
                </div>
                <StatusBadge status={teacher.status} />
              </div>
              <div className="flex flex-wrap gap-xs mt-xs">
                {teacher.specializations.slice(0, 2).map((s: any) => (
                  <span key={s} className="text-label-sm bg-secondary-container text-on-secondary-container px-sm py-xs rounded-full">
                    {s}
                  </span>
                ))}
                {teacher.certificates.slice(0, 1).map((c: any) => (
                  <span key={c} className="text-label-sm bg-primary/10 text-primary px-sm py-xs rounded-full">
                    {c}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between mt-xs text-label-sm text-on-surface-variant">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-amber-500">star</span>
                  {teacher.rating}
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">groups</span>
                  {teacher.currentClasses?.length || 0} lớp
                </div>
              </div>
              <div className="flex justify-end border-t border-outline-variant/10 pt-sm mt-sm">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(teacher.id); }}
                  disabled={isPending}
                  className="flex items-center gap-1 text-label-sm text-error hover:bg-error-container/20 px-sm py-xs rounded-lg transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                {['Giáo viên', 'Mã GV', 'Chuyên môn', 'Bằng cấp', 'Trạng thái', 'Đánh giá', 'Lớp hiện tại', ''].map((h) => (
                  <th key={h} className="px-md py-md text-left text-label-sm text-on-surface-variant uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {paginated.map((teacher: any) => (
                <tr key={teacher.id} className="group table-row-hover">
                  <td className="px-md py-md">
                    <Link href={`/teachers/${teacher.id}`} className="flex items-center gap-sm">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${teacher.avatarColor}`}
                      >
                        {teacher.avatarInitials}
                      </div>
                      <div>
                        <p className="text-body-md font-medium text-on-background group-hover:text-primary transition-colors">
                          {teacher.fullName}
                        </p>
                        <p className="text-label-sm text-on-surface-variant">{teacher.email}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-md py-md">
                    <span className="font-mono text-label-sm text-primary bg-primary/5 px-sm py-xs rounded-md">
                      {teacher.code}
                    </span>
                  </td>
                  <td className="px-md py-md">
                    <div className="flex flex-wrap gap-xs">
                      {teacher.specializations.slice(0, 2).map((s: any) => (
                        <span key={s} className="text-label-sm bg-secondary-container text-on-secondary-container px-sm py-xs rounded-full">
                          {s}
                        </span>
                      ))}
                      {teacher.certificates.slice(0, 1).map((c: any) => (
                        <span key={c} className="text-label-sm bg-primary/10 text-primary px-sm py-xs rounded-full">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-md py-md">
                    <p className="text-body-md text-on-surface">{teacher.degree}</p>
                    <p className="text-label-sm text-on-surface-variant">{teacher.institution?.split(',')[0] || ''}</p>
                  </td>
                  <td className="px-md py-md">
                    <StatusBadge status={teacher.status} />
                  </td>
                  <td className="px-md py-md">
                    <div className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-amber-400 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      <span className="text-body-md font-semibold text-on-background">{teacher.rating}</span>
                    </div>
                  </td>
                  <td className="px-md py-md">
                    <div className="flex flex-wrap gap-xs">
                      {teacher.currentClasses.slice(0, 2).map((cls: any) => (
                        <span key={cls.code} className="font-mono text-label-sm bg-surface-container px-sm py-xs rounded-md text-on-surface-variant">
                          {cls.code}
                        </span>
                      ))}
                      {teacher.currentClasses.length > 2 && (
                        <span className="text-label-sm bg-primary/10 text-primary px-sm py-xs rounded-full">
                          +{teacher.currentClasses.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-md py-md">
                    <div className="flex gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/teachers/${teacher.id}`} className="p-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[18px]">person</span>
                      </Link>
                      <Link href={`/teachers/${teacher.id}/edit`} className="p-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </Link>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(teacher.id); }}
                        disabled={isPending}
                        className="p-xs text-error hover:bg-error-container/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Xóa giáo viên"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemLabel="giáo viên"
        />
      </div>
    </div>
  );
}
