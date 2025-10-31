import React from 'react'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  // Don’t render if only one page
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i)
  }

  return (
    <div className="flex justify-center items-center space-x-2 mt-6">
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md border text-sm font-medium 
                   bg-white dark:bg-gray-800 
                   disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Previous
      </button>

      {/* Page numbers */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-md border text-sm font-medium 
                      ${page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
        >
          {page}
        </button>
      ))}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md border text-sm font-medium 
                   bg-white dark:bg-gray-800 
                   disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Next
      </button>
    </div>
  )
}
