import React, { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import useApi from '../hooks/useApi';
import api from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';

export default function PostView() {
  const { id } = useParams();
  const { data, loading, error, setData } = useApi(`/posts/${id}`);
  const { user } = useContext(AuthContext);

  const [commentLoading, setCommentLoading] = useState(false);
  const [replyContent, setReplyContent] = useState({});
  const [replying, setReplying] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editContent, setEditContent] = useState('');

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  const post = data;
  if (!post) return <div className="text-gray-500 p-4">Post not found</div>;

  const BACKEND_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/i, '');
  const resolveImage = (img) => {
    if (!img) return null;
    if (/^https?:\/\//i.test(img)) return img;
    if (img.includes('/uploads')) return `${BACKEND_HOST}${img.startsWith('/') ? img : '/' + img}`;
    if (img.startsWith('/')) return `${BACKEND_HOST}${img}`;
    return `${BACKEND_HOST}/uploads/${img}`;
  };
  const imgSrc = resolveImage(post.featuredImage);

  // Add comment
  const addComment = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please log in to comment');
    const content = e.target.content.value.trim();
    if (!content) return;
    try {
      setCommentLoading(true);
      const res = await api.post(`/posts/${id}/comments`, { content });
      setData(res.data);
      e.target.reset();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  // Like comment
  const handleLike = async (commentId) => {
    if (!user) return alert('Please log in to like');
    try {
      const res = await api.post(`/posts/${id}/comments/${commentId}/like`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to like comment', err);
    }
  };

  // Reply to comment
  const handleReply = async (commentId) => {
    if (!user) return alert('Please log in to reply');
    const content = replyContent[commentId]?.trim();
    if (!content) return;
    try {
      const res = await api.post(`/posts/${id}/comments/${commentId}/reply`, { content });
      setData(res.data);
      setReplying(null);
      setReplyContent({ ...replyContent, [commentId]: '' });
    } catch (err) {
      console.error('Failed to reply', err);
    }
  };

  // Edit comment
  const handleEdit = async (commentId) => {
    if (!user) return alert('Please log in');
    const content = editContent.trim();
    if (!content) return alert('Comment cannot be empty');
    try {
      const res = await api.put(`/posts/${id}/comments/${commentId}`, { content });
      setData(res.data);
      setEditing(null);
      setEditContent('');
    } catch (err) {
      console.error('Failed to edit comment', err);
    }
  };

  // Delete comment
  const handleDelete = async (commentId) => {
    if (!user) return alert('Please log in');
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const res = await api.delete(`/posts/${id}/comments/${commentId}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-gray-900">{post.title}</h1>

      {imgSrc && (
        <div className="mb-8 relative w-full aspect-video bg-slate-100 rounded-lg overflow-hidden shadow-lg">
          <img src={imgSrc} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
        </div>
      )}

      <div className="prose max-w-none mb-12" dangerouslySetInnerHTML={{ __html: post.content }} />

      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-2xl font-semibold mb-6 text-gray-800">Comments</h3>

        <ul className="space-y-6 mb-8">
          {post.comments?.map((c) => {
            const author = c.user || {};
            const avatarSrc = resolveImage(author?.avatar);
            const liked = c.likes?.includes(user?._id);
            const isAuthor = user?._id === author?._id;

            return (
              <li key={c._id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt={author?.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                        {author?.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <strong className="text-blue-600">{author?.name || 'Unknown'}</strong>

                    {editing === c._id ? (
                      <div className="mt-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows="2"
                          className="w-full p-2 border rounded-md text-sm"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleEdit(c._id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditing(null);
                              setEditContent('');
                            }}
                            className="bg-gray-400 text-white px-3 py-1 rounded text-sm hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-gray-700">{c.content}</p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <button
                        onClick={() => handleLike(c._id)}
                        className={`flex items-center gap-1 ${liked ? 'text-blue-600 font-semibold' : 'hover:text-blue-500'}`}
                      >
                        👍 {c.likes?.length || 0}
                      </button>

                      <button
                        onClick={() => setReplying(replying === c._id ? null : c._id)}
                        className="hover:text-blue-500"
                      >
                        💬 Reply
                      </button>

                      {isAuthor && (
                        <>
                          <button
                            onClick={() => {
                              setEditing(c._id);
                              setEditContent(c.content);
                            }}
                            className="hover:text-green-600"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(c._id)}
                            className="hover:text-red-600"
                          >
                            🗑️ Delete
                          </button>
                        </>
                      )}
                    </div>

                    {c.replies?.length > 0 && (
                      <ul className="mt-3 ml-6 border-l pl-4 space-y-2">
                        {c.replies.map((r) => (
                          <li key={r._id}>
                            <strong className="text-blue-600">{r.user?.name || 'User'}:</strong>{' '}
                            <span className="text-gray-700">{r.content}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {replying === c._id && (
                      <div className="mt-3 ml-6">
                        <textarea
                          value={replyContent[c._id] || ''}
                          onChange={(e) => setReplyContent({ ...replyContent, [c._id]: e.target.value })}
                          placeholder="Write your reply..."
                          rows="2"
                          className="w-full p-2 border rounded-md text-sm"
                        />
                        <button
                          onClick={() => handleReply(c._id)}
                          className="mt-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                        >
                          Reply
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <form onSubmit={addComment} className="space-y-4">
          <textarea
            name="content"
            placeholder="Write your comment..."
            required
            rows="3"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={commentLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            {commentLoading ? 'Posting...' : 'Add comment'}
          </button>
        </form>
      </div>
    </div>
  );
}
