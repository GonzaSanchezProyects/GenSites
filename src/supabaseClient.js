import { createClient } from '@supabase/supabase-js';

// URL corregida a .co en lugar de .com
const supabaseUrl = 'https://purahwnnxkxczducahiu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1cmFod25ueGt4Y3pkdWNhaGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDkwNDAsImV4cCI6MjA5MjcyNTA0MH0.Cl7aKAzIXGTW2m2jPFluDbhy2jWs3uyqSCykbHTPgqU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);