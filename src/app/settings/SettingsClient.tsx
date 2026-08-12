'use client';

import { useState } from 'react';
import { updateSettings } from './actions';

interface SettingsClientProps {
  initialSettings: any;
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('general');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setMessage('');
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      if (initialSettings?.id) {
        formData.append('id', initialSettings.id);
      }
      
      await updateSettings(formData);
      setMessage('Lưu cấu hình thành công!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-lg items-start">
      {/* Tabs / Sidebar */}
      <div className="w-full lg:w-64 flex flex-col gap-xs flex-shrink-0">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-sm p-sm rounded-lg text-left transition-colors ${
            activeTab === 'general'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">business</span>
          <span className="font-medium text-body-md">Thông tin chung</span>
        </button>
        
        <button
          onClick={() => setActiveTab('receipt')}
          className={`flex items-center gap-sm p-sm rounded-lg text-left transition-colors ${
            activeTab === 'receipt'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          <span className="font-medium text-body-md">Mẫu biên lai</span>
        </button>
      </div>

      {/* Content Form */}
      <div className="card p-lg flex-1 w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
          
          {activeTab === 'general' && (
            <div className="flex flex-col gap-md animate-fade-in">
              <h2 className="text-title-md text-on-background border-b border-outline-variant/30 pb-xs mb-xs">
                Thông tin trung tâm
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-1 block">Tên trung tâm</label>
                  <input
                    name="center_name"
                    defaultValue={initialSettings?.center_name || ''}
                    placeholder="VD: StepUp English"
                    required
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-1 block">Số điện thoại Hotline</label>
                  <input
                    name="phone"
                    defaultValue={initialSettings?.phone || ''}
                    placeholder="VD: 0987 654 321"
                    className="input-field w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-label-sm text-on-surface-variant mb-1 block">Địa chỉ</label>
                  <input
                    name="address"
                    defaultValue={initialSettings?.address || ''}
                    placeholder="Nhập địa chỉ trung tâm"
                    className="input-field w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-label-sm text-on-surface-variant mb-1 block">Email liên hệ</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={initialSettings?.email || ''}
                    placeholder="contact@example.com"
                    className="input-field w-full"
                  />
                </div>
              </div>

              <h2 className="text-title-md text-on-background border-b border-outline-variant/30 pb-xs mt-md mb-xs">
                Thông tin thanh toán chuyển khoản
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-1 block">Tên Ngân hàng</label>
                  <select
                    name="bank_name"
                    defaultValue={initialSettings?.bank_name || 'Vietcombank'}
                    className="input-field w-full"
                  >
                    <option value="Vietcombank">Vietcombank</option>
                    <option value="MBBank">MBBank (Ngân hàng Quân đội)</option>
                    <option value="Techcombank">Techcombank</option>
                    <option value="VietinBank">VietinBank</option>
                    <option value="BIDV">BIDV</option>
                    <option value="Agribank">Agribank</option>
                    <option value="ACB">ACB</option>
                    <option value="VPBank">VPBank</option>
                    <option value="TPBank">TPBank</option>
                    <option value="VIB">VIB</option>
                    <option value="Sacombank">Sacombank</option>
                    <option value="SCB">SCB</option>
                    <option value="OCB">OCB</option>
                    <option value="Eximbank">Eximbank</option>
                    <option value="HDBank">HDBank</option>
                    <option value="LienVietPostBank">LienVietPostBank</option>
                    <option value="DongABank">DongA Bank</option>
                    <option value="SeABank">SeABank</option>
                    <option value="SHB">SHB</option>
                    <option value="MSB">MSB</option>
                    <option value="NamABank">Nam A Bank</option>
                  </select>
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-1 block">Tên Chủ Tài Khoản</label>
                  <input
                    name="bank_owner"
                    defaultValue={initialSettings?.bank_owner || ''}
                    placeholder="VD: NGUYEN VAN A"
                    className="input-field w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-label-sm text-on-surface-variant mb-1 block">Số Tài Khoản</label>
                  <input
                    name="bank_account"
                    defaultValue={initialSettings?.bank_account || ''}
                    placeholder="VD: 1234567890"
                    className="input-field w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'receipt' && (
            <div className="flex flex-col gap-md animate-fade-in">
              <h2 className="text-title-md text-on-background border-b border-outline-variant/30 pb-xs mb-xs">
                Cấu hình in Biên lai
              </h2>
              <div>
                <label className="text-label-sm text-on-surface-variant mb-1 block">Ghi chú chân biên lai</label>
                <textarea
                  name="receipt_note"
                  defaultValue={initialSettings?.receipt_note || 'Học phí đã đóng không được hoàn trả dưới mọi hình thức.'}
                  rows={4}
                  className="input-field w-full resize-none"
                  placeholder="Nhập những quy định hoặc lưu ý muốn in ở dưới cùng tờ biên lai..."
                />
                <p className="text-label-sm text-on-surface-variant mt-1">Dòng chữ này sẽ xuất hiện ở dưới cùng của mọi tờ biên lai thu tiền.</p>
              </div>
              
              {/* Maintain other fields in hidden inputs so formData doesn't lose them when tab switches */}
              <div className="hidden">
                <input name="center_name" defaultValue={initialSettings?.center_name || ''} />
                <input name="phone" defaultValue={initialSettings?.phone || ''} />
                <input name="email" defaultValue={initialSettings?.email || ''} />
                <input name="address" defaultValue={initialSettings?.address || ''} />
                <input name="bank_name" defaultValue={initialSettings?.bank_name || ''} />
                <input name="bank_account" defaultValue={initialSettings?.bank_account || ''} />
                <input name="bank_owner" defaultValue={initialSettings?.bank_owner || ''} />
              </div>
            </div>
          )}

          <div className="flex items-center gap-md mt-md">
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            
            {message && <span className="text-emerald-600 text-body-sm font-medium animate-fade-in">{message}</span>}
            {error && <span className="text-error text-body-sm font-medium animate-fade-in">{error}</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
