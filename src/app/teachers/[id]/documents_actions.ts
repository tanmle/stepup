'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTeacherDocumentRecord(
  teacherId: string, 
  docType: string, 
  fileName: string, 
  fileUrl: string
) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('teacher_documents')
    .insert({
      teacher_id: teacherId,
      doc_type: docType,
      file_name: fileName,
      file_url: fileUrl
    })
    .select()
    .single()

  if (error) {
    throw new Error('Không thể lưu thông tin hồ sơ: ' + error.message)
  }

  revalidatePath(`/teachers/${teacherId}`)
  return data
}

export async function deleteTeacherDocumentRecord(documentId: string, teacherId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('teacher_documents')
    .delete()
    .eq('id', documentId)

  if (error) {
    throw new Error('Không thể xóa thông tin hồ sơ: ' + error.message)
  }

  revalidatePath(`/teachers/${teacherId}`)
  return true
}
