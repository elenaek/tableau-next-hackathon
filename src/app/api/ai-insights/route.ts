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

        # Requirements
        - Always use markdown formatting.
        - Always take a compassionate, reassuring tone.
        - Always use simple, easy to understand language.
        - Take into account the patient's age, gender, and any other relevant information if provided.

        # Output Format:
          # Understanding ${context.diagnosis}
            ## What is ${context.diagnosis}?
              - An explanation of the diagnosis.
            ## Why Does It Happen?
              - An explanation of why the diagnosis happens.
            ## What Can Be Done?
              - An explanation of what the care team will likely do to treat the diagnosis.
              - An explanation of what to expect during the treatment process.
            ## Recovery Outlook
              - An explanation of the likely recovery outlook for the diagnosis.
              - Ensure you take a compassionate, reassuring tone.
              - Reassure the patient that the care team is doing everything they can to help them recover and if the diagnosis is serious, that they are in good hands.
            ## Questions to Ask the Care Team
              - A list of questions that the paitent could ask the care team to help them understand the diagnosis and treatment process.
        `;
        break;

      case 'treatment-progress':
        prompt = `
        # Context
        - You are a helpful medical assistant providing insights to patients in an encouraging and clear manner.
        - A patient is in the hospital for the following diagnosis: ${context.diagnosis} and in need of assurance, support and explanation.

        # Your Task
        - Provide an encouraging update on the patient's progress:
            Admission Date: ${context.admissionDate}
            Current Status: ${context.status}
            Treatment Plan: ${context.treatmentPlan}
            Recent Vitals: ${context.vitals}

            Provide a brief, positive assessment of their progress and what to expect next. Use Markdown formatting.`;
        break;

      case 'department-busyness':
        prompt = `Explain the current hospital department status to a patient:
                  Department: ${context.department}
                  Current Occupancy: ${context.occupancy}%
                  Average Wait Time: ${context.waitTime} minutes
                  Staff Available: ${context.staffCount}

                  Provide context about what this means for their care and reassure them about receiving attention.`;
        break;

      case 'record-explanation':
        prompt = `# Context
        - You are a helpful medical assistant providing clear, simple explanations to patients about their medical records.
        - A patient is reviewing their medical record and needs help understanding what it means.

        # Medical Record Information
        - Record Type: ${context.recordType}
        - Record Title: ${context.recordTitle}
        - Date: ${context.recordDate}
        - Provider: ${context.provider}
        - Status: ${context.recordStatus}
        - Summary/Results: ${context.recordSummary}

        # Your Task
        Provide a clear, compassionate explanation of this medical record in patient-friendly language.

        # Requirements
        - Use simple, non-technical language that any patient can understand
        - Explain what the test/procedure was for
        - Explain what the results mean in practical terms
        - If results are abnormal, be reassuring and explain what this typically means
        - If results are normal, celebrate this positive outcome
        - Explain any next steps or follow-up that might be expected
        - Keep the explanation under 300 words
        - Be encouraging and supportive
        - Use markdown formatting for clarity

        # Output Format:
        Start with a brief summary of what this record is about, then explain:
        1. **What this test/procedure was:** Brief explanation
        2. **What the results mean:** Clear interpretation
        3. **What this means for you:** Practical implications
        4. **Next steps:** What to expect or do next (if applicable)
        5. **Questions to ask the care team:** What questions the patient could ask the care team to help them understand the record and treatment process.

        Remember to be compassionate, clear, and reassuring in your explanation.`;
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