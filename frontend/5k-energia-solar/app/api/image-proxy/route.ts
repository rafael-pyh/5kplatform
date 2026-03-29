/**
 * API Route DEPRECATED - Image Proxy is no longer needed
 * Using direct S3/B2 URLs instead
 * 
 * This route is kept for backward compatibility but should not be used
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Image proxy is deprecated. Use direct S3/B2 URLs instead.' },
    { status: 410 } // 410 Gone
  );
}
