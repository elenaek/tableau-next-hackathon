import { NextRequest, NextResponse } from 'next/server';
import { getSalesforceClient } from '@/lib/salesforce';
import { rateLimiters, getClientIp, checkRateLimit } from '@/lib/rate-limit';


export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit(rateLimiters.data, ip);

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
        },
      }
    );
  }

  try {
    const { dashboardName, customViewId, assetType } = await request.json();
    const client = getSalesforceClient();
    // Download dashboard image using the Salesforce client
    const imageBuffer = await client.downloadTableauDashboardImage({
      dashboardName,
      customViewId,
      assetType,
    });

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('Error downloading Tableau dashboard image:', error);
    return NextResponse.json(
      { error: 'Failed to download dashboard image' },
      { status: 500 }
    );
  }
}