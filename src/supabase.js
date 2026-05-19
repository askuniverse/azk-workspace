import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://svpxloxnroxztzgtueko.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2cHhsb3hucm94enR6Z3R1ZWtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjI3MzAsImV4cCI6MjA5Mjg5ODczMH0.zDrC7MlDF8enCyucGvi1aWnbYNBE6h7wcGnlCe5baxo'
const LS_KEY = 'azk_workspace_v1'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function loadData() {
  // 1. Essayer Supabase
  try {
    const { data, error } = await supabase
      .from('workspace_data')
      .select('data')
      .eq('id', 'main')
      .single()
    if (!error && data?.data && Object.keys(data.data).length > 0) {
      localStorage.setItem(LS_KEY, JSON.stringify(data.data))
      return data.data
    }
  } catch (e) {
    console.error('Supabase load failed:', e)
  }

  // 2. Fallback localStorage
  try {
    const local = localStorage.getItem(LS_KEY)
    if (local) return JSON.parse(local)
  } catch (e) {}

  return null
}

export async function saveData(newData) {
  // Toujours sauvegarder en localStorage (instantané, jamais perdu)
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(newData))
  } catch (e) {
    console.error('localStorage save failed:', e)
  }

  // Tenter Supabase pour la sync cross-device
  try {
    const { error } = await supabase
      .from('workspace_data')
      .upsert({ id: 'main', data: newData, updated_at: new Date().toISOString() })
    if (error) {
      console.error('Supabase save error:', error.message, error.code)
      return 'local'
    }
    return 'synced'
  } catch (e) {
    console.error('Supabase exception:', e)
    return 'local'
  }
}
