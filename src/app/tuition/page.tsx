import { createClient } from '@/lib/supabase/server';
import TuitionClient from './TuitionClient';
import { getTuitionData } from '@/lib/data/analytics';
import { syncTuitionStatuses } from './actions';

export const metadata = {
  title: 'Học phí & Công nợ',
};

export default async function TuitionPage() {
  const supabase = await createClient();
  
  // Sync statuses based on due dates before fetching
  await syncTuitionStatuses();

  const kpi = await getTuitionData();

  // For tuition, we need to join with students and classes to get the names
  const { data: records, error } = await supabase
    .from('tuition_records')
    .select(`
      *,
      students ( full_name, avatar_initials, avatar_color ),
      classes ( name )
    `)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching tuition records:', error);
  }

  // Format the data to match the UI types
  const formattedRecords = (records || []).map((r: any) => ({
    id: r.id,
    student: {
      fullName: r.students?.full_name || 'Unknown',
      avatarInitials: r.students?.avatar_initials || '?',
      avatarColor: r.students?.avatar_color || 'bg-gray-100 text-gray-700',
    },
    className: r.classes?.name || 'Unknown',
    totalTuition: r.total_tuition,
    amountPaid: r.amount_paid,
    amountOwed: r.amount_owed,
    dueDate: r.due_date ? new Date(r.due_date).toLocaleDateString('vi-VN') : '',
    status: r.status,
  }));

  // Fetch center settings for receipts
  const { data: settings } = await supabase
    .from('center_settings')
    .select('*')
    .single();

  return <TuitionClient initialRecords={formattedRecords} kpi={kpi} settings={settings} />;
}
