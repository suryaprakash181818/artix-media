import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://jhrmrtsenlrehzmblxrz.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impocm1ydHNlbmxyZWh6bWJseHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwODQyMjYsImV4cCI6MjA5NDY2MDIyNn0.ipEtzukIce2MX-Zj1M3q8iJJVFGV3ZUvSQXUgRd1gDw"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
