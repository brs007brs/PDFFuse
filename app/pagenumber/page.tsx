"use client";
import { useState } from "react";

export default function PageNumberPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handlePageNumber = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/pagenumber", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to add page numbers");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "numbered.pdf";
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
      <div className="bg-white rounded-2xl shadow-xl border-2 border-transparent bg-clip-padding p-8 max-w-lg w-full relative">
        <div className="flex flex-col items-center mb-6">
          <span className="text-5xl mb-2">🔢</span>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">Add Page Numbers</h2>
          <p className="text-gray-600 text-base mb-2 text-center">Insert page numbers into your PDF.</p>
        </div>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="mb-4 block w-full text-gray-700 border border-[#7FFFD4] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7FFFD4]"
        />
        <div className="mb-4">
          {file && <div className="text-gray-700 text-sm">{file.name}</div>}
        </div>
        <button
          onClick={handlePageNumber}
          className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-[#7FFFD4] to-[#a0ffe6] text-gray-900 font-bold text-lg shadow hover:from-[#a0ffe6] hover:to-[#7FFFD4] transition disabled:opacity-50"
          disabled={!file || loading}
        >
          {loading ? "Adding Page Numbers..." : "Add Page Numbers"}
        </button>
        {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
      </div>
    </div>
  );
} 