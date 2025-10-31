import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';
import useApi from '../hooks/useApi';

export default function CreateEditPost(){
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: existing } = useApi(id ? `/posts/${id}` : null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [file, setFile] = useState(null);

  // load categories for selection
  useEffect(()=> {
    api.get('/categories')
      .then(r => {
        // normalize response to an array for safety
        const payload = r?.data;
        if (Array.isArray(payload)) setCategories(payload);
        else if (Array.isArray(payload?.data)) setCategories(payload.data);
        else {
          console.warn('Unexpected categories response, normalizing to empty array', payload);
          setCategories([]);
        }
      })
      .catch(err => {
        console.error('Failed to load categories', err);
        setCategories([]);
      });
  }, []);

  useEffect(()=> {
    if (existing) {
      setTitle(existing.title);
      // handle either `body` or `content` field from API
      setBody(existing.body ?? existing.content ?? '');
      // set selected category if present
      if (existing.category) setSelectedCategory(existing.category._id || existing.category);
      // map existing categories by id
    }
  }, [existing]);

  const submit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Login required');

    const form = new FormData();
    form.append('title', title);
    form.append('body', body);
    if (selectedCategory) {
      form.append('category', selectedCategory);
    }
    
    // Handle file upload
    if (file) {
      form.append('featuredImage', file);
      console.log('Appending file:', file.name, file.type);
    }

    try {
      let res;
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      
      if (id) {
        res = await api.put(`/posts/${id}`, form, config);
      } else {
        res = await api.post('/posts', form, config);
      }

      // If create returned the new post, navigate to its PostView
      const postId = res?.data?._id || id;
      // After create/edit, return to the dashboard so user sees the new post in the list
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12">
      <div className="w-full max-w-3xl bg-white shadow-md rounded-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">{id ? 'Edit' : 'Create'} Post</h1>
          <div className="text-sm text-gray-500">{user?.name ? `Author: ${user.name}` : 'Not signed in'}</div>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="Post title"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            {categories && categories.length > 0 ? (
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat._id || cat.id || cat} value={cat._id ?? cat.id ?? cat}>
                    {cat.name ?? cat}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-500">No categories available. Create one first.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              required
              placeholder="Body (HTML allowed)"
              className="w-full h-56 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            />
            <p className="mt-2 text-xs text-gray-400">You can paste HTML content. Use the editor carefully.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setFile(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">Selected: <span className="font-medium">{file.name}</span></p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
