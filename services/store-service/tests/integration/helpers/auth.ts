import { createClient } from '@supabase/supabase-js'

export interface TestAuthUser {
  id: string
  email: string
  jwt: string
  cleanup: () => Promise<void>
}

/**
 * Crea un usuario real en Supabase Auth + fila en la tabla pública User,
 * inicia sesión para obtener un JWT válido y devuelve una función de limpieza.
 */
export async function createTestAuthUser(suffix: string): Promise<TestAuthUser> {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY } = process.env
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
    throw new Error('Faltan variables SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY o SUPABASE_ANON_KEY')
  }

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const email = `vitest-int-${suffix}@test.internal`
  const password = 'IntTest123!'

  // 1. Crear usuario en Supabase Auth (email ya confirmado)
  const { data: authData, error: createErr } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (createErr || !authData.user) {
    throw new Error(`No se pudo crear el usuario en Auth: ${createErr?.message}`)
  }
  const userId = authData.user.id

  // 2. Insertar fila en la tabla pública User (requerido por FK Store.merchantId → User.id)
  const { error: userErr } = await adminClient.from('User').insert({
    id: userId,
    email,
    role: 'MERCHANT',
    updatedAt: new Date().toISOString(),
  })
  if (userErr) {
    await adminClient.auth.admin.deleteUser(userId)
    throw new Error(`No se pudo insertar en User: ${userErr.message}`)
  }

  // 3. Sign in para obtener JWT válido
  const { data: sessionData, error: signInErr } = await anonClient.auth.signInWithPassword({
    email,
    password,
  })
  if (signInErr || !sessionData.session) {
    await adminClient.from('User').delete().eq('id', userId)
    await adminClient.auth.admin.deleteUser(userId)
    throw new Error(`No se pudo iniciar sesión: ${signInErr?.message}`)
  }

  return {
    id: userId,
    email,
    jwt: sessionData.session.access_token,
    cleanup: async () => {
      await adminClient.from('User').delete().eq('id', userId)
      await adminClient.auth.admin.deleteUser(userId)
    },
  }
}
