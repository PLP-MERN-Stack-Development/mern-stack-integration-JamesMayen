import React from 'react';
import { Link } from 'react-router-dom';

export default function PostCard({ post }){
  // Resolve image src: handle absolute URLs, paths that include '/uploads', or bare filenames
  const BACKEND_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/i, '');
  const resolveImage = (img) => {
    if (!img) return null;
    if (/^https?:\/\//i.test(img)) return img; // already absolute

    // If already includes /uploads, ensure it has a leading slash and prefix host
    if (img.includes('/uploads')) {
      const path = img.startsWith('/') ? img : `/${img}`;
      return `${BACKEND_HOST}${path}`;
    }

    // If img starts with a slash (but not /uploads), prefix host as-is
    if (img.startsWith('/')) return `${BACKEND_HOST}${img}`;

    // If img starts with 'uploads/' or is a bare filename, map to /uploads/<img>
    return `${BACKEND_HOST}/uploads/${img}`;
  };

  const imgSrc = resolveImage(post.featuredImage);
  const excerpt = (post.content ?? post.body ?? '').replace(/<[^>]*>/g, '').slice(0, 140).trim();

  return (
    <article className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
      {/* Image */}
      {imgSrc ? (
        <div className="relative w-full aspect-video bg-slate-100">
          <img
            src={imgSrc}
            alt={post.title || 'Post image'}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.parentElement.classList.add('error');
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 opacity-0 error:opacity-100">
            <span className="text-sm">Image not available</span>
          </div>
        </div>
      ) : (
        <div className="relative w-full aspect-video bg-slate-100 flex items-center justify-center text-gray-400">
          <span className="text-sm">No image</span>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 leading-tight">
          <Link to={`/post/${post._id}`} className="hover:text-blue-600 transition-colors">{post.title}</Link>
        </h3>

        <p className="text-sm text-gray-600 mb-3">{excerpt}{excerpt.length >= 140 ? '...' : ''}</p>

        <div className="flex flex-wrap gap-2">
          {(post.categories||[]).map(c => (
            <span key={c._id} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">{c.name}</span>
          ))}
        </div>
      </div>
    </article>
  );
}
