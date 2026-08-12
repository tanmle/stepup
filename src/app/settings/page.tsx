import { createClient } from '@/lib/supabase/server';
import SettingsClient from './SettingsClient';

export const metadata = {
  title: 'Cài đặt hệ thống',
};

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from('center_settings')
    .select('*')
    .single();

  return (
    <div className="flex flex-col gap-md pb-xl animate-fade-in">
      <div>
        <h1 className="text-headline-lg text-on-background">Cài đặt</h1>
        <p className="text-body-md text-on-surface-variant mt-xs">Cấu hình hệ thống quản lý trung tâm</p>
      </div>
      <SettingsClient initialSettings={settings} />
    </div>
  );
}
