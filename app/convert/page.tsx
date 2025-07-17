"use client";
import { useState } from "react";

const conversionOptions = [
  { label: "PDF to JPG", value: "pdf-to-jpg", icon: "🖼️", supported: true },
  { label: "JPG to PDF", value: "jpg-to-pdf", icon: "🖼️", supported: true },
  { label: "PDF to Word", value: "pdf-to-word", icon: "📝", supported: false },
  { label: "Word to PDF", value: "word-to-pdf", icon: "📝", supported: false },
  { label: "PDF to PowerPoint", value: "pdf-to-ppt", icon: "📊", supported: false },
  { label: "PowerPoint to PDF", value: "ppt-to-pdf", icon: "📊", supported: false },
  { label: "PDF to Excel", value: "pdf-to-excel", icon: "📈", supported: false },
  { label: "Excel to PDF", value: "excel-to-pdf", icon: "📈", supported: false },
];

export default function ConvertPDF() {
  const [option, setOption] = useState(conversionOptions[0].value);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedOption = conversionOptions.find(opt => opt.value === option);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleConvert = async () => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append(option === "pdf-to-jpg" ? "file" : "files", file));
      const res = await fetch(`/api/${option}`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to convert file(s)");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        option === "pdf-to-jpg"
          ? "page-1.jpg"
          : option === "jpg-to-pdf"
          ? "output.pdf"
          : "converted-file";
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
          <span className="text-5xl mb-2">{selectedOption?.icon}</span>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">Convert PDF</h2>
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {conversionOptions.map((opt) => (
              <button
                key={opt.value}
                className={`px-3 py-2 rounded-lg font-semibold border text-sm ${option === opt.value ? "bg-[#7FFFD4] border-[#7FFFD4]" : "bg-gray-100 border-gray-300"}`}
                onClick={() => {
                  setOption(opt.value);
                  setFiles([]);
                  setError(null);
                }}
                disabled={loading}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
          {selectedOption?.supported ? (
            <>
              <input
                type="file"
                accept={option === "pdf-to-jpg" ? "application/pdf" : option === "jpg-to-pdf" ? "image/jpeg,image/jpg" : undefined}
                multiple={option === "jpg-to-pdf"}
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
                onClick={handleConvert}
                className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-[#7FFFD4] to-[#a0ffe6] text-gray-900 font-bold text-lg shadow hover:from-[#a0ffe6] hover:to-[#7FFFD4] transition disabled:opacity-50"
                disabled={files.length === 0 || loading}
              >
                {loading ? "Converting..." : "Convert"}
              </button>
              {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
            </>
          ) : (
            <div className="text-center text-gray-600 mt-4">
              <p>This conversion requires a paid API (e.g., PDF.co, Cloudmersive, or iLovePDF API).</p>
              <p className="mt-2">To enable this, integrate a third-party API in <span className="font-mono bg-gray-100 px-1 rounded">/app/api/{option}/route.ts</span>.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 