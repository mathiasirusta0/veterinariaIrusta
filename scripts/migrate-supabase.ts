import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pg;

// Supabase project connection hosts
const hosts = [
  'db.vgsrmfedfyvcjoexeolt.supabase.co',
  'aws-0-sa-east-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-us-west-1.pooler.supabase.com',
];

async function runMigration() {
  console.log('🚀 Iniciando creación automática de tablas en Supabase...');
  
  const schemaSql = fs.readFileSync(path.join(process.cwd(), 'supabase', 'schema.sql'), 'utf-8');
  const seedSql = fs.readFileSync(path.join(process.cwd(), 'supabase', 'seed.sql'), 'utf-8');

  let connected = false;

  for (const host of hosts) {
    console.log(`Intentando conectar a host PostgreSQL: ${host}...`);
    const isPooler = host.includes('pooler.supabase.com');
    const user = isPooler ? 'postgres.vgsrmfedfyvcjoexeolt' : 'postgres';
    const port = isPooler ? 6543 : 5432;

    const client = new Client({
      host,
      port,
      user,
      password: 'Mathias36133340',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });

    try {
      await client.connect();
      console.log(`✅ Conexión establecida con PostgreSQL en ${host}!`);
      connected = true;

      console.log('Ejecutando schema.sql (creando 22 tablas con RLS e índices)...');
      await client.query(schemaSql);
      console.log('✅ Esquema DDL creado exitosamente.');

      console.log('Ejecutando seed.sql (insertando datos iniciales)...');
      await client.query(seedSql);
      console.log('✅ Datos iniciales insertados con éxito.');

      await client.end();
      break;
    } catch (err: any) {
      console.log(`Falló conexión con ${host}:`, err.message);
      try {
        await client.end();
      } catch {}
    }
  }

  if (!connected) {
    console.log('\n⚠️ No se pudo conectar por puerto directo 5432/6543 (posible bloqueo de firewall o IPv4 add-on requerido en Supabase).');
    console.log('👉 Se puede ejecutar el script en 1 clic desde el SQL Editor del panel web de Supabase:');
    console.log('https://supabase.com/dashboard/project/vgsrmfedfyvcjoexeolt/sql/new');
  }
}

runMigration();
