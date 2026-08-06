import React from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-surface-container p-md">
      <div className="card w-[384px] max-w-full p-xl flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-md mb-lg">
          <span className="material-symbols-outlined text-on-primary text-[24px]">bolt</span>
        </div>
        <h1 className="text-headline-md font-bold text-on-background mb-xs">StepUp Admin</h1>
        <p className="text-body-md text-on-surface-variant mb-xl text-center">
          Đăng nhập để quản lý trung tâm (Giao diện giả lập)
        </p>
        
        <form className="w-full flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <label className="text-label-sm text-on-surface-variant">Email</label>
            <input 
              type="email" 
              placeholder="admin@stepup.edu.vn"
              className="input-field" 
              disabled
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="text-label-sm text-on-surface-variant">Mật khẩu</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="input-field" 
              disabled
            />
          </div>
          <button type="button" className="btn-primary w-full justify-center mt-sm" disabled>
            Đăng nhập
          </button>
        </form>
        
        <p className="text-label-sm text-primary mt-lg">
          Tính năng đăng nhập đang được bảo trì.
        </p>
      </div>
    </div>
  );
}
