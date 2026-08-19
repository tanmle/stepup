'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { deleteParent } from './actions';
import Link from 'next/link';
import Pagination from '@/components/ui/Pagination';

const ITEMS_PER_PAGE = 8;

interface ParentsClientProps {
  initialParents: any[];
}

export default function ParentsClient({ initialParents }: ParentsClientProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [parentsList, setParentsList] = useState(initialParents);
  useEffect(() => {
    setParentsList(initialParents);
  }, [initialParents]);

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa phụ huynh này? Phụ huynh sẽ bị gỡ khỏi các học viên liên quan.')) {
      setParentsList(prev => prev.filter(p => p.id !== id));
      
      startTransition(async () => {
        try {
          await deleteParent(id);
          router.refresh();
        } catch (error) {
          setParentsList(initialParents);
          alert('Xóa thất bại. Vui lòng thử lại.');
        }
      });
    }
  };

  const filtered = useMemo(() => {
    return parentsList.filter((p: any) => {
      const matchSearch = !search ||
        p.fullName.toLowerCase().includes(search.toLowerCase()) ||
        p.phone.includes(search);
      const matchStatus = !filterStatus || p.crmStatus === filterStatus;
      const matchSource = !filterSource || p.source === filterSource;
      
      return matchSearch && matchStatus && matchSource;
    });
  }, [parentsList, search, filterStatus, filterSource]);

  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  return (
    <div className="flex flex-col gap-md pb-xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg text-on-background">Quản lý Phụ huynh</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Tổng cộng <span className="font-semibold text-primary">{parentsList.length}</span> phụ huynh
          </p>
        </div>
        <div className="flex gap-sm">
          <Link href="/parents/new" className="btn-primary">
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            Thêm phụ huynh
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-sm flex flex-col md:flex-row gap-sm items-center justify-between">
        <div className="flex flex-col md:flex-row gap-sm w-full">
          <div className="relative w-full md:w-96 flex-shrink-0">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm theo tên, số điện thoại..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-xl pr-md py-sm bg-surface-container hover:bg-surface-container-high focus:bg-surface transition-colors rounded-xl outline-none text-body-md text-on-surface placeholder:text-on-surface-variant/60"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-md py-sm bg-surface-container hover:bg-surface-container-high focus:bg-surface transition-colors rounded-xl outline-none text-body-md text-on-surface"
          >
            <option value="">Trạng thái (Tất cả)</option>
            <option value="Tiềm năng">Tiềm năng</option>
            <option value="Đang học">Đang học</option>
            <option value="Đã nghỉ">Đã nghỉ</option>
            <option value="Khách VIP">Khách VIP</option>
          </select>
          <select
            value={filterSource}
            onChange={(e) => { setFilterSource(e.target.value); setCurrentPage(1); }}
            className="px-md py-sm bg-surface-container hover:bg-surface-container-high focus:bg-surface transition-colors rounded-xl outline-none text-body-md text-on-surface"
          >
            <option value="">Nguồn (Tất cả)</option>
            <option value="Facebook">Facebook</option>
            <option value="Bạn bè">Bạn bè giới thiệu</option>
            <option value="Tờ rơi">Tờ rơi / Banner</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="card">
        {/* Responsive Table View */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                {['Họ và tên', 'Liên hệ', 'Nghề nghiệp', 'Trạng thái', 'Học viên liên kết', ''].map((h) => (
                  <th key={h} className="px-md py-md text-left text-label-sm text-on-surface-variant uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {paginated.map((p: any) => (
                <tr 
                  key={p.id} 
                  className="hover:bg-primary/[0.02] transition-colors group cursor-pointer relative hover:z-50"
                  onClick={() => router.push(`/parents/${p.id}`)}
                >
                  <td className="px-md py-md" onClick={(e) => e.stopPropagation()}>
                    <Link href={`/parents/${p.id}`} className="flex items-center gap-sm group-hover:text-primary transition-colors">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {p.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-body-lg font-semibold text-on-background group-hover:text-primary transition-colors">{p.fullName}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-md py-md">
                    <p className="font-mono text-body-md text-on-surface">{p.phone}</p>
                    <p className="text-label-sm text-on-surface-variant">{p.email || '—'}</p>
                  </td>
                  <td className="px-md py-md text-body-md text-on-surface-variant">
                    {p.job || '—'}
                  </td>
                  <td className="px-md py-md">
                    {p.crmStatus === 'Khách VIP' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-tertiary-container text-on-tertiary-container text-label-sm font-medium">
                        <span className="material-symbols-outlined text-[14px]">stars</span>
                        VIP
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-surface-container-highest text-on-surface text-label-sm font-medium">
                        {p.crmStatus || 'Tiềm năng'}
                      </span>
                    )}
                  </td>
                  <td className="px-md py-md relative group/tooltip">
                    <div className="flex items-center gap-xs cursor-default">
                      <span className="material-symbols-outlined text-[16px] text-primary">school</span>
                      <span className="text-body-md font-semibold text-primary">{p.linkedStudentsCount}</span>
                      <span className="text-label-sm text-on-surface-variant ml-xs">học viên</span>
                    </div>
                    {/* Tooltip for linked students */}
                    {p.linkedStudents?.length > 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-surface-container-highest rounded-xl shadow-lg border border-outline-variant/20 p-2 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50">
                        <div className="text-label-sm font-semibold text-on-surface mb-1 px-1">Học viên liên kết:</div>
                        <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
                          {p.linkedStudents.map((student: any) => (
                            <Link 
                              key={student.id} 
                              href={`/students/${student.id}`}
                              className="flex items-center gap-2 p-1.5 hover:bg-surface rounded-lg transition-colors group/student"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] flex-shrink-0 ${student.avatar_color}`}>
                                {student.avatar_initials}
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <div className="text-body-sm font-medium text-on-surface truncate group-hover/student:text-primary transition-colors">{student.full_name}</div>
                                <div className="text-[10px] text-on-surface-variant font-mono">{student.code}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                        {/* Triangle pointer */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-solid border-t-surface-container-highest border-t-8 border-x-transparent border-x-8 border-b-0" />
                      </div>
                    )}
                  </td>
                  <td className="px-md py-md">
                    <div className="flex gap-xs opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                      <Link href={`/parents/${p.id}`} className="p-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </Link>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                        disabled={isPending}
                        className="p-xs text-error hover:bg-error-container/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Xóa phụ huynh"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-xl text-on-surface-variant">Không tìm thấy phụ huynh nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemLabel="phụ huynh"
        />
      </div>
    </div>
  );
}
