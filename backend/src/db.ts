/**
 * CONEXIÓN A BASE DE DATOS
 * 
 * Configuración del pool de conexiones a PostgreSQL
 * 
 * @module Database
 */

import { Pool } from 'pg'

/**
 * Pool de conexiones a PostgreSQL
 * 
 * Configuración:
 * - connectionString: URL completa de conexión (desde variables de entorno)
 * - ssl: requerido para conexiones a Supabase (rejectUnauthorized: false)
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export default pool