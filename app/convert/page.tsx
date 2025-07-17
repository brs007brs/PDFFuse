"use client";
import { useState } from "react";

const conversionOptions = [
  { label: "PDF to JPG", value: "pdf-to-jpg", icon: "🖼️" },
  { label: "JPG to PDF", value: "jpg-to-pdf", icon: "🖼️" },
];

export default function ConvertPDF() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-white rounded-2xl shadow-xl border-2 border-transparent bg-clip-padding p-8 max-w-lg w-full relative">
        <div className="flex flex-col items-center mb-6">
          <span className="text-5xl mb-2">🚫</span>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">Convert PDF</h2>
          <p className="text-gray-600 text-base mb-2 text-center">
            PDF-to-JPG and JPG-to-PDF conversion is not supported on Vercel.<br />
            Please use the other PDF tools (merge, split, compress, rotate, watermark, page numbers).
          </p>
        </div>
      </div>
    </div>
  );
} 