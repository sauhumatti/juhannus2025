import Image from 'next/image';

export default function PrintPage() {
  return (
    <div className="min-h-screen bg-white print:min-h-0 print:bg-white print-page">
      <div className="w-full h-screen flex flex-col items-center justify-center print:h-auto print:py-16">
        {/* Website URL */}
        <h1 className="text-8xl font-bold text-black mb-16 text-center">
          saku30v.fi
        </h1>
        
        {/* QR Code */}
        <div className="relative">
          <Image
            src="/qrcode_www.saku30v.fi.png"
            alt="QR Code for saku30v.fi"
            width={400}
            height={400}
            className="border-2 border-gray-300 rounded-lg"
          />
        </div>
        
        {/* Print instructions (hidden when printing) */}
        <div className="mt-8 text-center text-gray-600 print:hidden">
          <p className="text-lg mb-4">Press Ctrl+P (or Cmd+P) to print this page</p>
          <p className="text-sm">Make sure to set page size to A4 and remove headers/footers</p>
        </div>
      </div>
    </div>
  );
}