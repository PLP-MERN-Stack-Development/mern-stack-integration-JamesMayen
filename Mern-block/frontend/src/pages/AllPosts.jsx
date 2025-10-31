import React, { useState, useContext } from 'react';
import useApi from '../hooks/useApi';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import { AuthContext } from '../context/AuthContext';

export default function AllPosts() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const { user } = useContext(AuthContext);
  
  // Fetch posts excluding the current user's posts
  const { data, loading, error, reload } = useApi('/posts', { 
    params: { 
      page, 
      limit: 6, 
      search: q,
      excludeAuthor: user?.id // Exclude current user's posts
    } 
  });

  const posts = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Community Posts</h1>
      
      {/* Search bar */}
      <div className="flex gap-2 md:gap-4 mb-6 items-center">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search posts..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => { setPage(1); reload(); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Search
        </button>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-lg text-gray-700">Loading...</div>
        </div>
      )}
      {error && (
        <div className="mb-4 text-red-700 bg-red-50 px-4 py-2 rounded-md">
          {error}
        </div>
      )}

      {/* Posts grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {posts.map(p => <PostCard key={p._id} post={p} />)}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center">
        <Pagination
          page={pagination.page || 1}
          total={pagination.total || 0}
          limit={pagination.limit || 6}
          onPageChange={p => setPage(p)}
        />
      </div>
    </div>
  );
}