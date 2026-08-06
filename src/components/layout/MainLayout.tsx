import Sidebar from './Sidebar';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-sidebar w-full min-h-screen">
        <Header />
        <main className="pt-16 min-h-screen">
          <div className="p-lg">{children}</div>
        </main>
      </div>
    </div>
  );
}
