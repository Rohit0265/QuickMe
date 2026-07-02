import React, { useState, useRef } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { ArrowLeft, Image as ImageIcon, MapPin, ChevronDown, Check } from "lucide-react";
import { Link } from "react-router";

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
  const { user: clerkUser } = useUser();
  
  const [uploadType, setUploadType] = useState<"video" | "image">("image");
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
      setError("Please select a valid video file.");
      setFile(null);
      setFilePreview(null);
      return;
    }

    if (uploadType === "image" && !isImage) {
      setError("Please select a valid image file.");
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

  const handleUpload = async () => {
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

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 120);

    try {
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
      setFile(null);
      setFilePreview(null);
      setCaption("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to upload file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased pb-20 flex flex-col justify-between">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-900 px-4 py-3 flex items-center justify-between max-w-4xl mx-auto w-full">
        <Link to="/" className="text-zinc-400 hover:text-white flex items-center gap-2 text-sm font-semibold transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Cancel
        </Link>
        <span className="font-semibold text-base">Create new post</span>
        <button
          onClick={handleUpload}
          disabled={!file || loading || !userId}
          className="text-sky-500 hover:text-white font-semibold text-sm cursor-pointer disabled:opacity-30 disabled:hover:text-sky-500 transition-colors"
        >
          {loading ? "Sharing..." : "Share"}
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[500px]">
          
          {/* Left Column: Media Uploader / Preview */}
          <div className="flex-1 bg-zinc-950 relative flex items-center justify-center border-b md:border-b-0 md:border-r border-zinc-900 min-h-[350px] md:min-h-0">
            
            <input
              type="file"
              ref={fileInputRef}
              disabled={!userId || loading}
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              className="hidden"
              accept={uploadType === "video" ? "video/*" : "image/*"}
            />

            {!filePreview && !uploadResult && (
              <div
                onDragOver={userId ? handleDragOver : undefined}
                onDragLeave={userId ? handleDragLeave : undefined}
                onDrop={userId ? handleDrop : undefined}
                className={`w-full h-full p-8 flex flex-col items-center justify-center text-center select-none ${
                  isDragOver ? "bg-zinc-900/50" : ""
                }`}
              >
                <div className="text-white mb-4">
                  <ImageIcon className="w-20 h-20 stroke-[1.2] text-zinc-300 mx-auto" />
                </div>
                <p className="text-lg font-light text-zinc-200">Drag photos and videos here</p>
                
                <button
                  type="button"
                  disabled={!userId || loading}
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-6 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-semibold text-sm py-1.5 px-4 rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                >
                  Select from computer
                </button>

                {/* Internal toggle for type */}
                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setUploadType("image")}
                    className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                      uploadType === "image"
                        ? "bg-white text-black border-white"
                        : "text-zinc-400 border-zinc-800 hover:border-zinc-500"
                    }`}
                  >
                    Photos
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadType("video")}
                    className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                      uploadType === "video"
                        ? "bg-white text-black border-white"
                        : "text-zinc-400 border-zinc-800 hover:border-zinc-500"
                    }`}
                  >
                    Videos
                  </button>
                </div>
              </div>
            )}

            {filePreview && !uploadResult && (
              <div className="w-full h-full relative flex items-center justify-center bg-black group select-none">
                {uploadType === "video" ? (
                  <video
                    src={filePreview}
                    controls
                    className="w-full h-full max-h-[500px] object-contain"
                  />
                ) : (
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-full h-full max-h-[500px] object-contain"
                  />
                )}
                
                {/* Remove button */}
                {!loading && (
                  <button
                    onClick={handleRemoveFile}
                    className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white p-2 rounded-full transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Success Upload State */}
            {uploadResult && (
              <div className="w-full h-full p-8 flex flex-col items-center justify-center text-center select-none bg-zinc-950">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Your post has been shared.</h3>
                <p className="text-sm text-zinc-400 max-w-xs mb-6">
                  The media file was uploaded to Cloudinary and registered to your timeline.
                </p>
                <Link
                  to="/"
                  className="bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm py-1.5 px-4 rounded-lg transition-colors"
                >
                  Go to Feed
                </Link>
              </div>
            )}

          </div>

          {/* Right Column: Metadata Panel */}
          <div className="w-full md:w-[300px] flex flex-col bg-zinc-950 p-4 justify-between">
            
            <div className="space-y-4">
              {/* Logged in user profile */}
              {clerkUser && (
                <div className="flex items-center gap-3">
                  <img
                    src={clerkUser.imageUrl}
                    alt={clerkUser.username || "profile"}
                    className="w-8 h-8 rounded-full object-cover border border-zinc-800"
                  />
                  <span className="font-semibold text-sm text-left">{clerkUser.username || "user"}</span>
                </div>
              )}

              {/* Caption Box */}
              <div>
                <textarea
                  value={caption}
                  disabled={loading || !userId}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  maxLength={2200}
                  rows={6}
                  className="w-full bg-transparent border-none resize-none p-0 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-0"
                />
                
                {/* Character count & emojis */}
                <div className="flex justify-between items-center text-xs text-zinc-500 mt-2 border-b border-zinc-900 pb-3">
                  <button className="text-zinc-500 hover:text-zinc-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <span>{caption.length}/2,200</span>
                </div>
              </div>

              {/* Settings Rows */}
              <div className="space-y-3 pt-2 text-sm text-left">
                <div className="flex items-center justify-between text-zinc-300 py-1 hover:text-white cursor-pointer">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-zinc-400" />
                    <span>Add location</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                </div>
                
                <div className="flex items-center justify-between text-zinc-300 py-1 hover:text-white cursor-pointer border-t border-zinc-900 pt-3">
                  <span>Collaborators</span>
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                </div>

                <div className="flex items-center justify-between text-zinc-300 py-1 hover:text-white cursor-pointer border-t border-zinc-900 pt-3">
                  <span>Advanced settings</span>
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                </div>
              </div>
            </div>

            {/* Bottom State Monitor */}
            <div className="pt-4 border-t border-zinc-900">
              {loading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-sky-400">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-[3px] rounded-full overflow-hidden">
                    <div
                      className="bg-sky-500 h-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-xs text-red-500 text-left mt-2">{error}</p>
              )}

              {!userId && (
                <p className="text-xs text-yellow-500 text-left mt-2">
                  Please log in to upload.
                </p>
              )}
            </div>

          </div>

        </div>
      </main>

    </div>
  );
};

export default Upload;