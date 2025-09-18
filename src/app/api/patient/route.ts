import { NextRequest, NextResponse } from 'next/server';
import { getSalesforceClient } from '@/lib/salesforce';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    const client = getSalesforceClient();

    // Query patient data from Salesforce
    // This is a sample query - adjust based on your Salesforce object structure
    const patientData = await client.query(`
      SELECT Id, Name, Date_of_Birth__c, Medical_Record_Number__c,
             Current_Diagnosis__c, Admission_Date__c, Department__c,
             Treating_Physician__c, Room_Number__c, Treatment_Status__c
      FROM Patient__c
      WHERE Id = '${patientId}'
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
  try {
    const body = await request.json();
    const { patientId, action } = body;

    if (!patientId || !action) {
      return NextResponse.json(
        { error: 'Patient ID and action are required' },
        { status: 400 }
      );
    }

    // const client = getSalesforceClient();

    // Handle different actions
    switch (action) {
      case 'updateStatus':
        // Update patient status
        break;
      case 'requestInfo':
        // Log information request
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing patient action:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}