'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { deleteStudent } from './actions';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination from '@/components/ui/Pagination';

const ITEMS_PER_PAGE = 10;

const STATUS_FILTERS = ['Tất cả', 'Đang học', 'Tạm nghỉ', 'Đã nghỉ', 'Hoàn thành'];

interface StudentsClientProps {
  initialStudents: any[];
}

export default function StudentsPage({ initialStudents }: StudentsClientProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [studentsList, setStudentsList] = useState(initialStudents);
  useEffect(() => {
    setStudentsList(initialStudents);
  }, [initialStudents]);

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa học viên này? Hành động này không thể hoàn tác.')) {
      // Cập nhật giao diện ngay lập tức (Optimistic UI)
      setStudentsList(prev => prev.filter(s => s.id !== id));
      
      startTransition(async () => {
        try {
          await deleteStudent(id);
          router.refresh();
        } catch (error) {
          // Hoàn tác nếu có lỗi
          setStudentsList(initialStudents);
          alert('Xóa thất bại. Vui lòng thử lại.');
        }
      });
    }
  };

  const filtered = useMemo(() => {
    return studentsList.filter((s) => {
      const matchSearch =
        !search ||
        s.fullName.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase()) ||
        s.phone.includes(search);
      const matchStatus = statusFilter === 'Tất cả' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [studentsList, search, statusFilter]);

  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-md pb-xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg text-on-background">Quản lý học viên</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Tổng cộng{' '}
            <span className="font-semibold text-primary">{studentsList.length.toLocaleString('vi-VN')}</span> học viên
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
          <Link href="/students/new" className="btn-primary">
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            Thêm học viên
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card p-md flex items-center gap-md flex-wrap">
        {/* Search */}
        <div className="flex-1 min-w-60 relative">
          <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Tìm theo tên, mã HV, số điện thoại..."
            className="input-field pl-10"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-xs flex-wrap">
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
          {paginated.map((student) => (
            <div key={student.id} className="p-md flex flex-col gap-sm hover:bg-surface-container-low transition-colors cursor-pointer" onClick={() => window.location.href = `/students/${student.id}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  <div className={`w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center font-bold text-sm ${student.avatarColor}`}>
                    {student.avatarInitials}
                  </div>
                  <div>
                    <h3 className="text-body-lg font-semibold text-on-surface leading-tight">{student.fullName}</h3>
                    <p className="text-label-sm font-mono text-primary/80">{student.code}</p>
                  </div>
                </div>
                <StatusBadge status={student.status} />
              </div>
              <div className="grid grid-cols-2 gap-xs text-label-sm text-on-surface-variant mt-xs">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">phone</span>
                  {student.phone}
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">cake</span>
                  {student.dateOfBirth}
                </div>
                <div className="flex items-center gap-1 col-span-2">
                  <span className="material-symbols-outlined text-[14px]">family_restroom</span>
                  {student.parents[0]?.fullName ? `${student.parents[0].fullName} (${student.parents[0].phone || ''})` : '—'}
                </div>
                {student.enrolledClasses?.length > 0 && (
                  <div className="flex items-center gap-1 col-span-2 flex-wrap">
                    <span className="material-symbols-outlined text-[14px]">class</span>
                    {student.enrolledClasses.map((c: string) => (
                      <span key={c} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end border-t border-outline-variant/10 pt-sm mt-sm">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(student.id); }}
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
                <th className="w-12 px-lg py-md text-left">
                  <input type="checkbox" className="rounded border-outline-variant" />
                </th>
                <th className="px-md py-md text-left text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Mã HV
                </th>
                <th className="px-md py-md text-left text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Họ và tên
                </th>
                <th className="px-md py-md text-left text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Ngày sinh
                </th>
                <th className="px-md py-md text-left text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Lớp học
                </th>
                <th className="px-md py-md text-left text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-md py-md text-left text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Phụ huynh
                </th>
                <th className="w-12 px-md py-md" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {paginated.map((student) => (
                <tr
                  key={student.id}
                  className="group table-row-hover cursor-pointer"
                >
                  <td className="px-lg py-md" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(student.id)}
                      onChange={() => toggleSelect(student.id)}
                      className="rounded border-outline-variant opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </td>
                  <td className="px-md py-md">
                    <span className="font-mono text-label-sm text-primary bg-primary/5 px-sm py-xs rounded-md">
                      {student.code}
                    </span>
                  </td>
                  <td className="px-md py-md">
                    <Link href={`/students/${student.id}`} className="flex items-center gap-sm hover:text-primary transition-colors">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${student.avatarColor}`}
                      >
                        {student.avatarInitials}
                      </div>
                      <p className="text-body-md font-medium text-on-background group-hover:text-primary transition-colors">
                        {student.fullName}
                      </p>
                    </Link>
                  </td>
                  <td className="px-md py-md text-body-md text-on-surface-variant">{student.dateOfBirth}</td>
                  <td className="px-md py-md">
                    {student.enrolledClasses?.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {student.enrolledClasses.map((c: string) => (
                          <span key={c} className="text-[11px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md w-fit whitespace-nowrap">
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-body-md text-on-surface-variant">—</span>
                    )}
                  </td>
                  <td className="px-md py-md">
                    <StatusBadge status={student.status} />
                  </td>
                  <td className="px-md py-md text-body-md text-on-surface-variant">
                    {student.parents[0]?.fullName ?? '—'}
                  </td>
                  <td className="px-md py-md">
                    <div className="flex gap-xs opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                      <Link href={`/students/${student.id}`} className="p-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[18px]">person</span>
                      </Link>
                      <Link href={`/students/${student.id}/edit`} className="p-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </Link>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(student.id); }}
                        disabled={isPending}
                        className="p-xs text-error hover:bg-error-container/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Xóa học viên"
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
          itemLabel="học viên"
        />
      </div>
    </div>
  );
}
