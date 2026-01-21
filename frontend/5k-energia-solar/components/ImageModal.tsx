'use client';

import ResponsiveModal from './ResponsiveModal';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  alt?: string;
  fileType?: 'image' | 'pdf';
}

export function ImageModal({ isOpen, onClose, imageUrl, title, alt, fileType }: ImageModalProps) {
  const isPdf = fileType === 'pdf' || imageUrl.toLowerCase().endsWith('.pdf');

  // Função para tentar corrigir URLs problemáticas
  const getCorrectedUrl = (url: string) => {
    // Se a URL contém vírgulas não codificadas, tentar corrigi-la
    if (url.includes(',') && !url.includes('%2C')) {
      return url.replace(/,/g, '%2C');
    }
    // Se já está codificada, tentar double-encoding como fallback
    if (url.includes('%2C') && url.includes(',')) {
      return url.replace(/,/g, '%252C');
    }
    return url;
  };

  const correctedUrl = getCorrectedUrl(imageUrl);

  return (
    <ResponsiveModal isOpen={isOpen} onClose={onClose} title={title || 'Visualizar Arquivo'}>
      <div className="flex flex-col items-center">
        <div className="w-full max-w-4xl">
          {isPdf ? (
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-red-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <p className="text-gray-600 mb-2">Documento PDF</p>
                <p className="text-sm text-gray-500">Para visualizar o PDF, clique no botão abaixo</p>
              </div>
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-auto">
              <img
                src={correctedUrl}
                alt={alt || 'Imagem do comprovante'}
                className="max-w-full h-auto rounded-lg shadow-lg"
                style={{ maxHeight: '70vh' }}
                onError={(e) => {
                  console.error('Erro ao carregar imagem:', correctedUrl);
                  const target = e.currentTarget as HTMLImageElement;
                  // Fallback para placeholder de erro
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0VjE2QzE0IDE3LjEgMTMuMSAxOCA5LjkgMTlIMTQuMUMxNS4xIDE5IDE2IDE4LjEgMTYgMTdWNFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTEwIDZDMTAgNS4zOSA5LjYgNSA5IDVWMTBIMTRWNVoiIGZpbGw9IiM5Q0E0QUYiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHg9IjgiIHk9IjgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIi8+CjxwYXRoIGQ9Ik0xNSAxMkg5IiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTkgMTJIMTUifQ==';
                  target.alt = 'Erro ao carregar imagem - arquivo pode ter nome inválido';
                }}
                onLoad={() => {
                  console.log('Imagem carregada com sucesso:', correctedUrl);
                }}
              />
            </div>
          )}
        </div>
        <div className="mt-4 flex gap-3">
          <a
            href={correctedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            {isPdf ? 'Abrir PDF em nova aba' : 'Abrir imagem em nova aba'}
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </ResponsiveModal>
  );
}