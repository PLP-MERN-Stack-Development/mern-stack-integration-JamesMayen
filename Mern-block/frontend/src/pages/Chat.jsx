import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import useApi from '../hooks/useApi';
import api from '../api/apiClient';
import ChatMessage from '../components/ChatMessage';

export default function Chat() {
  const { user } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const { data: messages, loading, error, reload } = useApi('/chat');

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to send messages');
      return;
    }
    if (!message.trim()) return;

    try {
      await api.post('/chat', { content: message });
      setMessage('');
      reload();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-gray-50 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Community Chat</h1>

        {/* Messages */}
        <div className="space-y-4 mb-6">
          {loading ? (
            <div className="text-center py-4">Loading messages...</div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : messages?.length > 0 ? (
            messages.map(msg => <ChatMessage key={msg._id} message={msg} />)
          ) : (
            <div className="text-gray-500 text-center py-4">No messages yet. Be the first to chat!</div>
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}