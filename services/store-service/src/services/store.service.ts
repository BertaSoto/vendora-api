import { randomUUID } from 'crypto'
import { supabase } from '../lib/supabase.js'
import type { Store, StoreRow } from '../types/store.type.js'
import { rowToStore } from '../types/store.type.js'
import type { CreateStoreDto, UpdateStoreDto, StoreResponseDto } from '../dtos/store.dto.js'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

async function uniqueSlug(baseSlug: string): Promise<string> {
  const { data } = await supabase
    .from('Store')
    .select('slug')
    .ilike('slug', `${baseSlug}%`)

  if (!data || data.length === 0) return baseSlug

  const existing = new Set((data as { slug: string }[]).map((r) => r.slug))
  if (!existing.has(baseSlug)) return baseSlug

  let suffix = 2
  while (existing.has(`${baseSlug}-${suffix}`)) {
    suffix++
  }
  return `${baseSlug}-${suffix}`
}

export class StoreService {
  async create(dto: CreateStoreDto): Promise<StoreResponseDto> {
    this.validateCreateDto(dto)

    const now = new Date().toISOString()
    const baseSlug = slugify(dto.name)
    const slug = await uniqueSlug(baseSlug)

    const { data, error } = await supabase
      .from('Store')
      .insert({
        id: randomUUID(),
        merchantId: dto.merchantId,
        name: dto.name,
        slug,
        description: dto.description ?? null,
        status: 'TRIAL',
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single<StoreRow>()

    if (error) {
      console.error('[SUPABASE STORE] create error:', error)
      if (error.code === '23505') {
        throw new Error(`A store with the slug "${slug}" already exists.`)
      }
      throw new Error(error.message)
    }

    return rowToStore(data)
  }

  async findById(id: string): Promise<StoreResponseDto | null> {
    if (!id) throw new Error('id is required')

    const { data, error } = await supabase
      .from('Store')
      .select()
      .eq('id', id)
      .single<StoreRow>()

    if (error) return null
    return rowToStore(data)
  }

  async findBySlug(slug: string): Promise<StoreResponseDto | null> {
    if (!slug) throw new Error('slug is required')

    const { data, error } = await supabase
      .from('Store')
      .select()
      .eq('slug', slug)
      .single<StoreRow>()

    if (error) return null
    return rowToStore(data)
  }

  async findAllByMerchant(merchantId: string): Promise<StoreResponseDto[]> {
    if (!merchantId) throw new Error('merchantId is required')

    const { data, error } = await supabase
      .from('Store')
      .select()
      .eq('merchantId', merchantId)
      .order('createdAt', { ascending: false })

    if (error) throw new Error(error.message)
    return (data as StoreRow[]).map(rowToStore)
  }

  async findAll(): Promise<StoreResponseDto[]> {
    const { data, error } = await supabase
      .from('Store')
      .select()
      .order('createdAt', { ascending: false })

    if (error) throw new Error(error.message)
    return (data as StoreRow[]).map(rowToStore)
  }

  async update(id: string, dto: UpdateStoreDto): Promise<StoreResponseDto | null> {
    if (!id) throw new Error('id is required')

    const updates: Record<string, unknown> = {}
    if (dto.name !== undefined) updates.name = dto.name
    if (dto.description !== undefined) updates.description = dto.description
    if (dto.status !== undefined) updates.status = dto.status

    if (Object.keys(updates).length === 0) {
      throw new Error('at least one field must be provided to update')
    }

    const { data, error } = await supabase
      .from('Store')
      .update(updates)
      .eq('id', id)
      .select()
      .single<StoreRow>()

    if (error) return null
    return rowToStore(data)
  }

  async delete(id: string): Promise<boolean> {
    if (!id) throw new Error('id is required')

    const { error } = await supabase
      .from('Store')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
    return true
  }

  private validateCreateDto(dto: CreateStoreDto): void {
    if (!dto.merchantId) {
      throw new Error('merchantId is required')
    }
    if (!dto.name || dto.name.trim().length === 0) {
      throw new Error('name is required')
    }
    if (dto.name.trim().length < 3) {
      throw new Error('name must be at least 3 characters long')
    }
  }
}

export const storeService = new StoreService()
