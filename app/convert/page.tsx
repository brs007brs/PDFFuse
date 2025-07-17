"use client";
import { useState } from "react";

const conversionOptions = [
  { label: "PDF to JPG", value: "pdf-to-jpg", icon: "🖼️" },
  { label: "JPG to PDF", value: "jpg-to-pdf", icon: "🖼️" },
];

export default function ConvertPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [conversion, setConversion] = useState(conversionOptions[0].value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleConvert = async () => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      formData.append("conversion", conversion);
      const res = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        // Try to parse error message from backend
        let errMsg = "Failed to convert file";
        try {
          const data = await res.json();
          if (data && data.error) errMsg = data.error;
        } catch {}
        throw new Error(errMsg);
      }
      const blob = await res.blob();
      let filename = "converted";
      if (conversion === "pdf-to-jpg") filename = "images.zip";
      else if (conversion === "jpg-to-pdf") filename = "converted.pdf";
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
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

  const selectedIcon = conversionOptions.find(opt => opt.value === conversion)?.icon || "🔄";

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-white rounded-2xl shadow-xl border-2 border-transparent bg-clip-padding p-8 max-w-lg w-full relative" style={{ borderImage: 'linear-gradient(90deg, #7FFFD4 0%, #a0ffe6 100%) 1' }}>
        <div className="flex flex-col items-center mb-6">
          <span className="text-5xl mb-2">{selectedIcon}</span>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">Convert PDF</h2>
          <p className="text-gray-600 text-base mb-2 text-center">Convert PDFs to and from JPG. Fast, secure, and free.</p>
        </div>
        <input
          type="file"
          onChange={handleFileChange}
          className="mb-4 block w-full text-gray-700 border border-[#7FFFD4] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7FFFD4]"
        />
        <select
          value={conversion}
          onChange={e => setConversion(e.target.value)}
          className="mb-4 block w-full border border-[#7FFFD4] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7FFFD4] text-gray-700"
        >
          {conversionOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          onClick={handleConvert}
          className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-[#7FFFD4] to-[#a0ffe6] text-gray-900 font-bold text-lg shadow hover:from-[#a0ffe6] hover:to-[#7FFFD4] transition disabled:opacity-50"
          disabled={!file || loading}
        >
          {loading ? "Converting..." : "Convert"}
        </button>
        {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
      </div>
    </div>
  );
} 