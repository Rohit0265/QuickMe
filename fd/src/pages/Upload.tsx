import React, { useState, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";

interface UserProfile {
  _id: string;
  username: string;
  fullName: string;
  profilePicture: string;
}

interface PostData {
  _id: string;
  user: UserProfile;
  url: string;
  publicId: string;
  type: "image" | "video";
  caption: string;
  createdAt: string;
}

interface UploadResponse {
  success: boolean;
  message: string;
  post: PostData;
}

const Upload: React.FC = () => {
  const { getToken, userId } = useAuth();
  
  const [uploadType, setUploadType] = useState<"video" | "image">("video");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<PostData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;

    setError(null);
    setUploadResult(null);

    const isVideo = selectedFile.type.startsWith("video/");
    const isImage = selectedFile.type.startsWith("image/");

    if (uploadType === "video" && !isVideo) {
      setError("Please select a valid video file (e.g., MP4, WebM, MOV).");
      setFile(null);
      setFilePreview(null);
      return;
    }

    if (uploadType === "image" && !isImage) {
      setError("Please select a valid image file (e.g., JPEG, PNG, WEBP, GIF).");
      setFile(null);
      setFilePreview(null);
      return;
    }

    setFile(selectedFile);
    const previewUrl = URL.createObjectURL(selectedFile);
    setFilePreview(previewUrl);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
    setUploadResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError("You must be logged in to upload assets.");
      return;
    }
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setProgress(0);
    setError(null);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 150);

    try {
      // Get the current Clerk JWT token
      const token = await getToken();
      if (!token) {
        throw new Error("Could not retrieve authentication token. Please log in again.");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", uploadType);
      formData.append("caption", caption);

      const response = await fetch("http://localhost:8080/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data: UploadResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create post.");
      }

      setUploadResult(data.post);
      // Reset form
      setFile(null);
      setFilePreview(null);
      setCaption("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to upload file. Please make sure the backend is active.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-radial from-slate-900 via-gray-950 to-black text-white py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Cloud Media Vault
          </h1>
          <p className="mt-3 text-lg text-gray-400 max-w-xl mx-auto">
            Upload your media to Cloudinary and link it directly to your MongoDB account.
          </p>
        </div>

        {!userId && (
          <div className="max-w-md mx-auto bg-amber-500/15 border border-amber-500/30 rounded-2xl p-6 text-center shadow-xl mb-8">
            <svg className="w-12 h-12 text-amber-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="font-bold text-lg text-amber-200">Authentication Required</h3>
            <p className="text-sm text-gray-400 mt-2">
              Please sign in to upload photos or videos and save them to your profile.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form and Preview - 7 columns */}
          <div className="lg:col-span-7 bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></span>
              Create Post
            </h2>

            <form onSubmit={handleUpload} className="space-y-6">
              
              {/* Media Type Toggle */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  1. Select Media Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    disabled={!userId || loading}
                    onClick={() => {
                      setUploadType("video");
                      handleRemoveFile();
                    }}
                    className={`flex items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                      uploadType === "video"
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10"
                        : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10"
                    } ${!userId ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <div className="text-left">
                      <p className="font-bold text-sm">Video File</p>
                      <p className="text-xs opacity-75">MP4, WebM, MOV</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    disabled={!userId || loading}
                    onClick={() => {
                      setUploadType("image");
                      handleRemoveFile();
                    }}
                    className={`flex items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                      uploadType === "image"
                        ? "bg-purple-600/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10"
                        : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10"
                    } ${!userId ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="text-left">
                      <p className="font-bold text-sm">Photo / Image</p>
                      <p className="text-xs opacity-75">PNG, JPG, WEBP, GIF</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  2. Choose File
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  disabled={!userId || loading}
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  className="hidden"
                  accept={uploadType === "video" ? "video/*" : "image/*"}
                />

                {!file ? (
                  <div
                    onDragOver={userId ? handleDragOver : undefined}
                    onDragLeave={userId ? handleDragLeave : undefined}
                    onDrop={userId ? handleDrop : undefined}
                    onClick={userId ? () => fileInputRef.current?.click() : undefined}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                      !userId
                        ? "border-white/5 bg-white/0 cursor-not-allowed opacity-50"
                        : isDragOver
                        ? "border-indigo-400 bg-indigo-500/10 scale-[0.99] cursor-pointer"
                        : "border-white/20 bg-white/0 hover:bg-white/5 hover:border-white/30 cursor-pointer"
                    }`}
                  >
                    <div className={`p-4 rounded-full bg-white/5 mb-4 text-gray-400 transition-colors ${isDragOver ? "text-indigo-400" : ""}`}>
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-base font-semibold">Drag & drop your file here</p>
                    <p className="text-sm text-gray-500 mt-1">or click to browse your local device</p>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`p-3 rounded-lg ${uploadType === "video" ? "bg-indigo-600/20 text-indigo-300" : "bg-purple-600/20 text-purple-300"}`}>
                        {uploadType === "video" ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="font-semibold text-sm truncate text-gray-200">{file.name}</p>
                        <p className="text-xs text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-gray-400 hover:text-red-400 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Caption field */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  3. Post Caption
                </label>
                <textarea
                  value={caption}
                  disabled={!userId || loading}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={userId ? "Write a caption for your post..." : "Sign in to add a caption"}
                  rows={3}
                  className="w-full bg-white/5 border border-white/25 hover:border-white/40 focus:border-indigo-500 rounded-xl p-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Upload Status / Progress */}
              {loading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-indigo-300">
                    <span>Uploading and creating database entry...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Error Box */}
              {error && (
                <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-4 text-sm text-red-300 flex items-start gap-3">
                  <svg className="w-5 h-5 shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <span className="font-bold block">Upload Error</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!file || loading || !userId}
                className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  !file || loading || !userId
                    ? "bg-white/10 text-gray-500 cursor-not-allowed border border-white/5"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.01]"
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Publishing Post...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Share Post
                  </>
                )}
              </button>

            </form>

            {/* Cloudinary Live Preview Results */}
            {uploadResult && (
              <div className="mt-8 border-t border-white/10 pt-6 animate-fadeIn">
                <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-4 mb-6 text-sm text-emerald-300 flex items-center gap-3">
                  <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span className="font-bold block">Successfully Shared!</span>
                    <span>The post was uploaded to Cloudinary and registered in MongoDB.</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-gray-200">Shared Post Preview</h3>
                  
                  {/* Live Render Card */}
                  <div className="rounded-xl overflow-hidden bg-black/40 border border-white/10 p-4">
                    
                    {/* User Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={uploadResult.user.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"}
                        alt={uploadResult.user.username}
                        className="w-10 h-10 rounded-full object-cover border border-white/20"
                      />
                      <div className="text-left">
                        <p className="font-bold text-sm text-gray-200">@{uploadResult.user.username}</p>
                        <p className="text-xs text-gray-400">{uploadResult.user.fullName}</p>
                      </div>
                    </div>

                    {/* Media Display */}
                    <div className="rounded-lg overflow-hidden bg-black flex items-center justify-center mb-3">
                      {uploadResult.type === "video" ? (
                        <video
                          src={uploadResult.url}
                          controls
                          className="w-full max-h-64 object-contain shadow-2xl"
                        />
                      ) : (
                        <img
                          src={uploadResult.url}
                          alt="Uploaded post"
                          className="max-w-full max-h-64 object-contain shadow-2xl"
                        />
                      )}
                    </div>

                    {/* Caption block */}
                    {uploadResult.caption && (
                      <p className="text-sm text-gray-300 text-left px-1 mt-2">
                        <span className="font-bold text-white mr-2">@{uploadResult.user.username}</span>
                        {uploadResult.caption}
                      </p>
                    )}
                  </div>

                  {/* Metadata fields */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-2 text-sm text-gray-300">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-gray-400">Post ID:</span>
                      <span className="font-mono text-gray-100">{uploadResult._id}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-gray-400">Cloudinary URL:</span>
                      <a
                        href={uploadResult.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:underline font-mono truncate max-w-[250px] sm:max-w-sm"
                      >
                        {uploadResult.url}
                      </a>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-gray-400">Public ID:</span>
                      <span className="font-mono text-gray-100">{uploadResult.publicId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Resource Type:</span>
                      <span className="font-semibold text-gray-200 capitalize">{uploadResult.type}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Explanation Area - 5 columns */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* How it works card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Secure Database Flow
              </h2>

              <div className="space-y-6">
                
                {/* Step 1 */}
                <div className="relative pl-8 border-l border-white/10 pb-2">
                  <div className="absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500 text-blue-300 text-xs font-bold flex items-center justify-center">
                    1
                  </div>
                  <h3 className="font-semibold text-gray-200 text-sm">Clerk JWT Authentication</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    The frontend retrieves the active user's JWT from Clerk and attaches it as an `Authorization: Bearer [token]` header.
                  </p>
                </div>

                {/* Step-2 */}
                <div className="relative pl-8 border-l border-white/10 pb-2">
                  <div className="absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500 text-indigo-300 text-xs font-bold flex items-center justify-center">
                    2
                  </div>
                  <h3 className="font-semibold text-gray-200 text-sm">User DB Verification</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    The backend verifies the token and loads the uploader's `clerkId`. It queries the `User` collection in MongoDB to fetch the corresponding user profile (`_id`).
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative pl-8 border-l border-white/10 pb-2">
                  <div className="absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500 text-purple-300 text-xs font-bold flex items-center justify-center">
                    3
                  </div>
                  <h3 className="font-semibold text-gray-200 text-sm">Cloudinary Storage</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Multer processes the multipart file. The backend uploads it to Cloudinary under the secure folders, returning the asset URL.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="relative pl-8">
                  <div className="absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center justify-center">
                    4
                  </div>
                  <h3 className="font-semibold text-gray-200 text-sm">Post Document Creation</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    The backend creates a new `Post` record in MongoDB referencing the uploader's `User` object `_id`, the Cloudinary URL, and the caption, before returning the populated document.
                  </p>
                </div>

              </div>
            </div>

            {/* Config warning card */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 text-sm">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="space-y-1">
                  <span className="font-bold text-amber-200 block">Required Environment variables</span>
                  <span className="text-gray-300 block text-xs">
                    Please ensure that the following keys are populated in your backend `.env` file for uploads to connect:
                  </span>
                  <code className="block bg-black/30 p-2 rounded text-[11px] text-amber-300/80 font-mono mt-2 break-all space-y-1">
                    CLOUDINARY_NAME=your_cloud_name<br />
                    CLOUDINARY_API_KEY=your_api_key<br />
                    CLOUDINARY_SECRET_KEY=your_api_secret
                  </code>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Upload;