import { NextRequest, NextResponse } from 'next/server';
import { getSalesforceClient } from '@/lib/salesforce';
import { rateLimiters, getClientIp, checkRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
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
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    // Validate patientId to prevent SQL injection
    // Only allow alphanumeric characters and hyphens
    if (!/^[a-zA-Z0-9-]+$/.test(patientId)) {
      return NextResponse.json({ error: 'Invalid patient ID format' }, { status: 400 });
    }

    const client = getSalesforceClient();

    // Using escaped patientId - Salesforce SOQL automatically escapes single quotes when using String.escapeSingleQuotes()
    // In a production environment, use parameterized queries if available
    const escapedPatientId = patientId.replace(/'/g, "\\'");
    const patientData = await client.query(`
      SELECT * FROM hospital_patient_snaps19204202568__dll where patient_id__c = '${escapedPatientId}'
    `);

    return NextResponse.json(patientData);
  } catch (error) {
    console.error('Error fetching patient data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient data' },
      { status: 500 }
    );
  }
}

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
    const body = await request.json();
    const { patientId } = body;

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Validate patientId to prevent SQL injection
    // Only allow alphanumeric characters and hyphens
    if (!/^[a-zA-Z0-9-]+$/.test(patientId)) {
      return NextResponse.json({ error: 'Invalid patient ID format' }, { status: 400 });
    }

    const client = getSalesforceClient();

    // Using escaped patientId - Salesforce SOQL automatically escapes single quotes when using String.escapeSingleQuotes()
    // In a production environment, use parameterized queries if available
    const escapedPatientId = patientId.replace(/'/g, "\\'");
    const patientData = await client.query(`
      SELECT * FROM hospital_patient_snaps19204202568__dll WHERE patient_id__c = '${escapedPatientId}'
    `);

    return NextResponse.json(patientData);
  } catch (error) {
    console.error('Error processing patient action:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}