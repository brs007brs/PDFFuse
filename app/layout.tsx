import "./globals.css";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "PDFFuse - All PDF Tools",
  description: "Merge, split, compress, convert, and edit PDFs for free with PDFFuse.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f8f9fa] min-h-screen flex flex-col">
        {/* Header */}
        <header className="w-full bg-gradient-to-r from-[#7FFFD4] via-[#a0ffe6] to-[#7FFFD4] shadow-lg sticky top-0 z-20 drop-shadow-xl">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-center space-x-3">
              <Image src="/pdf-fuse-logo.png" alt="PDFFuse Logo" width={56} height={56} className="rounded-lg shadow-md" />
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight" style={{ letterSpacing: "-0.03em" }}>PDFFuse</span>
            </Link>
            <nav className="hidden md:flex space-x-3">
              <Link href="/merge" className="text-gray-900 font-semibold px-3 py-1 rounded-lg hover:bg-[#7FFFD4] hover:text-white transition">Merge PDF</Link>
              <Link href="/split" className="text-gray-900 font-semibold px-3 py-1 rounded-lg hover:bg-[#7FFFD4] hover:text-white transition">Split PDF</Link>
              <Link href="/compress" className="text-gray-900 font-semibold px-3 py-1 rounded-lg hover:bg-[#7FFFD4] hover:text-white transition">Compress PDF</Link>
              <Link href="/convert" className="text-gray-900 font-semibold px-3 py-1 rounded-lg hover:bg-[#7FFFD4] hover:text-white transition">Convert PDF</Link>
              <Link href="/rotate" className="text-gray-900 font-semibold px-3 py-1 rounded-lg hover:bg-[#7FFFD4] hover:text-white transition">Rotate PDF</Link>
              <Link href="/watermark" className="text-gray-900 font-semibold px-3 py-1 rounded-lg hover:bg-[#7FFFD4] hover:text-white transition">Watermark</Link>
              <Link href="/pagenumber" className="text-gray-900 font-semibold px-3 py-1 rounded-lg hover:bg-[#7FFFD4] hover:text-white transition">Page Numbers</Link>
            </nav>
          </div>
        </header>
        {/* Main Content */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">{children}</main>
        {/* Footer */}
        <footer className="w-full bg-gradient-to-r from-[#7FFFD4] via-[#a0ffe6] to-[#7FFFD4] text-center py-4 text-gray-700 text-sm mt-8 border-t border-[#7FFFD4]/40">
          © PDFFuse {new Date().getFullYear()} · Your PDF Editor
        </footer>
      </body>
    </html>
  );
}
