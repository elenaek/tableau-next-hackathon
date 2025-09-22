import { NextRequest, NextResponse } from 'next/server';
import { getSalesforceClient } from '@/lib/salesforce';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { department } = body;

    if (!department) {
      return NextResponse.json(
        { error: 'Department is required' },
        { status: 400 }
      );
    }

    // Validate department to prevent SQL injection
    // Allow alphanumeric characters, spaces, and common punctuation
    if (!/^[a-zA-Z0-9\s\-&.,]+$/.test(department)) {
      return NextResponse.json({ error: 'Invalid department format' }, { status: 400 });
    }

    const client = getSalesforceClient();

    const departmentData = await client.query(`
        SELECT COUNT(*), department__c FROM hospital_patient_snaps19204202568__dll WHERE status__c <> 'Discharged' GROUP BY department__c
    `);

    return NextResponse.json(departmentData);
  } catch (error) {
    console.error('Error fetching department data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch department data' },
      { status: 500 }
    );
  }
}