"use client"

import Link from "next/link";
import Image from "next/image";

const tools = [
  {
    name: "Merge PDF",
    path: "/merge",
    description: "Combine multiple PDF files into one.",
    icon: "📎",
  },
  {
    name: "Split PDF",
    path: "/split",
    description: "Extract pages or split a PDF into parts.",
    icon: "✂️",
  },
  {
    name: "Compress PDF",
    path: "/compress",
    description: "Reduce the file size of your PDF.",
    icon: "🗜️",
  },
  {
    name: "Convert PDF",
    path: "/convert",
    description: "Convert PDFs to and from Word, JPG, Excel, PPT.",
    icon: "🔄",
  },
  {
    name: "Rotate PDF",
    path: "/rotate",
    description: "Rotate pages in your PDF file.",
    icon: "🔃",
  },
  {
    name: "Add Watermark",
    path: "/watermark",
    description: "Add a watermark to your PDF.",
    icon: "💧",
  },
  {
    name: "Add Page Numbers",
    path: "/pagenumber",
    description: "Insert page numbers into your PDF.",
    icon: "🔢",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] p-8">
      <header className="flex items-center gap-3 px-6 py-4 bg-[#7FFFD4]">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/pdffuse.png"
            alt="PDFFuse Logo"
            width={48}
            height={48}
            className="h-12 w-auto"
            priority
          />
          <span className="text-3xl font-bold tracking-tight text-[#1cc3b2]">PDFFuse</span>
        </Link>
      </header>
      <h1 className="text-4xl font-bold mb-4 text-gray-900">All PDF Tools in One Place</h1>
      <p className="text-lg text-gray-700 mb-10 text-center max-w-2xl">Merge, split, compress, convert, and edit PDFs for free. No registration required. Fast, secure, and easy to use.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-4xl">
        {tools.map((tool) => (
          <Link
            key={tool.path}
            href={tool.path}
            className="group block p-6 bg-white rounded-xl shadow hover:shadow-lg transition border border-gray-200 text-center hover:bg-[#7FFFD4]/30"
          >
            <div className="flex flex-col items-center justify-center mb-3">
              <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">{tool.icon}</span>
              <span className="text-xl font-semibold text-gray-900 mb-1">{tool.name}</span>
            </div>
            <p className="text-gray-600 text-sm">{tool.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
