import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vgsrmfedfyvcjoexeolt.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnc3JtZmVkZnl2Y2pvZXhlb2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwODI4MTEsImV4cCI6MjEwMjY1ODgxMX0.YOaesivsxsKI3-uUECrow4EG56ZYSq2XpZ1opgzCg0A';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedData() {
  console.log('--- Subiendo datos iniciales a Supabase ---');

  // 1. Branches
  const { error: bErr } = await supabase.from('branches').upsert([
    {
      id: 'branch-central',
      name: 'Hospital Veterinario Central',
      address: 'Av. del Libertador 4520, CABA',
      phone: '+54 11 4789-0000',
      email: 'contacto@vetsystem.com',
      is_main: true,
    },
    {
      id: 'branch-norte',
      name: 'Clínica Veterinaria Sede Norte',
      address: 'Av. Maipú 2100, Vicente López',
      phone: '+54 11 4790-1122',
      email: 'norte@vetsystem.com',
      is_main: false,
    },
  ]);
  if (bErr) console.log('Branches status:', bErr.message);
  else console.log('✅ Sucursales sincronizadas');

  // 2. Users
  const { error: uErr } = await supabase.from('users').upsert([
    {
      id: 'usr-1',
      name: 'Dr. Martín López',
      email: 'm.lopez@vetsystem.com',
      role: 'DIRECTOR_MEDICO',
      branch_id: 'branch-central',
      license_number: 'MP-VET-7841',
      phone: '+54 9 11 5555-1111',
      active: true,
    },
    {
      id: 'usr-2',
      name: 'Dra. Sofía Albarracín',
      email: 's.albarracin@vetsystem.com',
      role: 'VETERINARIO_PLANTA',
      branch_id: 'branch-central',
      license_number: 'MP-VET-8920',
      phone: '+54 9 11 5555-2222',
      active: true,
    },
    {
      id: 'usr-3',
      name: 'Dr. Matías Rossi',
      email: 'm.rossi@vetsystem.com',
      role: 'CIRUJANO',
      branch_id: 'branch-central',
      license_number: 'MP-VET-9104',
      phone: '+54 9 11 5555-3333',
      active: true,
    },
    {
      id: 'usr-4',
      name: 'Enf. Camila Gómez',
      email: 'c.gomez@vetsystem.com',
      role: 'ENFERMERO',
      branch_id: 'branch-central',
      license_number: 'TEC-VET-412',
      phone: '+54 9 11 5555-4444',
      active: true,
    },
  ]);
  if (uErr) console.log('Users status:', uErr.message);
  else console.log('✅ Usuarios sincronizados');

  // 3. Owners
  const { error: oErr } = await supabase.from('owners').upsert([
    {
      id: 'own-1',
      first_name: 'Carlos',
      last_name: 'Rodríguez',
      dni: '32.450.812',
      phone: '+54 11 6789-1234',
      whatsapp: '+5491167891234',
      email: 'carlos.rodriguez@gmail.com',
      address: 'Av. Santa Fe 3420, 4B',
      city: 'CABA',
      balance: 0.0,
    },
    {
      id: 'own-2',
      first_name: 'Mariana',
      last_name: 'Benítez',
      dni: '35.120.441',
      phone: '+54 11 5432-9876',
      whatsapp: '+5491154329876',
      email: 'marianabenitez@hotmail.com',
      address: 'Juramento 2150',
      city: 'CABA',
      balance: -15000.0,
    },
  ]);
  if (oErr) console.log('Owners status:', oErr.message);
  else console.log('✅ Propietarios sincronizados');

  // 4. Patients
  const { error: pErr } = await supabase.from('patients').upsert([
    {
      id: 'pat-1',
      owner_id: 'own-1',
      name: 'Toby',
      species: 'Canino',
      breed: 'Golden Retriever',
      sex: 'Macho',
      reproductive_status: 'Castrado',
      birth_date: '2021-04-15',
      calculated_age: '5 años',
      weight: 32.5,
      color: 'Dorado',
      microchip: '981098123456789',
      photo_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300',
      clinical_record_number: 'HC-2026-0041',
      status: 'INTERNADO',
      alerts: [{ type: 'ALERGIA', description: 'Alérgico a Dipirona / AINEs inyectables' }],
    },
    {
      id: 'pat-2',
      owner_id: 'own-2',
      name: 'Luna',
      species: 'Felino',
      breed: 'Siamés',
      sex: 'Hembra',
      reproductive_status: 'Castrado',
      birth_date: '2022-08-10',
      calculated_age: '3 años 11 meses',
      weight: 3.8,
      color: 'Seal Point',
      microchip: '981098987654321',
      photo_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300',
      clinical_record_number: 'HC-2026-0042',
      status: 'ACTIVO',
      alerts: [],
    },
  ]);
  if (pErr) console.log('Patients status:', pErr.message);
  else console.log('✅ Pacientes sincronizados');

  // 5. Products
  const { error: prErr } = await supabase.from('products').upsert([
    {
      id: 'prod-1',
      branch_id: 'branch-central',
      code: 'FAR-001',
      commercial_name: 'Cerenia 10ml Inyectable',
      generic_name: 'Maropitant',
      category: 'MEDICAMENTO',
      presentation: 'Frasco ampolla 10ml',
      current_stock: 8,
      min_stock: 3,
      unit: 'FRASCO',
      cost_price: 18500.0,
      sale_price: 32000.0,
      current_batch: 'LOT-MAR-2027',
      expiration_date: '2027-08-30',
      requires_prescription: true,
    },
    {
      id: 'prod-2',
      branch_id: 'branch-central',
      code: 'FAR-002',
      commercial_name: 'Ringer Lactato 500ml',
      generic_name: 'Solución Hidroelectrolítica',
      category: 'DESCARTABLE',
      presentation: 'Sachet 500ml',
      current_stock: 24,
      min_stock: 10,
      unit: 'UNIDAD',
      cost_price: 1200.0,
      sale_price: 2900.0,
      current_batch: 'LOT-RL-889',
      expiration_date: '2028-01-15',
      requires_prescription: false,
    },
  ]);
  if (prErr) console.log('Products status:', prErr.message);
  else console.log('✅ Farmacia sincronizada');

  console.log('--- Fin de sincronización inicial ---');
}

seedData();
