import { useState } from 'react'
import Header from './components/header'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedUser, setSelectedUser] = useState('') // New state for user selection
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResponse, setUploadResponse] = useState(null)
  const [error, setError] = useState(null)
  const [showUserWarning, setShowUserWarning] = useState(false) // New state for warning

  // Sample user list - replace with your actual users
  const userList = [
    { id: 1, name: 'Sutapa Roy' },
    { id: 2, name: 'Subhasini T S' },
    { id: 3, name: 'Namrata Srivastava' },
  ]

  // Validate if file is Excel
  const isExcelFile = (file) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm
    ]
    return allowedTypes.includes(file.type)
  }

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!isExcelFile(file)) {
      setError('Please select a valid Excel file (.xlsx, .xls, .xlsm)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setError('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    setError(null)
    setUploadResponse(null)
  }

  // Handle user selection
  const handleUserSelect = (e) => {
    setSelectedUser(e.target.value)
    setShowUserWarning(false) // Hide warning when user selects
  }

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Upload file to backend
  const uploadFile = async () => {
    if (!selectedFile) return

    // Validate user selection
    if (!selectedUser) {
      setShowUserWarning(true)
      setTimeout(() => setShowUserWarning(false), 3000) // Auto-hide after 3 seconds
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('username', selectedUser)

      const response = await fetch(
        'https://ticket-update-backend.vercel.app/upload-excel',
        {
          // Replace with your backend endpoint
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText}`
        )
      }

      const result = await response.json()
      setUploadResponse(result)
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  // Reset upload state
  const resetUpload = () => {
    setSelectedFile(null)
    setSelectedUser('') // Reset user selection
    setUploadResponse(null)
    setError(null)
    setShowUserWarning(false) // Hide warning
    // Reset file input
    const fileInput = document.getElementById('uploadFile1')
    if (fileInput) fileInput.value = ''
  }

  return (
    <>
      <Header />
      <div className='max-w-4xl mx-auto mt-4 px-4'>
        {/* Floating Warning for User Selection */}
        {showUserWarning && (
          <div className='fixed top-20 right-6 z-50 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center animate-bounce'>
            <svg
              className='w-5 h-5 mr-2'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                clipRule='evenodd'
              />
            </svg>
            Please select a username before uploading!
          </div>
        )}

        {/* User Selection Dropdown */}
        <div className='max-w-md mx-auto mt-6'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Select User <span className='text-red-500'>*</span>
          </label>
          <select
            value={selectedUser}
            onChange={handleUserSelect}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              showUserWarning ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value=''>-- Select a user --</option>
            {userList.map((user) => (
              <option key={user.id} value={user.name}>
                {user.name}
              </option>
            ))}
          </select>
          {showUserWarning && (
            <p className='text-red-500 text-sm mt-1'>This field is required</p>
          )}
        </div>

        {/* File Upload Area */}
        <div
          className={`bg-gray-50 text-center px-4 rounded max-w-md flex flex-col items-center justify-center cursor-pointer border-2 border-dashed mx-auto mt-6 transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : selectedFile
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className='py-6'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='w-10 mb-4 fill-slate-600 inline-block'
              viewBox='0 0 32 32'
            >
              <path
                d='M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z'
                data-original='#000000'
              />
              <path
                d='M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z'
                data-original='#000000'
              />
            </svg>
            <h4 className='text-base font-semibold text-slate-600'>
              {selectedFile ? selectedFile.name : 'Drag and drop files here'}
            </h4>
          </div>

          <hr className='w-full border-gray-300 my-2' />

          <div className='py-6'>
            <input
              type='file'
              id='uploadFile1'
              className='hidden'
              accept='.xlsx,.xls,.xlsm'
              onChange={handleFileInputChange}
            />
            <label
              htmlFor='uploadFile1'
              className='block px-6 py-2.5 rounded text-slate-600 text-sm tracking-wider font-semibold border-none outline-none cursor-pointer bg-gray-200 hover:bg-gray-100'
            >
              Browse Files
            </label>
            <p className='text-xs text-slate-500 mt-4'>Excel Files Allowed.</p>
          </div>
        </div>

        <div className='max-w-md mx-auto mt-4 p-2 bg-green-50 border border-blue-200 rounded cursor-pointer'>
          <a
            href='https://ticket-update-backend.vercel.app/get-sample-file'
            className='underline text-blue-500'
          >
            Download sample file
          </a>
        </div>

        {/* Error Message */}
        {error && (
          <div className='max-w-md mx-auto mt-4 p-4 bg-red-50 border border-red-200 rounded'>
            <p className='text-red-600 text-sm'>{error}</p>
          </div>
        )}

        {/* Selected File Info */}
        {selectedFile && (
          <div className='max-w-md mx-auto mt-4 p-4 bg-blue-50 border border-blue-200 rounded'>
            <h5 className='font-semibold text-blue-800 mb-2'>
              Upload Details:
            </h5>
            {selectedUser && (
              <p className='text-sm text-blue-700 mb-1'>User: {selectedUser}</p>
            )}
            <p className='text-sm text-blue-700'>File: {selectedFile.name}</p>
            <p className='text-sm text-blue-700'>
              Size: {(selectedFile.size / 1024).toFixed(2)} KB
            </p>

            <div className='mt-4 space-x-2'>
              <button
                onClick={uploadFile}
                disabled={isUploading}
                className={`px-4 py-2 rounded text-white font-semibold transition-colors ${
                  isUploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : !selectedUser
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isUploading ? 'Uploading...' : 'Upload File'}
              </button>

              <button
                onClick={resetUpload}
                className='px-4 py-2 rounded text-gray-600 font-semibold bg-gray-200 hover:bg-gray-300'
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Upload Response */}
        {uploadResponse && (
          <div className='max-w-2xl mx-auto mt-6 p-4 bg-green-50 border border-green-200 rounded'>
            <h5 className='font-semibold text-green-800 mb-3'>
              Upload Response:
            </h5>

            {uploadResponse.message && (
              <p className='mt-2 text-green-700 font-medium'>
                {uploadResponse.message}
              </p>
            )}

            {uploadResponse.data && (
              <div className='mt-3'>
                <h6 className='font-medium text-green-800'>Processed Data:</h6>
                <div className='mt-2 text-sm text-green-700'>
                  {Array.isArray(uploadResponse.data) && (
                    <p>Records processed: {uploadResponse.data.length}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading Indicator */}
        {isUploading && (
          <div className='max-w-md mx-auto mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded'>
            <div className='flex items-center'>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600'></div>
              <span className='ml-2 text-yellow-700'>Uploading file...</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default App
