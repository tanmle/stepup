export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-md pb-xl animate-fade-in">
      <div>
        <h1 className="text-headline-lg text-on-background">Cài đặt</h1>
        <p className="text-body-md text-on-surface-variant mt-xs">Cấu hình hệ thống quản lý trung tâm</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        {[
          { icon: 'business', title: 'Thông tin trung tâm', desc: 'Tên, địa chỉ, liên hệ, logo' },
          { icon: 'people', title: 'Quản lý người dùng', desc: 'Phân quyền quản trị viên, nhân viên' },
          { icon: 'notifications', title: 'Thông báo & Nhắc nhở', desc: 'Cấu hình nhắc nộp học phí, thông báo' },
          { icon: 'receipt_long', title: 'Biên lai & Hóa đơn', desc: 'Mẫu biên lai, cài đặt in ấn' },
          { icon: 'class', title: 'Cấu hình khóa học', desc: 'Danh mục khóa học, mức học phí' },
          { icon: 'cloud_upload', title: 'Sao lưu & Khôi phục', desc: 'Backup dữ liệu, xuất/nhập Excel' },
        ].map((item) => (
          <div key={item.title} className="card p-lg hover:shadow-card-hover transition-all duration-200 cursor-pointer group">
            <div className="flex items-center gap-md">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-primary text-[24px]">{item.icon}</span>
              </div>
              <div className="flex-1">
                <p className="text-body-lg font-semibold text-on-background">{item.title}</p>
                <p className="text-body-md text-on-surface-variant mt-xs">{item.desc}</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant/50 group-hover:text-primary transition-colors">
                chevron_right
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
