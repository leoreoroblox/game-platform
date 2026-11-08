// 檔案路徑：app/forum/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
// ⭐️ 路徑修復：兩個點代表退到 app 資料夾，再兩個點代表退到最外層找 lib
import { getCategories, getPosts, ForumCategory, ForumPost } from '../../lib/forum'

export default function ForumLobby() {
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const cats = await getCategories()
        const postsData = await getPosts(activeCategory)
        setCategories(cats)
        setPosts(postsData)
      } catch (error) {
        console.error('載入失敗', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [activeCategory])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-500">Community Forum</h1>
          <Link 
            href="/forum/create" 
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg transition-colors"
          >
            + New Post
          </Link>
        </div>

        <div className="flex gap-6">
          <div className="w-1/4 space-y-2">
            <button
              onClick={() => setActiveCategory(undefined)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeCategory === undefined ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              🌐 All Discussions
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                  activeCategory === cat.id ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          <div className="w-3/4 space-y-4">
            {loading ? (
              <div className="text-center py-10 text-gray-400">Loading the latest posts...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-10 text-gray-400 bg-gray-800 rounded-lg border border-gray-700">
                No posts here yet. Be the first to start a discussion!
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-yellow-500 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <Link href={`/forum/${post.id}`} className="text-xl font-bold hover:text-yellow-400 transition-colors">
                      {post.is_pinned && <span className="text-yellow-500 mr-2">📌 [Pinned]</span>}
                      {post.title}
                    </Link>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-600 overflow-hidden">
                        {post.users?.avatar_url ? (
                          <img src={post.users.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-yellow-500 text-black flex items-center justify-center text-xs font-bold">
                            {post.users?.username?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      <span className="text-gray-300">{post.users?.username || 'Unknown'}</span>
                      {post.users?.role === 'owner' && <span className="text-red-400 font-bold text-xs">OWNER</span>}
                    </div>
                    <span>• {new Date(post.created_at).toLocaleDateString()}</span>
                    
                    <div className="ml-auto flex gap-4">
                      <span title="Replies">💬 {post.reply_count}</span>
                      <span title="Likes">👍 {post.like_count}</span>
                      <span title="Views">👁️ {post.view_count}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}