'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { STUDENTS, TOTAL_STUDENTS } from '@/lib/data/students';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination from '@/components/ui/Pagination';

const ITEMS_PER_PAGE = 10;

const STATUS_FILTERS = ['Tất cả', 'Đang học', 'Tạm nghỉ', 'Đã nghỉ', 'Hoàn thành'];

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return STUDENTS.filter((s) => {
      const matchSearch =
        !search ||
        s.fullName.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase()) ||
        s.phone.includes(search);
      const matchStatus = statusFilter === 'Tất cả' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(TOTAL_STUDENTS / ITEMS_PER_PAGE));

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
            <span className="font-semibold text-primary">{TOTAL_STUDENTS.toLocaleString('vi-VN')}</span> học viên
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

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
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
                  Giới tính
                </th>
                <th className="px-md py-md text-left text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Số điện thoại
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
                      <div>
                        <p className="text-body-md font-medium text-on-background group-hover:text-primary transition-colors">
                          {student.fullName}
                        </p>
                        <p className="text-label-sm text-on-surface-variant">{student.email}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-md py-md text-body-md text-on-surface-variant">{student.dateOfBirth}</td>
                  <td className="px-md py-md">
                    <span
                      className={`px-sm py-xs rounded-md text-label-sm font-semibold ${
                        student.gender === 'Nam'
                          ? 'bg-blue-50 text-blue-700'
                          : student.gender === 'Nữ'
                          ? 'bg-pink-50 text-pink-700'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {student.gender}
                    </span>
                  </td>
                  <td className="px-md py-md">
                    <span className="font-mono text-body-md text-on-surface">{student.phone}</span>
                  </td>
                  <td className="px-md py-md">
                    <StatusBadge status={student.status} />
                  </td>
                  <td className="px-md py-md text-body-md text-on-surface-variant">
                    {student.parents[0]?.fullName ?? '—'}
                  </td>
                  <td className="px-md py-md">
                    <button className="p-xs text-on-surface-variant hover:bg-surface-container rounded-lg hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                      <span className="material-symbols-outlined text-[18px]">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={TOTAL_STUDENTS}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemLabel="học viên"
        />
      </div>
    </div>
  );
}
