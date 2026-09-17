const { Client } = require('pg');
const fs = require('fs');

async function migrate() {
  const client = new Client({
    user: 'postgres',
    host: 'db.uotzztasrxdxdxunleny.supabase.co',
    database: 'postgres',
    password: 'P@ssw0rd@#$_Hieudev',
    port: 5432,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL successfully!');
    
    const sql = fs.readFileSync('supabase_schema.sql', 'utf8');
    await client.query(sql);
    console.log('Schema created successfully! Tables: products, rental_bookings, orders');
    
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Public tables in Supabase:', res.rows.map(r => r.table_name));
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

migrate();
