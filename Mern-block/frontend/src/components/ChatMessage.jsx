import React from 'react';

export default function ChatMessage({ message }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center mb-2">
        <div className="font-semibold text-blue-600">{message.author}</div>
        <div className="text-xs text-gray-500 ml-2">
          {new Date(message.createdAt).toLocaleString()}
        </div>
      </div>
      <p className="text-gray-700">{message.content}</p>
    </div>
  );
}