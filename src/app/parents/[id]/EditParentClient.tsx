'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateParent, updateParentCRM, addParentInteraction, linkStudentToParent, unlinkStudentFromParent } from '../actions';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatVND } from '@/utils/format';

interface EditParentClientProps {
  parent: any;
  allStudents: any[];
}

export default function EditParentClient({ parent, allStudents }: EditParentClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('personal'); // personal, students, tuition, interactions, crm
  const [isPending, startTransition] = useTransition();

  // Tab 2 Form
  const [showLinkStudentForm, setShowLinkStudentForm] = useState(false);
  const [linkStudentForm, setLinkStudentForm] = useState({
    studentId: '',
    relationship: 'Bố',
  });

  // Tab 1 Form
  const [personalForm, setPersonalForm] = useState({
    fullName: parent.fullName || '',
    phone: parent.phone || '',
    email: parent.email || '',
    prefChannel: parent.prefChannel || 'Zalo',
    job: parent.job || '',
    company: parent.company || '',
    jobTitle: parent.jobTitle || '',
    province: parent.province || '',
    district: parent.district || '',
    ward: parent.ward || '',
    address: parent.address || '',
    notes: parent.notes || '',
  });

  // Tab 4 Form
  const [interactionForm, setInteractionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Cuộc gọi',
    notes: '',
  });

  // Tab 5 Form
  const [crmForm, setCrmForm] = useState({
    source: parent.source || '',
    sourceNotes: parent.sourceNotes || '',
    crmStatus: parent.crmStatus || 'Tiềm năng',
    interestLevel: parent.interestLevel || 3,
  });

  const handlePersonalChange = (field: string, value: string) => setPersonalForm((prev) => ({ ...prev, [field]: value }));
  const handleInteractionChange = (field: string, value: string) => setInteractionForm((prev) => ({ ...prev, [field]: value }));
  const handleCrmChange = (field: string, value: string) => setCrmForm((prev) => ({ ...prev, [field]: value }));

  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(personalForm).forEach(([key, value]) => formData.append(key, value));
    
    startTransition(async () => {
      try {
        await updateParent(parent.id, formData);
        router.refresh();
        alert('Cập nhật thông tin thành công!');
      } catch (error) {
        alert('Lỗi cập nhật: ' + (error as Error).message);
      }
    });
  };

  const handleCrmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(crmForm).forEach(([key, value]) => formData.append(key, String(value)));
    
    startTransition(async () => {
      try {
        await updateParentCRM(parent.id, formData);
        router.refresh();
        alert('Cập nhật CRM thành công!');
      } catch (error) {
        alert('Lỗi cập nhật CRM: ' + (error as Error).message);
      }
    });
  };

  const handleInteractionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('parentId', parent.id);
    Object.entries(interactionForm).forEach(([key, value]) => formData.append(key, value));
    
    startTransition(async () => {
      try {
        await addParentInteraction(formData);
        router.refresh();
        setInteractionForm({ ...interactionForm, notes: '' });
        alert('Thêm tương tác thành công!');
      } catch (error) {
        alert('Lỗi thêm tương tác: ' + (error as Error).message);
      }
    });
  };

  const handleLinkStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkStudentForm.studentId) return;

    const formData = new FormData();
    formData.append('parentId', parent.id);
    formData.append('studentId', linkStudentForm.studentId);
    formData.append('relationship', linkStudentForm.relationship);

    startTransition(async () => {
      try {
        await linkStudentToParent(formData);
        router.refresh();
        setShowLinkStudentForm(false);
        setLinkStudentForm({ studentId: '', relationship: 'Bố' });
        alert('Liên kết học viên thành công!');
      } catch (error) {
        alert('Lỗi liên kết học viên: ' + (error as Error).message);
      }
    });
  };

  const handleUnlinkStudent = (studentId: string) => {
    if (!confirm('Bạn có chắc chắn muốn gỡ liên kết học viên này?')) return;
    
    startTransition(async () => {
      try {
        await unlinkStudentFromParent(parent.id, studentId);
        router.refresh();
        alert('Gỡ liên kết thành công!');
      } catch (error) {
        alert('Lỗi gỡ liên kết: ' + (error as Error).message);
      }
    });
  };

  const tabs = [
    { id: 'personal', label: 'Thông tin cá nhân', icon: 'person' },
    { id: 'students', label: 'Học viên liên kết', icon: 'school' },
    { id: 'tuition', label: 'Học phí (Công nợ)', icon: 'payments' },
    { id: 'interactions', label: 'Nhật ký tương tác', icon: 'history' },
    { id: 'crm', label: 'CRM & CSKH', icon: 'support_agent' },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-xl animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-xs text-label-sm text-on-surface-variant mb-lg">
        <Link href="/dashboard" className="hover:text-primary transition-colors">Trang chủ</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link href="/parents" className="hover:text-primary transition-colors">Quản lý phụ huynh</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-medium">{parent.fullName}</span>
      </nav>

      {/* Header Card */}
      <div className="card p-lg mb-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <div className="flex items-center gap-sm mb-xs">
            <h1 className="text-headline-sm text-on-background">{parent.fullName}</h1>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-label-sm font-medium border border-primary/20">
              {parent.crmStatus}
            </span>
            <div className="flex gap-1 text-warning">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`material-symbols-outlined text-[18px] ${i < parent.interestLevel ? 'filled' : 'opacity-30'}`}>
                  star
                </span>
              ))}
            </div>
          </div>
          <p className="text-body-md text-on-surface-variant flex items-center gap-md">
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">call</span> {parent.phone}</span>
            {parent.email && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">mail</span> {parent.email}</span>}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-outline-variant/30 mb-lg hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-md py-sm border-b-2 font-medium text-label-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card p-lg">
        {activeTab === 'personal' && (
          <form onSubmit={handlePersonalSubmit} className="space-y-md">
            <h2 className="text-title-md font-semibold text-on-background border-b border-outline-variant/20 pb-sm mb-md">
              Thông tin liên hệ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Họ và tên <span className="text-error">*</span></label>
                <input required value={personalForm.fullName} onChange={(e) => handlePersonalChange('fullName', e.target.value)} className="input-field w-full" />
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Số điện thoại <span className="text-error">*</span></label>
                <input required type="tel" value={personalForm.phone} onChange={(e) => handlePersonalChange('phone', e.target.value)} className="input-field w-full" />
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Email</label>
                <input type="email" value={personalForm.email} onChange={(e) => handlePersonalChange('email', e.target.value)} className="input-field w-full" />
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Kênh ưu tiên</label>
                <select value={personalForm.prefChannel} onChange={(e) => handlePersonalChange('prefChannel', e.target.value)} className="input-field w-full">
                  <option value="Zalo">Zalo</option>
                  <option value="Điện thoại">Điện thoại</option>
                  <option value="Email">Email</option>
                  <option value="Facebook">Facebook</option>
                </select>
              </div>
            </div>

            <h2 className="text-title-md font-semibold text-on-background border-b border-outline-variant/20 pb-sm mb-md mt-lg">
              Công việc & Địa chỉ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Nghề nghiệp</label>
                <input value={personalForm.job} onChange={(e) => handlePersonalChange('job', e.target.value)} className="input-field w-full" />
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Công ty</label>
                <input value={personalForm.company} onChange={(e) => handlePersonalChange('company', e.target.value)} className="input-field w-full" />
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Chức vụ</label>
                <input value={personalForm.jobTitle} onChange={(e) => handlePersonalChange('jobTitle', e.target.value)} className="input-field w-full" />
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Tỉnh/TP</label>
                <input value={personalForm.province} onChange={(e) => handlePersonalChange('province', e.target.value)} className="input-field w-full" />
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Quận/Huyện</label>
                <input value={personalForm.district} onChange={(e) => handlePersonalChange('district', e.target.value)} className="input-field w-full" />
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Phường/Xã</label>
                <input value={personalForm.ward} onChange={(e) => handlePersonalChange('ward', e.target.value)} className="input-field w-full" />
              </div>
              <div className="md:col-span-3">
                <label className="text-label-sm text-on-surface-variant mb-xs block">Địa chỉ chi tiết</label>
                <input value={personalForm.address} onChange={(e) => handlePersonalChange('address', e.target.value)} className="input-field w-full" />
              </div>
            </div>

            <div className="mt-md">
              <label className="text-label-sm text-on-surface-variant mb-xs block">Ghi chú nội bộ</label>
              <textarea value={personalForm.notes} onChange={(e) => handlePersonalChange('notes', e.target.value)} className="input-field w-full h-24 resize-none" />
            </div>

            <div className="flex items-center justify-end gap-sm mt-lg pt-md border-t border-outline-variant/20">
              <button type="submit" disabled={isPending || !personalForm.fullName || !personalForm.phone} className="btn-primary">
                {isPending ? 'Đang lưu...' : <><span className="material-symbols-outlined text-[16px]">save</span> Cập nhật</>}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'students' && (
          <div className="space-y-md">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-sm mb-md">
              <h2 className="text-title-md font-semibold text-on-background flex items-center gap-2">
                Danh sách học viên
              </h2>
              <button onClick={() => setShowLinkStudentForm(!showLinkStudentForm)} className="btn-secondary text-sm py-1.5 px-3">
                <span className="material-symbols-outlined text-[16px]">{showLinkStudentForm ? 'close' : 'add'}</span> {showLinkStudentForm ? 'Đóng' : 'Thêm học viên'}
              </button>
            </div>
            
            {showLinkStudentForm && (
              <form onSubmit={handleLinkStudentSubmit} className="bg-surface-container-low p-md rounded-xl border border-outline-variant/20 mb-md animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md items-end">
                  <div className="md:col-span-1">
                    <label className="text-label-sm text-on-surface-variant mb-xs block">Học viên <span className="text-error">*</span></label>
                    <select required value={linkStudentForm.studentId} onChange={(e) => setLinkStudentForm({ ...linkStudentForm, studentId: e.target.value })} className="input-field w-full">
                      <option value="">Chọn học viên...</option>
                      {allStudents.map(student => (
                        <option key={student.id} value={student.id}>{student.code} - {student.full_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-label-sm text-on-surface-variant mb-xs block">Quan hệ <span className="text-error">*</span></label>
                    <select required value={linkStudentForm.relationship} onChange={(e) => setLinkStudentForm({ ...linkStudentForm, relationship: e.target.value })} className="input-field w-full">
                      <option value="Bố">Bố</option>
                      <option value="Mẹ">Mẹ</option>
                      <option value="Ông">Ông</option>
                      <option value="Bà">Bà</option>
                      <option value="Người giám hộ">Người giám hộ</option>
                      <option value="Cô/chú">Cô/chú</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div>
                    <button type="submit" disabled={isPending || !linkStudentForm.studentId} className="btn-primary w-full">
                      {isPending ? 'Đang thêm...' : 'Liên kết'}
                    </button>
                  </div>
                </div>
              </form>
            )}
            
            {parent.students.length === 0 ? (
              <p className="text-body-md text-on-surface-variant text-center py-lg">Chưa có học viên nào liên kết.</p>
            ) : (
              <div className="space-y-sm">
                {parent.students.map((student: any) => (
                  <div key={student.id} className="relative group block">
                    <Link href={`/students/${student.id}`} className="block">
                      <div className="p-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors border border-outline-variant/10 group-hover:border-primary/30">
                        <div className="flex items-start gap-md">
                          <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-[18px] ${student.avatarColor}`}>
                            {student.avatarInitials}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="text-body-lg font-semibold text-on-background group-hover:text-primary transition-colors pr-8">{student.fullName}</p>
                              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                {student.relationship}
                              </span>
                            </div>
                            <p className="font-mono text-label-sm text-on-surface-variant mt-1 mb-2">{student.code}</p>
                            <div className="flex gap-2 items-center">
                              <StatusBadge status={student.status} size="sm" />
                              <span className="text-label-sm px-2 py-0.5 rounded-full bg-success/10 text-success">Đã đóng HP</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <button 
                      onClick={(e) => { e.preventDefault(); handleUnlinkStudent(student.id); }}
                      className="absolute top-2 right-2 p-1 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors z-10 opacity-0 group-hover:opacity-100"
                      title="Gỡ liên kết"
                      disabled={isPending}
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tuition' && (
          <div className="space-y-md">
             <h2 className="text-title-md font-semibold text-on-background border-b border-outline-variant/20 pb-sm mb-md">
              Học phí & Công nợ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-lg">
              <div className="p-lg rounded-2xl bg-primary/5 border border-primary/10">
                <p className="text-label-md text-on-surface-variant mb-1">Tổng học phí đã đóng</p>
                <p className="text-headline-md font-bold text-primary">{formatVND(parent.totalPaid)}</p>
              </div>
              <div className="p-lg rounded-2xl bg-error/5 border border-error/10">
                <p className="text-label-md text-on-surface-variant mb-1">Công nợ hiện tại</p>
                <p className="text-headline-md font-bold text-error">{formatVND(parent.totalDebt)}</p>
              </div>
            </div>

            <h3 className="text-title-sm font-semibold mb-sm mt-md">Lịch sử thanh toán</h3>
            <div className="overflow-hidden rounded-xl border border-outline-variant/30">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low text-label-sm text-on-surface-variant">
                  <tr>
                    <th className="p-3 font-medium">Ngày</th>
                    <th className="p-3 font-medium">Số tiền</th>
                    <th className="p-3 font-medium">Học viên</th>
                    <th className="p-3 font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="text-body-sm text-on-surface divide-y divide-outline-variant/20">
                  {parent.tuitionHistory?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-on-surface-variant">
                        Chưa có lịch sử thanh toán
                      </td>
                    </tr>
                  ) : (
                    parent.tuitionHistory?.map((t: any) => (
                      <tr key={t.id} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="p-3">{t.date}</td>
                        <td className="p-3 font-medium">{formatVND(t.amount)}</td>
                        <td className="p-3">{t.studentName}</td>
                        <td className="p-3">
                          <StatusBadge status={t.status} size="sm" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'interactions' && (
          <div className="space-y-md">
            <h2 className="text-title-md font-semibold text-on-background border-b border-outline-variant/20 pb-sm mb-md">
              Nhật ký tương tác
            </h2>
            
            <form onSubmit={handleInteractionSubmit} className="bg-surface-container-low p-md rounded-xl border border-outline-variant/20 mb-lg">
              <h3 className="text-label-lg font-medium mb-sm text-on-background">Thêm tương tác mới</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-md items-end">
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Ngày</label>
                  <input type="date" required value={interactionForm.date} onChange={(e) => handleInteractionChange('date', e.target.value)} className="input-field w-full" />
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Loại hình</label>
                  <select value={interactionForm.type} onChange={(e) => handleInteractionChange('type', e.target.value)} className="input-field w-full">
                    <option value="Cuộc gọi">Cuộc gọi</option>
                    <option value="Tin nhắn">Tin nhắn</option>
                    <option value="Gặp mặt">Gặp mặt</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex gap-sm items-end">
                  <div className="flex-1">
                    <label className="text-label-sm text-on-surface-variant mb-xs block">Nội dung</label>
                    <input required placeholder="Nhập ghi chú..." value={interactionForm.notes} onChange={(e) => handleInteractionChange('notes', e.target.value)} className="input-field w-full" />
                  </div>
                  <button type="submit" disabled={isPending || !interactionForm.notes} className="btn-primary whitespace-nowrap">
                    {isPending ? 'Đang thêm...' : 'Thêm'}
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-sm">
              {parent.interactions && parent.interactions.length > 0 ? (
                parent.interactions.map((interaction: any) => (
                  <div key={interaction.id} className="p-md rounded-xl border border-outline-variant/20 hover:border-primary/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px] text-primary">
                          {interaction.type === 'Cuộc gọi' ? 'call' : interaction.type === 'Tin nhắn' ? 'chat' : 'handshake'}
                        </span>
                        <span className="font-medium text-on-background">{interaction.type}</span>
                      </div>
                      <span className="text-label-sm text-on-surface-variant">
                        {new Date(interaction.date).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-body-sm text-on-surface">{interaction.notes}</p>
                  </div>
                ))
              ) : (
                <p className="text-body-md text-on-surface-variant text-center py-lg border border-dashed border-outline-variant/30 rounded-xl">Chưa có lịch sử tương tác.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'crm' && (
          <form onSubmit={handleCrmSubmit} className="space-y-md">
            <h2 className="text-title-md font-semibold text-on-background border-b border-outline-variant/20 pb-sm mb-md">
              Chăm sóc khách hàng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Nguồn khách hàng</label>
                <select value={crmForm.source} onChange={(e) => handleCrmChange('source', e.target.value)} className="input-field w-full">
                  <option value="">Chọn nguồn...</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Google">Google</option>
                  <option value="Bạn bè giới thiệu">Bạn bè giới thiệu</option>
                  <option value="Sự kiện">Sự kiện</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Ghi chú nguồn</label>
                <input placeholder="VD: Tên người giới thiệu..." value={crmForm.sourceNotes} onChange={(e) => handleCrmChange('sourceNotes', e.target.value)} className="input-field w-full" />
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Trạng thái KH</label>
                <select value={crmForm.crmStatus} onChange={(e) => handleCrmChange('crmStatus', e.target.value)} className="input-field w-full">
                  <option value="Tiềm năng">Tiềm năng</option>
                  <option value="Đang học">Đang học</option>
                  <option value="Tạm nghỉ">Tạm nghỉ</option>
                  <option value="Khách VIP">Khách VIP</option>
                </select>
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Mức độ quan tâm (1-5 sao)</label>
                <div className="flex gap-2 items-center h-[42px] px-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleCrmChange('interestLevel', String(i + 1))}
                      className={`material-symbols-outlined text-[24px] hover:scale-110 transition-transform ${i < crmForm.interestLevel ? 'filled text-warning' : 'text-outline-variant'}`}
                    >
                      star
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-sm mt-lg pt-md border-t border-outline-variant/20">
              <button type="submit" disabled={isPending} className="btn-primary">
                {isPending ? 'Đang lưu...' : <><span className="material-symbols-outlined text-[16px]">save</span> Cập nhật</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
