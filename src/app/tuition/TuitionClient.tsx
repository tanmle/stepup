'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import { createPortal } from 'react-dom';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination from '@/components/ui/Pagination';
import { collectTuition } from './actions';

const ITEMS_PER_PAGE = 10;
const STATUS_FILTERS = ['Tất cả', 'Đã thu đủ', 'Sắp đến hạn', 'Quá hạn'];

interface TuitionClientProps {
  initialRecords: any[];
  kpi: {
    expectedTotal: number;
    collected: number;
    overdueDebt: number;
    upcomingDebt: number;
  };
  settings?: any;
}

export default function TuitionClient({ initialRecords, kpi, settings }: TuitionClientProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  
  // Modal state
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Chuyển khoản');
  const [payNote, setPayNote] = useState('');

  const openCollectModal = (record: any) => {
    if (record.amountOwed <= 0) return;
    setSelectedRecord(record);
    setPayAmount(record.amountOwed.toString());
    setPayMethod('Chuyển khoản');
    setPayNote('');
    setCollectModalOpen(true);
  };

  const openReceiptModal = (record: any) => {
    setSelectedRecord(record);
    setReceiptModalOpen(true);
  };

  const handleCollect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    
    const formData = new FormData();
    formData.append('id', selectedRecord.id);
    formData.append('amount', payAmount);
    formData.append('method', payMethod);
    formData.append('note', payNote);

    startTransition(async () => {
      try {
        await collectTuition(formData);
        setCollectModalOpen(false);
        setReceiptModalOpen(true); // Open receipt after success
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    // Generate CSV content
    const headers = ['Học viên', 'Mã HV', 'Lớp học', 'Tổng học phí', 'Đã nộp', 'Còn nợ', 'Hạn nộp', 'Trạng thái'];
    
    // We export the filtered records to match what the user is currently viewing
    const rows = filtered.map(r => [
      `"${r.student.fullName}"`,
      `"${r.student.code || ''}"`,
      `"${r.className}"`,
      r.totalTuition,
      r.amountPaid,
      r.amountOwed,
      `"${r.dueDate}"`,
      `"${r.status}"`
    ]);

    // \uFEFF is the Byte Order Mark (BOM) to force Excel to read UTF-8 correctly
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + 
      headers.join(",") + "\n" + 
      rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bao-cao-cong-no-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    return initialRecords.filter((r) => {
      const matchSearch =
        !search ||
        r.student.fullName.toLowerCase().includes(search.toLowerCase()) ||
        (r.student.code && r.student.code.toLowerCase().includes(search.toLowerCase())) ||
        r.className.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'Tất cả' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter, initialRecords]);

  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  const collectedPct = kpi.expectedTotal ? Math.round((kpi.collected / kpi.expectedTotal) * 100) : 0;

  const KPI_CARDS = [
    {
      label: 'Tổng học phí dự thu',
      value: kpi.expectedTotal,
      icon: 'account_balance_wallet',
      color: 'text-primary',
      bg: 'bg-primary/5',
      sub: `${collectedPct}% đã thu`,
      progress: collectedPct,
    },
    {
      label: 'Đã thu',
      value: kpi.collected,
      icon: 'check_circle',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Công nợ quá hạn',
      value: kpi.overdueDebt,
      icon: 'warning',
      color: 'text-error',
      bg: 'bg-error-container',
      isError: true,
    },
    {
      label: 'Sắp đến hạn',
      value: kpi.upcomingDebt,
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
          <button className="btn-secondary" onClick={handleExportExcel}>
            <span className="material-symbols-outlined text-[16px]">table_view</span>
            Xuất Excel
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
                <button 
                  className="text-primary font-label-sm flex items-center gap-1 disabled:opacity-50"
                  onClick={() => openCollectModal(record)}
                  disabled={record.amountOwed <= 0}
                >
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
                        onClick={() => openReceiptModal(record)}
                      >
                        <span className="material-symbols-outlined text-[18px]">receipt</span>
                      </button>
                      <button
                        title="Thu học phí"
                        className="p-xs text-on-surface-variant hover:bg-surface-container rounded-lg hover:text-emerald-600 transition-colors disabled:opacity-50"
                        onClick={() => openCollectModal(record)}
                        disabled={record.amountOwed <= 0}
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

      {/* Collect Modal */}
      {collectModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-md bg-neutral-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-[95vw] max-w-[450px] flex flex-col max-h-[90vh] overflow-hidden text-gray-800">
            <div className="p-md border-b flex justify-between items-center bg-gray-50 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-800">Thu Học Phí</h2>
              <button type="button" onClick={() => setCollectModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCollect} className="p-md flex flex-col gap-md">
              <div>
                <p className="text-label-sm text-on-surface-variant mb-1">Học viên</p>
                <p className="text-body-lg font-medium">{selectedRecord.student.fullName}</p>
                <p className="text-label-sm text-on-surface-variant">Lớp: {selectedRecord.className}</p>
              </div>
              
              <div className="bg-primary/5 p-sm rounded-lg flex justify-between">
                <span className="text-on-surface-variant">Còn nợ:</span>
                <span className="font-bold text-primary">{selectedRecord.amountOwed.toLocaleString('vi-VN')}đ</span>
              </div>

              <div>
                <label className="text-label-sm text-on-surface-variant mb-1 block">Số tiền thu</label>
                <input 
                  type="number" 
                  className="input-field w-full"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  max={selectedRecord.amountOwed}
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="text-label-sm text-on-surface-variant mb-1 block">Phương thức</label>
                <select 
                  className="input-field w-full"
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                >
                  <option value="Chuyển khoản">Chuyển khoản</option>
                  <option value="Tiền mặt">Tiền mặt</option>
                </select>
              </div>

              <div>
                <label className="text-label-sm text-on-surface-variant mb-1 block">Ghi chú</label>
                <input 
                  type="text" 
                  className="input-field w-full"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="Nhập ghi chú (không bắt buộc)"
                />
              </div>

              <div className="flex justify-end gap-sm mt-sm">
                <button type="button" className="btn-secondary" onClick={() => setCollectModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary" disabled={isPending}>
                  {isPending ? 'Đang xử lý...' : 'Xác nhận thu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-md bg-neutral-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-[95vw] max-w-[450px] flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-md border-b flex justify-between items-center bg-gray-50 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-800">Biên Lai Thu Tiền</h2>
              <button onClick={() => setReceiptModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-xl flex flex-col gap-md overflow-y-auto bg-white text-black flex-1 min-h-0">
              <div className="text-center border-b border-dashed border-gray-300 pb-md mb-md">
                <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">{settings?.center_name || 'STEPUP ENGLISH'}</h1>
                <p className="text-sm text-gray-600">Hotline: {settings?.phone || '0987 654 321'}</p>
                <p className="text-sm text-gray-600">Website: {settings?.email || 'stepup.edu.vn'}</p>
                <p className="text-sm text-gray-600 mb-1">{settings?.address || '123 Đường ABC, Quận X'}</p>
                <h2 className="text-xl font-bold mt-md uppercase">Biên Lai Thu Học Phí</h2>
                <p className="text-xs text-gray-500 mt-1">Ngày in: {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN')}</p>
              </div>

              <div className="space-y-sm text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Học viên:</span>
                  <span className="font-semibold uppercase">{selectedRecord.student.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã HV:</span>
                  <span>{selectedRecord.student.code || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lớp học:</span>
                  <span className="font-semibold">{selectedRecord.className}</span>
                </div>
              </div>

              <div className="mt-md text-sm">
                <p className="font-semibold text-gray-800 mb-xs">Thông tin chuyển khoản:</p>
                <div className="bg-gray-50 p-sm rounded border border-gray-200 grid grid-cols-[1fr_auto] gap-md items-center" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                  <div className="space-y-1">
                    <p><span className="text-gray-600">Ngân hàng:</span> <span className="font-medium">{settings?.bank_name || 'Vietcombank'}</span></p>
                    <p><span className="text-gray-600">Số tài khoản:</span> <span className="font-medium text-primary">{settings?.bank_account || '1234567890'}</span></p>
                    <p><span className="text-gray-600">Chủ tài khoản:</span> <span className="font-medium">{settings?.bank_owner || 'NGUYEN VAN A'}</span></p>
                  </div>
                  <div className="w-32 h-32 bg-white rounded-lg p-1 border border-gray-200 block">
                    <img 
                      src={`https://img.vietqr.io/image/${settings?.bank_name || 'vietcombank'}-${settings?.bank_account || '1234567890'}-compact2.png?${selectedRecord.amountOwed > 0 ? `amount=${selectedRecord.amountOwed}&` : ''}addInfo=${encodeURIComponent('Hoc phi ' + (selectedRecord.student.code || ''))}&accountName=${encodeURIComponent(settings?.bank_owner || 'NGUYEN VAN A')}`}
                      alt="VietQR"
                      className="w-full h-full object-contain block"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-b border-dashed border-gray-300 py-md my-xs space-y-sm text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng học phí:</span>
                  <span>{selectedRecord.totalTuition.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Đã nộp:</span>
                  <span>{selectedRecord.amountPaid.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Khấu trừ/Giảm:</span>
                  <span>0 đ</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold">CÒN NỢ:</span>
                <span className="font-bold text-red-600">{selectedRecord.amountOwed.toLocaleString('vi-VN')} đ</span>
              </div>

              <div className="mt-xl text-center text-sm text-gray-500 italic">
                <p>{settings?.receipt_note || 'Học phí đã đóng không được hoàn trả dưới mọi hình thức.'}</p>
                <p className="mt-1 font-semibold">Cảm ơn quý phụ huynh đã tin tưởng {settings?.center_name || 'chúng tôi'}!</p>
              </div>
            </div>

            <div className="p-md border-t border-outline-variant/20 flex justify-end gap-sm bg-surface-container-low print:hidden flex-shrink-0">
              <button type="button" className="btn-secondary" onClick={() => setReceiptModalOpen(false)}>
                Đóng
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handlePrint}
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                In Biên Lai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Container injected into body */}
      {receiptModalOpen && selectedRecord && mounted && document.body && createPortal(
        <div id="print-root" className="hidden print:block w-full bg-white text-black p-8 max-w-2xl mx-auto">
          <div className="text-center border-b border-dashed border-gray-300 pb-md mb-md">
            <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">{settings?.center_name || 'STEPUP ENGLISH'}</h1>
            <p className="text-sm text-gray-600">Hotline: {settings?.phone || '0987 654 321'}</p>
            <p className="text-sm text-gray-600">Website: {settings?.email || 'stepup.edu.vn'}</p>
            <p className="text-sm text-gray-600 mb-1">{settings?.address || '123 Đường ABC, Quận X'}</p>
            <h2 className="text-xl font-bold mt-md uppercase">Biên Lai Thu Học Phí</h2>
            <p className="text-xs text-gray-500 mt-1">Ngày in: {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN')}</p>
          </div>

          <div className="space-y-sm text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Học viên:</span>
              <span className="font-semibold uppercase">{selectedRecord.student.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mã HV:</span>
              <span>{selectedRecord.student.code || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Lớp học:</span>
              <span className="font-semibold">{selectedRecord.className}</span>
            </div>
          </div>

          <div className="mt-md text-sm">
            <p className="font-semibold text-gray-800 mb-xs">Thông tin chuyển khoản:</p>
            <div className="bg-gray-50 p-sm rounded border border-gray-200 grid grid-cols-[1fr_auto] gap-md items-center" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
              <div className="space-y-1">
                <p><span className="text-gray-600">Ngân hàng:</span> <span className="font-medium">{settings?.bank_name || 'Vietcombank'}</span></p>
                <p><span className="text-gray-600">Số tài khoản:</span> <span className="font-medium text-primary">{settings?.bank_account || '1234567890'}</span></p>
                <p><span className="text-gray-600">Chủ tài khoản:</span> <span className="font-medium">{settings?.bank_owner || 'NGUYEN VAN A'}</span></p>
              </div>
              <div className="w-32 h-32 bg-white rounded-lg p-1 border border-gray-200 block">
                <img 
                  src={`https://img.vietqr.io/image/${settings?.bank_name || 'vietcombank'}-${settings?.bank_account || '1234567890'}-compact2.png?${selectedRecord.amountOwed > 0 ? `amount=${selectedRecord.amountOwed}&` : ''}addInfo=${encodeURIComponent('Hoc phi ' + (selectedRecord.student.code || ''))}&accountName=${encodeURIComponent(settings?.bank_owner || 'NGUYEN VAN A')}`}
                  alt="VietQR"
                  className="w-full h-full object-contain block"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-b border-dashed border-gray-300 py-md my-xs space-y-sm text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tổng học phí:</span>
              <span>{selectedRecord.totalTuition.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Đã nộp:</span>
              <span>{selectedRecord.amountPaid.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Khấu trừ/Giảm:</span>
              <span>0 đ</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-lg mt-md">
            <span className="font-semibold">CÒN NỢ:</span>
            <span className="font-bold text-red-600">{selectedRecord.amountOwed.toLocaleString('vi-VN')} đ</span>
          </div>

          <div className="mt-xl text-center text-sm text-gray-500 italic">
            <p>{settings?.receipt_note || 'Học phí đã đóng không được hoàn trả dưới mọi hình thức.'}</p>
            <p className="mt-1 font-semibold">Cảm ơn quý phụ huynh đã tin tưởng {settings?.center_name || 'chúng tôi'}!</p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
