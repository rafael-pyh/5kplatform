'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-transparent to-green-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/5klogo.png"
            alt="5K Energia Solar"
            width={160}
            height={160}
            className="h-auto w-auto"
            priority
          />
        </div>

        {/* Error Code */}
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>

        {/* Error Title */}
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">
          Página não encontrada
        </h2>

        {/* Error Description */}
        <p className="text-gray-600 mb-8 text-lg">
          Desculpe, a página que você está procurando não existe ou foi removida.
        </p>

        {/* Return Button */}
        <Link
          href="/"
          className="inline-block bg-linear-to-r from-blue-500 via-blue-400 to-green-500 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-600 hover:via-blue-500 hover:to-green-600 transition shadow-lg"
        >
          Voltar ao início
        </Link>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-center text-sm text-gray-600">
        <p>© 2025 5K Energia Solar - Todos os direitos reservados</p>
      </div>
    </div>
  );
}
