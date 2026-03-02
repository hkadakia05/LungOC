import { supabase } from './supabase.ts'

export interface ScanRecord {
  id?: string
  user_id: string
  prediction: string
  risk_score: number
  risk_level: 'low' | 'moderate' | 'high'
  age: number
  smoking_pack_years: number
  family_history: boolean
  image_probability: number
  created_at?: string
}

export async function saveScanToDatabase(scanData: Omit<ScanRecord, 'id' | 'user_id' | 'created_at'>, userId: string) {
  try {
    const { data, error } = await supabase
      .from('scans')
      .insert([
        {
          ...scanData,
          user_id: userId,
        }
      ])
      .select()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error saving scan:', error)
    throw error
  }
}

export async function getUserScans(userId: string) {
  try {
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching scans:', error)
    throw error
  }
}
