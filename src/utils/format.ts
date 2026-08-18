/**
 * Lấy ra giá trị số từ chuỗi định dạng (loại bỏ dấu phẩy, chấm, khoảng trắng)
 */
export const parseNumber = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  // Loại bỏ tất cả các ký tự không phải số hoặc dấu âm
  const cleanValue = value.toString().replace(/[^0-9-]/g, '');
  return cleanValue ? parseInt(cleanValue, 10) : 0;
};

/**
 * Hiển thị số tiền với định dạng phân cách hàng nghìn, không kèm ký hiệu 'đ'
 * Ví dụ: 1000000 -> 1.000.000 (vi-VN sẽ dùng chấm làm phân cách hàng nghìn)
 */
export const formatNumber = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return '0';
  const num = parseNumber(value);
  if (isNaN(num)) return '0';
  return num.toLocaleString('vi-VN');
};

/**
 * Hiển thị số tiền với định dạng phân cách hàng nghìn và kèm ký hiệu 'đ'
 * Ví dụ: 1000000 -> 1.000.000đ
 */
export const formatVND = (value: string | number | undefined | null): string => {
  return `${formatNumber(value)}đ`;
};
