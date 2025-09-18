import { NextRequest, NextResponse } from 'next/server';
import { getSalesforceClient } from '@/lib/salesforce';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, patientId, context } = body;

    if (!type || !patientId) {
      return NextResponse.json(
        { error: 'Type and patient ID are required' },
        { status: 400 }
      );
    }

    const client = getSalesforceClient();

    let prompt = '';

    switch (type) {
      case 'diagnosis-explainer':
        prompt = `# Context
        - You are a helpful medical assistant providing insights to patients in an encouraging and clear manner.
        - A patient is in the hospital for the following diagnosis: ${context.diagnosis} and in need of assurance, support and explanation.

        # Your Task
        - Explain the following diagnosis to a patient in simple, encouraging terms: ${context.diagnosis}.
        - Include what it means, why it happens, and reassure them about the treatment process. Use markdown formatting.
        - Keep the explanation clear, compassionate, and under 400 words.
        - Use markdown formatting.
        `;
        break;

      case 'treatment-progress':
        prompt = `Based on the following treatment information, provide an encouraging update on the patient's progress:
                  Admission Date: ${context.admissionDate}
                  Current Status: ${context.status}
                  Treatment Plan: ${context.treatmentPlan}
                  Recent Vitals: ${context.vitals}

                  Provide a brief, positive assessment of their progress and what to expect next.`;
        break;

      case 'department-busyness':
        prompt = `Explain the current hospital department status to a patient:
                  Department: ${context.department}
                  Current Occupancy: ${context.occupancy}%
                  Average Wait Time: ${context.waitTime} minutes
                  Staff Available: ${context.staffCount}

                  Provide context about what this means for their care and reassure them about receiving attention.`;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid insight type' },
          { status: 400 }
        );
    }

    const aiResponse = await client.callAgentforceModel(prompt);


    return NextResponse.json({
      type,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      insight: (aiResponse as any)?.generation?.generatedText || 'Unable to generate insight at this time.',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}