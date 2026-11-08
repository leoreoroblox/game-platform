// 檔案路徑：app/forum/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getPostById, getReplies, toggleVote, createReply, ForumPost } from '../../../lib/forum'

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [post, setPost] = useState<ForumPost | null>(null)
  const [replies, setReplies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // 新增：留言相關的狀態
  const [replyContent, setReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 載入文章和留言
  const loadData = async () => {
    try {
      setLoading(true)
      const postData = await getPostById(postId)
      const repliesData = await getReplies(postId)
      setPost(postData)
      setReplies(repliesData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (postId) loadData()
  }, [postId])

  // 處理按讚/倒讚
  const handleVote = async (value: 1 | -1) => {
    try {
      await toggleVote('post', postId, value)
      await loadData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // 處理送出留言
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim()) return

    try {
      setIsSubmitting(true)
      await createReply(postId, replyContent)
      setReplyContent('') // 清空輸入框
      await loadData()    // 重新載入留言列表
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-6 flex justify-center">Loading...</div>
  if (!post) return <div className="min-h-screen bg-gray-900 text-white p-6 flex justify-center">Post not found.</div>

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.push('/forum')} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2">
          ← Back to Forum
        </button>

        {/* 文章主體 */}
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-8">
          <h1 className="text-3xl font-bold text-yellow-500 mb-4">{post.title}</h1>
          
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-700">
            <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden">
              {post.users?.avatar_url ? (
                <img src={post.users.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-yellow-500 text-black flex items-center justify-center font-bold">
                  {post.users?.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="font-bold flex items-center gap-2">
                {post.users?.username}
                {post.users?.role === 'owner' && <span className="text-red-500 text-xs bg-red-500/10 px-2 py-0.5 rounded">OWNER</span>}
              </div>
              <div className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString()}</div>
            </div>
          </div>

          <div className="whitespace-pre-wrap text-gray-300 leading-relaxed mb-8">
            {post.content}
          </div>

          <div className="flex items-center gap-4 bg-gray-900/50 p-4 rounded-lg">
            <button onClick={() => handleVote(1)} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-green-400">
              👍 {post.like_count}
            </button>
            <button onClick={() => handleVote(-1)} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-red-400">
              👎 {post.dislike_count}
            </button>
            <span className="ml-auto text-sm text-gray-500">👁️ {post.view_count} views</span>
          </div>
        </div>

        {/* 留言區塊 */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">Replies ({replies.length})</h3>
          
          {/* 留言輸入表單 */}
          <form onSubmit={handleSubmitReply} className="mb-8">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              rows={3}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500 resize-none mb-3"
              required
            />
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : 'Post Reply'}
              </button>
            </div>
          </form>

          {/* 留言列表 */}
          {replies.length === 0 ? (
            <div className="text-gray-500 text-center py-4">No replies yet. Be the first!</div>
          ) : (
            <div className="space-y-4">
              {replies.map((reply) => (
                <div key={reply.id} className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-sm text-yellow-500">{reply.users?.username}</span>
                    {reply.users?.role === 'owner' && <span className="text-red-500 text-[10px] bg-red-500/10 px-1.5 py-0.5 rounded">OWNER</span>}
                    <span className="text-xs text-gray-500 ml-auto">{new Date(reply.created_at).toLocaleString()}</span>
                  </div>
                  <div className="whitespace-pre-wrap text-gray-300 text-sm">{reply.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}