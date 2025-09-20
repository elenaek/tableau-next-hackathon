import { NextRequest, NextResponse } from 'next/server';
import { getSalesforceClient } from '@/lib/salesforce';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { department } = body;

    if (!department) {
      return NextResponse.json(
        { error: 'Department and sql are required' },
        { status: 400 }
      );
    }

    const client = getSalesforceClient();
    const departmentData = await client.query(`
        SELECT COUNT(*) FROM hospital_patient_snaps19204202568__dll WHERE department__c = '${department}' AND status__c <> 'Discharged'
    `);
    
    return NextResponse.json(departmentData);
  } catch (error) {
    console.error('Error processing patient action:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}