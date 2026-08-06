'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getTeacherById } from '@/lib/data/teachers';
import StatusBadge from '@/components/ui/StatusBadge';

interface Props {
  params: Promise<{ id: string }>;
}

const TABS = [
  { id: 'profile', label: 'Hồ sơ', icon: 'person' },
  { id: 'schedule', label: 'Lịch dạy', icon: 'calendar_month' },
  { id: 'classes', label: 'Danh sách lớp', icon: 'class' },
  { id: 'notes', label: 'Ghi chú', icon: 'note_alt' },
];

const SCHEDULE_DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const SCHEDULE_SLOTS = ['Sáng (08:00–12:00)', 'Chiều (13:30–17:30)', 'Tối (18:00–21:30)'];

const COLOR_MAP = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  secondary: 'bg-amber-50 text-amber-700 border-amber-200',
  tertiary: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function TeacherDetailPage({ params }: Props) {
  const [activeTab, setActiveTab] = useState('profile');
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  if (!resolvedParams) {
    params.then(setResolvedParams);
  }

  const id = resolvedParams?.id ?? '1';
  const teacher = getTeacherById(id);
  if (!teacher && resolvedParams) return <div className="p-xl text-on-surface-variant">Không tìm thấy giáo viên</div>;
  if (!teacher) return null;

  return (
    <div className="flex flex-col gap-md pb-xl animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-xs text-label-sm text-on-surface-variant">
        <Link href="/dashboard" className="hover:text-primary transition-colors">Trang chủ</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link href="/teachers" className="hover:text-primary transition-colors">Quản lý giáo viên</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-medium">{teacher.fullName}</span>
      </nav>

      {/* Profile Header Card */}
      <div className="card p-lg relative overflow-hidden">
        <div className="blur-orb w-64 h-64 bg-primary/5 -top-16 -right-16" />
        <div className="relative z-10 flex flex-col lg:flex-row gap-lg items-start">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold ${teacher.avatarColor}`}>
              {teacher.avatarInitials}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-surface ${
              teacher.status === 'Nhận lớp' ? 'bg-emerald-500' : 'bg-amber-500'
            }`} />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-md">
              <div>
                <h1 className="text-headline-md text-on-background">{teacher.fullName}</h1>
                <div className="flex flex-wrap gap-sm mt-sm">
                  <span className="font-mono text-label-sm bg-primary/10 text-primary px-sm py-xs rounded-md">
                    {teacher.code}
                  </span>
                  {teacher.certificates.slice(0, 2).map((cert) => (
                    <span key={cert} className="text-label-sm bg-surface-container px-sm py-xs rounded-md text-on-surface-variant">
                      {cert}
                    </span>
                  ))}
                  <span className="text-label-sm bg-surface-container px-sm py-xs rounded-md text-on-surface-variant">
                    {teacher.yearsOfExperience} năm kinh nghiệm
                  </span>
                </div>
              </div>
              <div className="flex gap-sm">
                <button className="btn-secondary">
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Sửa thông tin
                </button>
                <button className="btn-primary">
                  <span className="material-symbols-outlined text-[16px]">add_task</span>
                  Giao lớp
                </button>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-md mt-lg">
              {[
                { label: 'Lớp đang dạy', value: teacher.currentClasses.length },
                { label: 'Tổng học viên', value: teacher.currentClasses.reduce((sum, c) => sum + c.enrolled, 0) },
                { label: 'Đánh giá TB', value: `${teacher.rating}/5.0` },
                { label: 'Kinh nghiệm', value: `${teacher.yearsOfExperience} năm` },
              ].map((stat) => (
                <div key={stat.label} className="text-center bg-surface-container-low rounded-xl p-sm">
                  <p className="text-[20px] font-bold text-on-background">{stat.value}</p>
                  <p className="text-label-sm text-on-surface-variant mt-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-outline-variant/20 px-lg overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn flex items-center gap-xs mr-lg whitespace-nowrap ${activeTab === tab.id ? 'tab-btn-active' : ''}`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-lg">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-lg animate-fade-in">
              {/* Left */}
              <div className="space-y-lg">
                {/* Expertise */}
                <div>
                  <h3 className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-md">Chuyên môn & Bằng cấp</h3>
                  <div className="grid grid-cols-2 gap-md">
                    <div className="bg-surface-container-low rounded-xl p-md">
                      <p className="text-label-sm text-on-surface-variant mb-xs">Bằng cấp</p>
                      <p className="text-body-md font-medium text-on-background">{teacher.degree}</p>
                      <p className="text-label-sm text-on-surface-variant">{teacher.institution}</p>
                    </div>
                    <div className="bg-surface-container-low rounded-xl p-md">
                      <p className="text-label-sm text-on-surface-variant mb-xs">Chứng chỉ</p>
                      <div className="flex flex-wrap gap-xs">
                        {teacher.certificates.map((c) => (
                          <span key={c} className="text-label-sm bg-primary/10 text-primary px-sm py-xs rounded-full">{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-md bg-surface-container-low rounded-xl p-md">
                    <p className="text-label-sm text-on-surface-variant mb-sm">Thế mạnh giảng dạy</p>
                    <div className="flex flex-wrap gap-xs">
                      {teacher.teachingStrengths.map((s) => (
                        <span key={s} className="text-label-sm bg-surface-container px-sm py-xs rounded-full text-on-surface-variant border border-outline-variant/30">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <h3 className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-md">Thông tin liên hệ</h3>
                  <div className="grid grid-cols-2 gap-sm">
                    {[
                      { icon: 'phone', label: 'Điện thoại', value: teacher.phone },
                      { icon: 'email', label: 'Email', value: teacher.email },
                      { icon: 'location_on', label: 'Cơ sở', value: teacher.location },
                      { icon: 'schedule', label: 'Ghi chú', value: teacher.scheduleNote ?? 'Không có' },
                    ].map((info) => (
                      <div key={info.label} className="flex items-start gap-sm bg-surface-container-low rounded-xl p-md">
                        <span className="material-symbols-outlined text-on-surface-variant text-[16px] mt-0.5">{info.icon}</span>
                        <div>
                          <p className="text-label-sm text-on-surface-variant">{info.label}</p>
                          <p className="text-body-md text-on-surface">{info.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right - Performance */}
              <div>
                <div className="bg-primary rounded-2xl p-lg text-on-primary">
                  <h3 className="text-label-sm uppercase tracking-wider opacity-80 mb-lg">Hiệu suất giảng dạy</h3>
                  <div className="space-y-md">
                    {[
                      { label: 'HV đạt mục tiêu', value: teacher.studentGoalRate, color: '#a8b8ff' },
                      { label: 'Đánh giá từ HV', value: (teacher.studentRating / 5) * 100, display: `${teacher.studentRating}/5`, color: '#a8b8ff' },
                      { label: 'Tỷ lệ tái đăng ký', value: teacher.reEnrollmentRate, color: '#a8b8ff' },
                    ].map((metric) => (
                      <div key={metric.label}>
                        <div className="flex justify-between items-center mb-xs">
                          <span className="text-label-sm opacity-90">{metric.label}</span>
                          <span className="text-label-sm font-bold">{metric.display ?? `${metric.value}%`}</span>
                        </div>
                        <div className="h-1.5 bg-on-primary/20 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${metric.value}%`, backgroundColor: metric.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Star rating */}
                  <div className="mt-lg pt-lg border-t border-on-primary/20">
                    <div className="flex items-center gap-sm">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className="material-symbols-outlined text-[20px]"
                            style={{
                              color: i < Math.floor(teacher.rating) ? '#fbbf24' : 'rgba(255,255,255,0.3)',
                              fontVariationSettings: "'FILL' 1",
                            }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                      <span className="text-title-lg font-bold">{teacher.rating}</span>
                    </div>
                    <p className="text-label-sm opacity-70 mt-xs">Dựa trên đánh giá của học viên</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="animate-fade-in overflow-x-auto">
              <h3 className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-md">Lịch dạy tuần này</h3>
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr>
                    <th className="w-36 text-left text-label-sm text-on-surface-variant py-sm px-md">Ca / Ngày</th>
                    {SCHEDULE_DAYS.map((d) => (
                      <th key={d} className="text-center text-label-sm text-on-surface-variant py-sm px-sm">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SCHEDULE_SLOTS.map((slot, si) => (
                    <tr key={slot} className="border-t border-outline-variant/10">
                      <td className="py-sm px-md">
                        <p className="text-body-md text-on-surface">{slot.split(' ')[0]}</p>
                        <p className="text-label-sm text-on-surface-variant">{slot.split(' ').slice(1).join(' ')}</p>
                      </td>
                      {SCHEDULE_DAYS.map((_, di) => {
                        const classForSlot = teacher.currentClasses[si * 2 + (di % 2)] as (typeof teacher.currentClasses)[number] | undefined;
                        return (
                          <td key={di} className="py-sm px-sm text-center">
                            {classForSlot && (di < 5) ? (
                              <div className={`rounded-lg p-xs border text-[11px] font-semibold ${COLOR_MAP[classForSlot.colorKey]}`}>
                                <p>{classForSlot.code}</p>
                                <p className="text-[10px] font-normal opacity-80">{classForSlot.enrolled}/{classForSlot.capacity} HV</p>
                              </div>
                            ) : (
                              <span className="text-on-surface-variant/30 text-[10px]">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Classes Tab */}
          {activeTab === 'classes' && (
            <div className="animate-fade-in">
              <h3 className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-md">Danh sách lớp hiện tại</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-outline-variant/20">
                      {['Tên lớp', 'Chương trình', 'Sĩ số', 'Lịch học', 'Ngày bắt đầu', 'Trạng thái'].map((h) => (
                        <th key={h} className="text-left text-label-sm text-on-surface-variant py-sm px-md uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {teacher.currentClasses.map((cls) => (
                      <tr key={cls.code} className="hover:bg-primary/[0.02] transition-colors">
                        <td className="py-md px-md">
                          <div className={`inline-flex items-center gap-sm px-sm py-xs rounded-lg border ${COLOR_MAP[cls.colorKey]}`}>
                            <span className="material-symbols-outlined text-[14px]">class</span>
                            <span className="font-semibold text-[13px]">{cls.code}</span>
                          </div>
                          <p className="text-body-md text-on-surface mt-xs">{cls.name}</p>
                        </td>
                        <td className="py-md px-md text-body-md text-on-surface-variant">{cls.program}</td>
                        <td className="py-md px-md">
                          <p className="text-body-md font-semibold text-on-background">{cls.enrolled}/{cls.capacity}</p>
                          <div className="progress-bar mt-xs w-16">
                            <div className="progress-bar-fill bg-primary" style={{ width: `${(cls.enrolled / cls.capacity) * 100}%` }} />
                          </div>
                        </td>
                        <td className="py-md px-md text-body-md text-on-surface-variant">{cls.schedule}</td>
                        <td className="py-md px-md text-body-md text-on-surface-variant">{cls.startDate}</td>
                        <td className="py-md px-md">
                          <StatusBadge status={cls.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-md">
                <h3 className="text-label-sm text-on-surface-variant uppercase tracking-wider">Ghi chú nội bộ</h3>
                <button className="btn-secondary text-[12px] px-sm py-xs">
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  Thêm ghi chú
                </button>
              </div>
              {teacher.scheduleNote ? (
                <div className="bg-surface-container-low rounded-xl p-md">
                  <div className="flex items-center gap-sm mb-sm">
                    <span className="material-symbols-outlined text-primary text-[16px]">notes</span>
                    <p className="text-label-sm font-semibold text-on-background">Ghi chú lịch dạy</p>
                  </div>
                  <p className="text-body-md text-on-surface">{teacher.scheduleNote}</p>
                </div>
              ) : (
                <p className="text-body-md text-on-surface-variant text-center py-xl">Chưa có ghi chú nào</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
