import type { PaymentStatus, StudentStatus, TeacherStatus, ClassStatus } from '@/lib/types';

type AnyStatus = PaymentStatus | StudentStatus | TeacherStatus | ClassStatus | string;

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label?: string }> = {
  'Đang học': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Tạm nghỉ': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Đã nghỉ': { bg: 'bg-surface-container-high', text: 'text-on-surface-variant', dot: 'bg-outline-variant' },
  'Hoàn thành': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  'Nhận lớp': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500 animate-pulse' },
  'Kín lịch': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Nghỉ phép': { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' },
  'Đã thu đủ': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Sắp đến hạn': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Quá hạn': { bg: 'bg-error-container', text: 'text-on-error-container', dot: 'bg-error' },
  'Chưa đến hạn': { bg: 'bg-surface-container-low', text: 'text-on-surface-variant', dot: 'bg-outline-variant' },
  'Sắp mở': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  'Đã kết thúc': { bg: 'bg-surface-container-high', text: 'text-on-surface-variant', dot: 'bg-outline-variant' },
  'HOÀN TẤT': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'ĐANG XỬ LÝ': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'CHỜ DUYỆT': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
};

interface StatusBadgeProps {
  status: AnyStatus;
  showDot?: boolean;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, showDot = true, size = 'sm' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { bg: 'bg-surface-container', text: 'text-on-surface-variant', dot: 'bg-outline' };

  return (
    <span
      className={`status-badge ${config.bg} ${config.text} ${
        size === 'md' ? 'px-md py-sm text-body-md' : 'px-sm py-xs text-label-sm'
      }`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      )}
      {status}
    </span>
  );
}
