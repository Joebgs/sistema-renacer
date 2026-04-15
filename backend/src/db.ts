import { Pool } from 'pg'

const pool = new Pool({
  host: 'aws-1-sa-east-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.gfpshglfiiiiqeaucfsd',
  password: 'checkin2026blanca',
  ssl: false,  // ← Deshabilitar SSL temporalmente
  connectionTimeoutMillis: 10000,
})

export default pool