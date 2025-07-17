"use client";
import { useState } from "react";

export default function MergePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleMerge = async () => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("file", file));
      const res = await fetch("/api/merge", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to merge PDFs");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-white rounded-2xl shadow-xl border-2 border-transparent bg-clip-padding p-8 max-w-lg w-full relative" style={{ borderImage: 'linear-gradient(90deg, #7FFFD4 0%, #a0ffe6 100%) 1' }}>
        <div className="flex flex-col items-center mb-6">
          <span className="text-5xl mb-2">📎</span>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">Merge PDF</h2>
          <p className="text-gray-600 text-base mb-2 text-center">Combine multiple PDF files into one. Fast, secure, and free.</p>
        </div>
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileChange}
          className="mb-4 block w-full text-gray-700 border border-[#7FFFD4] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7FFFD4]"
        />
        <div className="mb-4">
          {files.length > 0 && (
            <ul className="list-disc pl-5 text-gray-700 text-sm">
              {files.map((file, idx) => (
                <li key={idx}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={handleMerge}
          className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-[#7FFFD4] to-[#a0ffe6] text-gray-900 font-bold text-lg shadow hover:from-[#a0ffe6] hover:to-[#7FFFD4] transition disabled:opacity-50"
          disabled={files.length < 2 || loading}
        >
          {loading ? "Merging..." : "Merge PDFs"}
        </button>
        {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
      </div>
    </div>
  );
} 