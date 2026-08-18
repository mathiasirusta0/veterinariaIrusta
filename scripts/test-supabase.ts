import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vgsrmfedfyvcjoexeolt.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnc3JtZmVkZnl2Y2pvZXhlb2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwODI4MTEsImV4cCI6MjEwMjY1ODgxMX0.YOaesivsxsKI3-uUECrow4EG56ZYSq2XpZ1opgzCg0A';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase Cloud Connection...');
  try {
    const res = await supabase.from('patients').select('count', { count: 'exact', head: true });
    console.log('Response Status:', res.status, res.statusText);
    if (res.error) {
      console.log('Notice:', res.error.message);
      if (res.error.code === '42P01') {
        console.log('✅ Supabase reached! (Table schema needs to be executed in SQL Editor)');
      }
    } else {
      console.log('✅ Supabase connected successfully! Patients count:', res.count);
    }
  } catch (err: any) {
    console.error('Connection error:', err.message);
  }
}

testConnection();
