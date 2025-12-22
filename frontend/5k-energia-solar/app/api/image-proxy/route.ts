import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route para proxy de imagens do S3/Backblaze B2
 * 
 * Resolve problemas de CORS quando imagens são usadas em Canvas
 * 
 * Uso:
 * /api/image-proxy?url=https://f005.backblazeb2.com/file/5k-storage/...
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      console.error('[image-proxy] URL não fornecida');
      return NextResponse.json(
        { error: 'Missing url parameter' },
        { status: 400 }
      );
    }

    // Validar que é uma URL de S3/B2
    if (!imageUrl.includes('backblazeb2.com') && !imageUrl.includes('amazonaws.com')) {
      console.error('[image-proxy] URL não é de S3/B2:', imageUrl);
      return NextResponse.json(
        { error: 'Invalid image source' },
        { status: 403 }
      );
    }

    console.log('[image-proxy] Buscando imagem:', imageUrl);

    // Fazer fetch da imagem no servidor (sem problemas de CORS)
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; 5kplatform-proxy)',
      },
    });

    if (!response.ok) {
      console.error('[image-proxy] Erro ao buscar imagem:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Extrair conteúdo como buffer
    const buffer = await response.arrayBuffer();
    console.log('[image-proxy] Imagem obtida com sucesso, tamanho:', buffer.byteLength, 'bytes');

    // Retornar com headers CORS e cache
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        // CORS headers para permitir uso em Canvas
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        
        // Content headers
        'Content-Type': response.headers.get('content-type') || 'image/png',
        'Content-Length': buffer.byteLength.toString(),
        
        // Cache headers (cache por 1 hora)
        'Cache-Control': 'public, max-age=3600, immutable',
        
        // Security headers
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    });
  } catch (error: any) {
    console.error('[image-proxy] Erro:', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Suportar preflight CORS requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '3600',
    },
  });
}
