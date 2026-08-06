interface CategoryItem {
  name: string;
  value: number;
  amount: number;
}

interface CategoryBreakdownProps {
  data: CategoryItem[];
}

const COLORS = ['#00288e', '#1e40af', '#3755c3', '#6b7280', '#9ca3af'];

export default function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  return (
    <div className="space-y-md">
      {data.map((item, i) => (
        <div key={item.name}>
          <div className="flex justify-between items-center mb-xs">
            <span className="text-body-md text-on-surface">{item.name}</span>
            <div className="text-right">
              <span className="text-label-sm text-on-surface-variant">{item.value}%</span>
            </div>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{
                width: `${item.value}%`,
                backgroundColor: COLORS[i] ?? '#9ca3af',
              }}
            />
          </div>
          <div className="text-right mt-xs">
            <span className="text-label-sm text-on-surface-variant">
              {item.amount.toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
