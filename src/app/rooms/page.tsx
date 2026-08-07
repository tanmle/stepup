import { createClient } from '@/lib/supabase/server';
import RoomsClient from './RoomsClient';

export const metadata = {
  title: 'Quản lý Phòng học',
};

export default async function RoomsPage() {
  const supabase = await createClient();

  const { data: rooms, error } = await supabase
    .from('rooms')
    .select('*')
    .order('name');

  return <RoomsClient rooms={rooms || []} dbError={error?.message} />;
}
