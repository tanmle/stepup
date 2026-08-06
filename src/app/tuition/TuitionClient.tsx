'use client';

import { useState, useMemo } from 'react';
import { TUITION_KPI } from '@/lib/data/tuition';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination from '@/components/ui/Pagination';

const ITEMS_PER_PAGE = 10;
const STATUS_FILTERS = ['Tất cả', 'Đã thu đủ', 'Sắp đến hạn', 'Quá hạn'];

interface TuitionClientProps {
  initialRecords: any[];
}

export default function TuitionClient({ initialRecords }: TuitionClientProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return initialRecords.filter((r) => {
      const matchSearch =
        !search ||
        r.student.fullName.toLowerCase().includes(search.toLowerCase()) ||
        r.student.code.toLowerCase().includes(search.toLowerCase()) ||
        r.className.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'Tất cả' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter, initialRecords]);

  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  const collectedPct = Math.round((TUITION_KPI.collected / TUITION_KPI.expectedTotal) * 100);

  const KPI_CARDS = [
    {
      label: 'Tổng học phí dự thu',
      value: TUITION_KPI.expectedTotal,
      icon: 'account_balance_wallet',
      color: 'text-primary',
      bg: 'bg-primary/5',
      sub: `${collectedPct}% đã thu`,
      progress: collectedPct,
    },
    {
      label: 'Đã thu',
      value: TUITION_KPI.collected,
      icon: 'check_circle',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Công nợ quá hạn',
      value: TUITION_KPI.overdueDebt,
      icon: 'warning',
      color: 'text-error',
      bg: 'bg-error-container',
      isError: true,
    },
    {
      label: 'Sắp đến hạn',
      value: TUITION_KPI.upcomingDebt,
      icon: 'schedule',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="flex flex-col gap-md pb-xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg text-on-background">Học phí & Công nợ</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">Theo dõi và quản lý học phí học viên</p>
        </div>
        <div className="flex gap-sm">
          <button className="btn-secondary">
            <span className="material-symbols-outlined text-[16px]">table_view</span>
            Xuất Excel
          </button>
          <button className="btn-primary">
            <span className="material-symbols-outlined text-[16px]">payments</span>
            Thu học phí
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        {KPI_CARDS.map((kpi, i) => (
          <div
            key={kpi.label}
            className={`card p-md ${kpi.isError ? 'border border-error/20' : ''}`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between mb-md">
              <span className="text-label-sm text-on-surface-variant">{kpi.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.bg}`}>
                <span className={`material-symbols-outlined text-[18px] ${kpi.color}`}>{kpi.icon}</span>
              </div>
            </div>
            <p className={`text-[22px] font-bold ${kpi.color} leading-tight`}>
              {(kpi.value / 1_000_000).toFixed(0)}M <span className="text-[14px] font-normal">đ</span>
            </p>
            {kpi.sub && <p className="text-label-sm text-on-surface-variant mt-xs">{kpi.sub}</p>}
            {kpi.progress !== undefined && (
              <div className="progress-bar mt-sm">
                <div className="progress-bar-fill bg-primary" style={{ width: `${kpi.progress}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-md flex items-center gap-md flex-wrap">
        <div className="flex-1 min-w-60 relative">
          <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Tìm theo tên học viên, mã HV, tên lớp..."
            className="input-field pl-10"
          />
        </div>
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
          {paginated.map((record) => (
            <div key={record.id} className={`p-md flex flex-col gap-sm transition-colors ${record.status === 'Quá hạn' ? 'bg-error-container/10' : 'hover:bg-surface-container-low'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-body-lg font-semibold text-on-surface leading-tight">{record.student.fullName}</h3>
                  <p className="text-label-sm text-on-surface-variant">Lớp: {record.className}</p>
                </div>
                <StatusBadge status={record.status} />
              </div>
              
              <div className="flex flex-col gap-xs mt-xs bg-surface-container-low p-sm rounded-lg">
                <div className="flex justify-between items-center text-label-sm">
                  <span className="text-on-surface-variant">Tổng học phí:</span>
                  <span className="font-medium text-on-surface">{record.totalTuition.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between items-center text-label-sm">
                  <span className="text-on-surface-variant">Đã nộp:</span>
                  <span className="font-medium text-primary">{record.amountPaid.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between items-center text-label-sm">
                  <span className="text-on-surface-variant">Còn nợ:</span>
                  <span className={`font-semibold ${record.amountOwed > 0 ? 'text-error' : 'text-emerald-600'}`}>{record.amountOwed.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-xs">
                <span className="text-label-sm text-on-surface-variant">
                  Hạn nộp: <span className={record.status === 'Quá hạn' ? 'text-error font-medium' : ''}>{record.dueDate}</span>
                </span>
                <button className="text-primary font-label-sm flex items-center gap-1">
                  Thu tiền <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                {['Học viên', 'Lớp học', 'Tổng học phí', 'Đã nộp', 'Còn nợ', 'Hạn nộp', 'Trạng thái', 'Thao tác'].map((h) => (
                  <th key={h} className="px-md py-md text-left text-label-sm text-on-surface-variant uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {paginated.map((record) => (
                <tr
                  key={record.id}
                  className={`group transition-colors ${
                    record.status === 'Quá hạn'
                      ? 'bg-error-container/10 hover:bg-error-container/15'
                      : 'table-row-hover'
                  }`}
                >
                  <td className="px-md py-md">
                    <div className="flex items-center gap-sm">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${record.student.avatarColor}`}>
                        {record.student.avatarInitials}
                      </div>
                      <div>
                        <p className="text-body-md font-medium text-on-background">{record.student.fullName}</p>
                        <span className="font-mono text-label-sm text-primary/70">{record.student.code}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-md py-md text-body-md text-on-surface">{record.className}</td>
                  <td className="px-md py-md text-body-md font-medium text-on-surface text-right">
                    {record.totalTuition.toLocaleString('vi-VN')}
                  </td>
                  <td className="px-md py-md text-body-md font-semibold text-emerald-600 text-right">
                    {record.amountPaid > 0 ? record.amountPaid.toLocaleString('vi-VN') : '—'}
                  </td>
                  <td className={`px-md py-md text-body-md font-semibold text-right ${
                    record.amountOwed > 0
                      ? record.status === 'Quá hạn' ? 'text-error' : 'text-amber-600'
                      : 'text-emerald-600'
                  }`}>
                    {record.amountOwed > 0 ? record.amountOwed.toLocaleString('vi-VN') : '✓'}
                  </td>
                  <td className={`px-md py-md text-body-md ${record.status === 'Quá hạn' ? 'text-error font-semibold' : 'text-on-surface-variant'}`}>
                    {record.dueDate}
                  </td>
                  <td className="px-md py-md">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="px-md py-md">
                    <div className="flex gap-xs">
                      <button
                        title="Xem biên lai"
                        className="p-xs text-on-surface-variant hover:bg-surface-container rounded-lg hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">receipt</span>
                      </button>
                      <button
                        title="Thu học phí"
                        className="p-xs text-on-surface-variant hover:bg-surface-container rounded-lg hover:text-emerald-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">add_card</span>
                      </button>
                      <button
                        title="Nhắc nộp tiền"
                        className="p-xs text-on-surface-variant hover:bg-surface-container rounded-lg hover:text-error transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">sms_failed</span>
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
