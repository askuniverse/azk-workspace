import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://svpxloxnroxztzgtueko.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2cHhsb3hucm94enR6Z3R1ZWtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjI3MzAsImV4cCI6MjA5Mjg5ODczMH0.zDrC7MlDF8enCyucGvi1aWnbYNBE6h7wcGnlCe5baxo'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function loadData() {
  const { data, error } = await supabase
    .from('workspace_data')
    .select('data')
    .eq('id', 'main')
    .single()
  if (error) return null
  return data?.data || null
}

export async function saveData(newData) {
  const { error } = await supabase
    .from('workspace_data')
    .upsert({ id: 'main', data: newData, updated_at: new Date().toISOString() })
  return !error
}
