'use client';

import Image from 'next/image';

interface Props {
  remaining: number;
}

export default function LeadSuccessContent({ remaining }: Props) {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-transparent to-green-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Cadastro realizado com sucesso!
          </h1>

          <p className="text-gray-600 mb-6">
            Obrigado pelo seu interesse em energia solar! Em breve um de nossos
            consultores entrará em contato para oferecer a melhor solução para você.
          </p>

          <div className="inline-flex items-center justify-center mb-6">
            <Image
              src="/5klogo.png"
              alt="Ícone de painel solar"
              width={160}
              height={160}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>💡 Dica:</strong> Já economize preparando as informações sobre seu consumo
              mensal de energia e o tipo de telhado da sua residência!
            </p>
          </div>

          <p className="text-sm text-gray-500">
            Você será redirecionado em alguns segundos{typeof remaining === 'number' ? ` (${remaining})` : ''}...
          </p>
        </div>
      </div>
    </div>
  );
}
