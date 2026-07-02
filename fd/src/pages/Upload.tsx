import React, { useState, useRef } from "react";

interface UploadResult {
  success: boolean;
  message: string;
  url: string;
  public_id: string;
  resource_type: string;
  format: string;
  duration?: number;
  bytes: number;
}

const Upload: React.FC = () => {
  const [uploadType, setUploadType] = useState<"video" | "image">("video");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;

    setError(null);
    setUploadResult(null);

    // Basic format check
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
    
    // Create preview URL
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
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", uploadType);

      const response = await fetch("http://localhost:8080/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong during the upload.");
      }

      setUploadResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to upload file. Make sure Cloudinary credentials are set up on the backend.");
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
            Upload your high-fidelity video or image files securely to Cloudinary using Express, Multer, and TypeScript.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form and Preview - 7 columns */}
          <div className="lg:col-span-7 bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></span>
              Upload Asset
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
                    onClick={() => {
                      setUploadType("video");
                      handleRemoveFile();
                    }}
                    className={`flex items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                      uploadType === "video"
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10"
                        : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10"
                    }`}
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
                    onClick={() => {
                      setUploadType("image");
                      handleRemoveFile();
                    }}
                    className={`flex items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                      uploadType === "image"
                        ? "bg-purple-600/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10"
                        : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10"
                    }`}
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
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  className="hidden"
                  accept={uploadType === "video" ? "video/*" : "image/*"}
                />

                {!file ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                      isDragOver
                        ? "border-indigo-400 bg-indigo-500/10 scale-[0.99]"
                        : "border-white/20 bg-white/0 hover:bg-white/5 hover:border-white/30"
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

              {/* Upload Status / Progress */}
              {loading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-indigo-300">
                    <span>Uploading to Cloudinary Cloud...</span>
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
                disabled={!file || loading}
                className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  !file || loading
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
                    Processing Upload...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Send to Cloudinary
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
                    <span className="font-bold block">Successfully Uploaded!</span>
                    <span>The asset is live in your Cloudinary repository.</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-gray-200">Cloudinary Media Player Preview</h3>
                  
                  {/* Dynamic Render Player */}
                  <div className="rounded-xl overflow-hidden bg-black/40 border border-white/5 p-4 flex flex-col items-center justify-center">
                    {uploadResult.resource_type === "video" ? (
                      <video
                        src={uploadResult.url}
                        controls
                        className="w-full max-h-64 rounded-lg bg-black object-contain shadow-2xl"
                      />
                    ) : (
                      <div className="w-full flex items-center justify-center">
                        <img
                          src={uploadResult.url}
                          alt="Uploaded asset"
                          className="max-w-full max-h-64 rounded-lg object-contain shadow-2xl border border-white/10"
                        />
                      </div>
                    )}
                  </div>

                  {/* Metadata fields */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-2 text-sm text-gray-300">
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
                      <span className="font-mono text-gray-100">{uploadResult.public_id}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-gray-400">Resource Type:</span>
                      <span className="font-semibold text-gray-200 capitalize">{uploadResult.resource_type}</span>
                    </div>
                    {uploadResult.duration && (
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-400">Duration:</span>
                        <span className="font-semibold text-gray-200">{uploadResult.duration.toFixed(2)} seconds</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">File Size:</span>
                      <span className="font-semibold text-gray-200">{(uploadResult.bytes / (1024 * 1024)).toFixed(2)} MB</span>
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
                How It Works
              </h2>

              <div className="space-y-6">
                
                {/* Step 1 */}
                <div className="relative pl-8 border-l border-white/10 pb-2">
                  <div className="absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500 text-blue-300 text-xs font-bold flex items-center justify-center">
                    1
                  </div>
                  <h3 className="font-semibold text-gray-200 text-sm">Multer Form Parsing</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    The frontend wraps your file in a `FormData` envelope and posts it. Express intercepts the request, and `multer` digests the multipart stream.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative pl-8 border-l border-white/10 pb-2">
                  <div className="absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500 text-indigo-300 text-xs font-bold flex items-center justify-center">
                    2
                  </div>
                  <h3 className="font-semibold text-gray-200 text-sm">Temp Storage Allocation</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Multer allocates the file inside the OS default temporary storage folder as an upload stream. This provides the controller with `req.file.path`.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative pl-8 border-l border-white/10 pb-2">
                  <div className="absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500 text-purple-300 text-xs font-bold flex items-center justify-center">
                    3
                  </div>
                  <h3 className="font-semibold text-gray-200 text-sm">Cloudinary API Dispatch</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    The Express controller routes the file to Cloudinary. By setting `resource_type: "video"` for videos or `resource_type: "image"` for photos, Cloudinary processes it correctly.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="relative pl-8">
                  <div className="absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center justify-center">
                    4
                  </div>
                  <h3 className="font-semibold text-gray-200 text-sm">Disk Cleanup & Reply</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Once uploaded, `fs.unlinkSync` sweeps the local system temp file clean. The server responds with the secure HTTPS endpoint and metadata.
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