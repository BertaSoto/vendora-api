import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  connectionString: 'postgresql://postgres.tmhygrmkvjljxerhxuqn:vzGW5oVsAr4kr1w6@aws-1-us-west-1.pooler.supabase.com:5432/postgres',
})

async function main() {
  console.log('=== Executing ALTER TABLE via direct PG connection ===')
  try {
    const result = await pool.query('ALTER TABLE "Product" ALTER COLUMN "price" TYPE DOUBLE PRECISION;')
    console.log('  SUCCESS:', result.command)
  } catch (err: any) {
    console.log('  ERROR:', err.message)
  }

  console.log('\n=== Verify: What type is price column now? ===')
  try {
    const { rows } = await pool.query(`
      SELECT data_type FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'price';
    `)
    console.log('  price column type:', rows[0]?.data_type)
  } catch (err: any) {
    console.log('  ERROR:', err.message)
  }

  await pool.end()
  console.log('\nDone')
}

main().catch(console.error)
