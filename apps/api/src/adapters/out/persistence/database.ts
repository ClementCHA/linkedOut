import pg from 'pg'

const { Pool } = pg

export const createPool = () => {
  return new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'linkedout',
    user: process.env.DB_USER || 'linkedout',
    password: process.env.DB_PASSWORD || 'linkedout',
  })
}
