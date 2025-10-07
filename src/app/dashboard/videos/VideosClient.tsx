'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isValidYouTubeUrl, getYouTubeThumbnail, getYouTubeEmbedUrl } from '@/lib/youtube'

interface Video {
  id: string
  title: string
  url: string
  youtubeId: string
  createdAt: string
}

export default function VideosClient() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const router = useRouter()

  // Form state
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos')
      if (response.ok) {
        const data = await response.json()
        setVideos(data.videos)
      } else {
        setError('Failed to fetch videos')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    if (!url || !title) {
      setError('URL and title are required')
      setSubmitting(false)
      return
    }

    if (!isValidYouTubeUrl(url)) {
      setError('Please enter a valid YouTube URL')
      setSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim(), title: title.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Video added successfully!')
        setUrl('')
        setTitle('')
        setShowAddForm(false)
        fetchVideos() // Refresh the list
      } else {
        setError(data.error || 'Failed to add video')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return
    }

    try {
      const response = await fetch(`/api/videos?id=${videoId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSuccess('Video deleted successfully!')
        fetchVideos() // Refresh the list
      } else {
        setError('Failed to delete video')
      }
    } catch (error) {
      setError('Network error occurred')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading videos...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Video Library</h1>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              Add Video
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Success/Error messages */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <div className="text-green-800">{success}</div>
              <button
                onClick={() => setSuccess('')}
                className="float-right text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="text-red-800">{error}</div>
              <button
                onClick={() => setError('')}
                className="float-right text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          )}

          {/* Add video form modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Video</h3>
                  <form onSubmit={handleAddVideo}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        YouTube URL
                      </label>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter video title"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddForm(false)
                          setUrl('')
                          setTitle('')
                          setError('')
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {submitting ? 'Adding...' : 'Add Video'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Video player modal */}
          {selectedVideo && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50">
              <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{selectedVideo.title}</h3>
                    <button
                      onClick={() => setSelectedVideo(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe
                      src={getYouTubeEmbedUrl(selectedVideo.youtubeId)}
                      title={selectedVideo.title}
                      className="w-full h-96"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Videos grid */}
          {videos.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No videos</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first YouTube video.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Add Video
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative">
                    <img
                      src={getYouTubeThumbnail(video.youtubeId)}
                      alt={video.title}
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() => setSelectedVideo(video)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity cursor-pointer flex items-center justify-center"
                         onClick={() => setSelectedVideo(video)}>
                      <svg className="w-16 h-16 text-white opacity-0 hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                      {video.title}
                    </h3>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Added {new Date(video.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}