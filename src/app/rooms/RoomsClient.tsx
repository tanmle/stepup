'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addRoom, updateRoom, deleteRoom } from './actions';
import StatusBadge from '@/components/ui/StatusBadge';

interface Room {
  id: string;
  name: string;
  capacity: number;
  facilities: string[];
  status: string;
}

interface RoomsClientProps {
  rooms: Room[];
  dbError?: string;
}

export default function RoomsClient({ rooms, dbError }: RoomsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const openAddModal = () => {
    setEditingRoom(null);
    setIsModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        if (editingRoom) {
          await updateRoom(editingRoom.id, formData);
        } else {
          await addRoom(formData);
        }
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error saving room:', error);
        alert('Lưu thông tin thất bại.');
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phòng học này?')) return;
    
    startTransition(async () => {
      try {
        await deleteRoom(id);
      } catch (error) {
        console.error('Error deleting room:', error);
        alert('Xóa thất bại. Phòng học có thể đang được sử dụng.');
      }
    });
  };

  if (dbError && dbError.includes('does not exist')) {
    return (
      <div className="flex flex-col gap-md pb-xl animate-fade-in">
        <h1 className="text-headline-lg text-on-background">Quản lý Phòng học</h1>
        <div className="card p-xl flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-[48px] text-error mb-md">error</span>
          <h2 className="text-title-lg font-bold text-on-background mb-sm">Bảng dữ liệu chưa được tạo</h2>
          <p className="text-body-md text-on-surface-variant max-w-md">
            Vui lòng chạy đoạn mã SQL trong file <code>supabase/room_management.sql</code> trên giao diện quản trị Supabase (SQL Editor) để tạo bảng <code>rooms</code> trước khi sử dụng tính năng này.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-md pb-xl animate-fade-in">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xs">
        <div>
          <h1 className="text-headline-lg text-on-background">Quản lý Phòng học</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Quản lý danh sách phòng học, sức chứa và cơ sở vật chất
          </p>
        </div>
        
        <div className="flex gap-sm">
          <button onClick={openAddModal} className="btn-primary">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Thêm phòng mới
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-sm">
        <div className="card p-md">
          <p className="text-label-sm text-on-surface-variant uppercase mb-xs">Tổng số phòng</p>
          <p className="text-headline-md text-primary font-bold">{rooms.length}</p>
        </div>
        <div className="card p-md">
          <p className="text-label-sm text-on-surface-variant uppercase mb-xs">Sẵn sàng</p>
          <p className="text-headline-md text-emerald-600 font-bold">{rooms.filter(r => r.status === 'Sẵn sàng').length}</p>
        </div>
        <div className="card p-md">
          <p className="text-label-sm text-on-surface-variant uppercase mb-xs">Bảo trì</p>
          <p className="text-headline-md text-amber-600 font-bold">{rooms.filter(r => r.status === 'Bảo trì').length}</p>
        </div>
        <div className="card p-md">
          <p className="text-label-sm text-on-surface-variant uppercase mb-xs">Tổng sức chứa</p>
          <p className="text-headline-md text-secondary font-bold">{rooms.reduce((acc, r) => acc + r.capacity, 0)}</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant/20">
              <tr>
                <th className="px-lg py-md text-label-sm text-on-surface-variant font-semibold uppercase">Tên phòng</th>
                <th className="px-lg py-md text-label-sm text-on-surface-variant font-semibold uppercase">Sức chứa</th>
                <th className="px-lg py-md text-label-sm text-on-surface-variant font-semibold uppercase">Trang thiết bị</th>
                <th className="px-lg py-md text-label-sm text-on-surface-variant font-semibold uppercase">Trạng thái</th>
                <th className="px-lg py-md text-right text-label-sm text-on-surface-variant font-semibold uppercase w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {rooms.map((room) => (
                <tr key={room.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-lg py-md">
                    <div className="font-semibold text-on-background flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary/70 text-[20px]">meeting_room</span>
                      {room.name}
                    </div>
                  </td>
                  <td className="px-lg py-md text-on-surface">
                    {room.capacity} học viên
                  </td>
                  <td className="px-lg py-md text-on-surface">
                    <div className="flex flex-wrap gap-xs">
                      {room.facilities && room.facilities.length > 0 ? (
                        room.facilities.map((fac, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-surface-container rounded text-label-sm text-on-surface-variant">
                            {fac}
                          </span>
                        ))
                      ) : (
                        <span className="text-on-surface-variant/50 text-label-sm italic">Không có</span>
                      )}
                    </div>
                  </td>
                  <td className="px-lg py-md">
                    <span className={`px-2 py-1 rounded-full text-label-sm font-semibold border ${
                      room.status === 'Sẵn sàng' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                      room.status === 'Bảo trì' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                      'bg-surface-container text-on-surface-variant border-outline-variant/30'
                    }`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="px-lg py-md text-right">
                    <div className="flex items-center justify-end gap-sm">
                      <button 
                        onClick={() => openEditModal(room)}
                        className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
                        title="Sửa"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(room.id)}
                        className="w-8 h-8 rounded-full hover:bg-rose-50 flex items-center justify-center text-rose-500 transition-colors"
                        title="Xóa"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rooms.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-lg py-xl text-center text-on-surface-variant">
                    Chưa có phòng học nào. Hãy thêm phòng mới!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-md animate-fade-in">
          <div className="bg-surface rounded-2xl shadow-xl w-[450px] max-w-[95vw] overflow-hidden">
            <div className="px-lg py-md border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
              <h3 className="text-title-lg font-bold text-on-background">
                {editingRoom ? 'Sửa thông tin phòng' : 'Thêm phòng học mới'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-lg flex flex-col gap-md">
              <div>
                <label className="text-label-sm font-medium text-on-surface mb-xs block">Tên phòng học *</label>
                <input 
                  name="name" 
                  type="text" 
                  required 
                  defaultValue={editingRoom?.name || ''}
                  placeholder="VD: Phòng A101"
                  className="input-field w-full" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="text-label-sm font-medium text-on-surface mb-xs block">Sức chứa (học viên) *</label>
                  <input 
                    name="capacity" 
                    type="number" 
                    min="1"
                    required 
                    defaultValue={editingRoom?.capacity || 20}
                    className="input-field w-full" 
                  />
                </div>
                <div>
                  <label className="text-label-sm font-medium text-on-surface mb-xs block">Trạng thái</label>
                  <select 
                    name="status"
                    defaultValue={editingRoom?.status || 'Sẵn sàng'}
                    className="input-field w-full"
                  >
                    <option value="Sẵn sàng">Sẵn sàng</option>
                    <option value="Bảo trì">Bảo trì</option>
                    <option value="Ngưng sử dụng">Ngưng sử dụng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-label-sm font-medium text-on-surface mb-xs block">Trang thiết bị</label>
                <input 
                  name="facilities" 
                  type="text" 
                  defaultValue={editingRoom?.facilities?.join(', ') || ''}
                  placeholder="VD: Máy chiếu, Bảng từ, Loa (phân cách bằng dấu phẩy)"
                  className="input-field w-full" 
                />
              </div>
              
              <div className="flex items-center justify-end mt-sm pt-sm border-t border-outline-variant/10 gap-sm">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                  disabled={isPending}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="btn-primary"
                >
                  {isPending ? 'Đang lưu...' : 'Lưu phòng học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
