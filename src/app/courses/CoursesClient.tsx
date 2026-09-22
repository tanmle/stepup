'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteCourse } from './actions';
import { formatVND } from '@/utils/format';

export default function CoursesClient({ initialCourses }: { initialCourses: any[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [programFilter, setProgramFilter] = useState('All');

  const filteredCourses = initialCourses.filter(course => {
    const matchesSearch = (course.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (course.code || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || course.status === statusFilter;
    const matchesProgram = programFilter === 'All' || course.program === programFilter;
    return matchesSearch && matchesStatus && matchesProgram;
  });

  const uniquePrograms = Array.from(new Set(initialCourses.map(c => c.program)));

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa khóa học này?')) {
      try {
        await deleteCourse(id);
      } catch (error) {
        alert('Có lỗi xảy ra khi xóa khóa học.');
      }
    }
  };

  return (
    <div className="flex flex-col gap-md pb-xl animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg text-on-background">Quản lý Khóa học</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Tổng số: {filteredCourses.length} khóa học
          </p>
        </div>
        <Link href="/courses/new" className="btn-primary">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm khóa học
        </Link>
      </div>

      <div className="card p-md flex flex-col sm:flex-row gap-sm items-center justify-between">
        <div className="relative w-full sm:w-[320px]">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo mã, tên khóa học..."
            className="input-field pl-xl w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-sm w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <select
            className="input-field min-w-[160px]"
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
          >
            <option value="All">Tất cả chương trình</option>
            {uniquePrograms.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            className="input-field min-w-[160px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="Đang hoạt động">Đang hoạt động</option>
            <option value="Tạm ngưng">Tạm ngưng</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/20">
                <th className="p-md text-label-sm font-semibold text-on-surface-variant whitespace-nowrap">Mã</th>
                <th className="p-md text-label-sm font-semibold text-on-surface-variant whitespace-nowrap">Tên khóa học</th>
                <th className="p-md text-label-sm font-semibold text-on-surface-variant whitespace-nowrap">Chương trình / Cấp độ</th>
                <th className="p-md text-label-sm font-semibold text-on-surface-variant text-right whitespace-nowrap">Tổng học phí</th>
                <th className="p-md text-label-sm font-semibold text-on-surface-variant text-center whitespace-nowrap">Thời lượng</th>
                <th className="p-md text-label-sm font-semibold text-on-surface-variant whitespace-nowrap">Trạng thái</th>
                <th className="p-md text-label-sm font-semibold text-on-surface-variant text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-md whitespace-nowrap">
                      <span className="font-medium text-body-md text-on-surface">{course.code}</span>
                    </td>
                    <td className="p-md min-w-[200px]">
                      <span className="font-medium text-body-md text-on-surface block">{course.name}</span>
                    </td>
                    <td className="p-md">
                      <span className="text-body-md text-on-surface block">{course.program}</span>
                      <span className="text-label-sm text-on-surface-variant">{course.level}</span>
                    </td>
                    <td className="p-md text-right whitespace-nowrap">
                      <span className="font-medium text-primary text-body-md block">
                        {formatVND(course.tuition_fee * (course.duration_months || 1))}
                      </span>
                      {course.duration_months > 1 && (
                        <span className="text-label-sm text-on-surface-variant">
                          ({formatVND(course.tuition_fee)}/tháng)
                        </span>
                      )}
                    </td>
                    <td className="p-md text-center whitespace-nowrap">
                      <span className="text-body-md text-on-surface block">{course.duration_months} tháng</span>
                      <span className="text-label-sm text-on-surface-variant">{course.sessions_count} buổi</span>
                    </td>
                    <td className="p-md whitespace-nowrap">
                      <span className={`px-sm py-0.5 rounded-full text-label-sm font-medium inline-flex items-center gap-1.5 ${
                        course.status === 'Đang hoạt động' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
                        {course.status}
                      </span>
                    </td>
                    <td className="p-md text-right whitespace-nowrap">
                      <div className="flex justify-end gap-xs">
                        <Link href={`/courses/${course.id}`} className="p-sm text-primary hover:bg-primary/10 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </Link>
                        <button onClick={() => handleDelete(course.id)} className="p-sm text-error hover:bg-error/10 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-xl text-center text-on-surface-variant">
                    <div className="flex flex-col items-center justify-center gap-sm">
                      <span className="material-symbols-outlined text-[48px] opacity-20">library_books</span>
                      <p>Không tìm thấy khóa học nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
