// 檔案路徑：lib/forum.ts
import { supabase } from './supabase'

export type ForumCategory = {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  accent_color: string
  sort_order: number
}

export type ForumPost = {
  id: string
  category_id: string
  author_id: string
  title: string
  content: string
  is_pinned: boolean
  view_count: number
  like_count: number
  dislike_count: number
  reply_count: number
  last_activity_at: string
  created_at: string
  users?: { username: string; avatar_url: string; role: string }
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('forum_categories')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data as ForumCategory[]
}

export async function getPosts(categoryId?: string) {
  let query = supabase
    .from('forum_posts')
    .select(`*, users (username, avatar_url, role)`)
    .eq('is_deleted', false)
    .order('is_pinned', { ascending: false })
    .order('last_activity_at', { ascending: false })

  if (categoryId) query = query.eq('category_id', categoryId)

  const { data, error } = await query
  if (error) throw error
  return data as ForumPost[]
}

export async function createPost(categoryId: string, title: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be logged in to post.')

  const { data, error } = await supabase
    .from('forum_posts')
    .insert({ category_id: categoryId, author_id: user.id, title, content })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getPostById(id: string) {
  const { data, error } = await supabase
    .from('forum_posts')
    .select(`*, users (username, avatar_url, role)`)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as ForumPost
}

export async function getReplies(postId: string) {
  const { data, error } = await supabase
    .from('forum_replies')
    .select(`*, users (username, avatar_url, role)`)
    .eq('post_id', postId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data
}

export async function toggleVote(targetType: 'post' | 'reply', targetId: string, value: 1 | -1) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please log in first.')

  const { data: existing } = await supabase
    .from('forum_votes')
    .select('*')
    .eq('user_id', user.id)
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .single()

  if (existing) {
    if (existing.value === value) {
      await supabase.from('forum_votes').delete().eq('id', existing.id)
    } else {
      await supabase.from('forum_votes').update({ value }).eq('id', existing.id)
    }
  } else {
    await supabase.from('forum_votes').insert({
      user_id: user.id,
      target_type: targetType,
      target_id: targetId,
      value
    })
  }
}

export async function createReply(postId: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be logged in to reply.')

  const { data, error } = await supabase
    .from('forum_replies')
    .insert({ post_id: postId, author_id: user.id, content })
    .select()

  if (error) throw error
  return data
}