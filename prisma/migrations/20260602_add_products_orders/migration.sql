-- Products table
CREATE TABLE IF NOT EXISTS "products" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "store_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "products_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "products_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS "orders" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "product_name" TEXT,
    "quantity" INTEGER NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "orders_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "orders_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "orders_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS "idx_products_store_id" ON "products"("store_id");
CREATE INDEX IF NOT EXISTS "idx_orders_store_id" ON "orders"("store_id");
CREATE INDEX IF NOT EXISTS "idx_orders_user_id" ON "orders"("user_id");

-- Enable RLS (optional, services use service_role key so RLS is bypassed)
-- But configure for good practice:
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;

-- Drop restrictive RLS policies if re-running, then create permissive ones
DROP POLICY IF EXISTS "Service role full access" ON "products";
DROP POLICY IF EXISTS "Service role full access" ON "orders";

CREATE POLICY "Service role full access" ON "products" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON "orders" FOR ALL USING (true) WITH CHECK (true);
