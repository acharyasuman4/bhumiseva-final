import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// यदि URL वा Key छुटेको छ भने यसले चेतावनी दिन्छ
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("सुपाबेसको URL वा Key भेटिएन! कृपया भर्सलको Settings चेक गर्नुहोस्।")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
