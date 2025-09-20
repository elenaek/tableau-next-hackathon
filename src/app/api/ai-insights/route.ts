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
      case 'department-busyness-summarizer':
        prompt = `# Context
        - You are given information about the current status of a hospital department.

        # Your Task
        - Use 1-3 words to describe the overall status of the department in a helpful manner for a patient waiting to be seen.

        # Examples
        - If the department is busy, you might say "Busy" or "Some Delays Expected".
        - If the department is not busy, you might say "Steady Operations" or "No Delays Expected".

        # Hospital Department Information
        - Department: ${context.department}
        - Current Occupancy: ${context.occupancy}% (${context.currentPatients} patients)
        - Available Beds: ${context.availableBeds} out of ${context.totalBeds} total
        - Current Wait Time: ${context.waitTime} minutes
        - Staff on Duty:
          - Physicians: ${context.staffOnDuty?.physicians}
          - Nurses: ${context.staffOnDuty?.nurses}
          - Support Staff: ${context.staffOnDuty?.support}
        `;
        break;
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

      case 'draft-message':
        prompt = `# Context
        - You are a helpful assistant helping a patient draft a professional and clear message to their healthcare team.
        - The patient wants to discuss a specific medical record with the appropriate department.

        # Patient Information
        - Patient Name: ${context.patientName}

        # Medical Record Information
        - Record Type: ${context.recordType}
        - Record Title: ${context.recordTitle}
        - Date: ${context.recordDate}
        - Provider: ${context.provider}
        - Department: ${context.department}
        - Status: ${context.recordStatus}
        - Summary/Results: ${context.recordSummary}

        # Your Task
        Draft a professional, respectful message from ${context.patientName} to the ${context.department} team about this medical record.

        # Requirements
        - Start with a polite greeting to the ${context.department} team
        - Include the patient's name (${context.patientName}) when introducing themselves
        - Clearly reference the specific medical record (title and date)
        - Include 2-3 relevant questions or concerns the patient might have
        - Maintain a respectful and professional tone
        - Keep it concise (under 200 words)
        - Sign off with the patient's name (${context.patientName})
        - End with appreciation for their care

        # Message Structure:
        1. Greeting to the ${context.department} team
        2. Introduction with patient name
        3. Reference to the specific record
        4. Main questions or concerns
        5. Closing with appreciation
        6. Sign off with patient name

        # Example Topics to Include:
        - Clarification about results or findings
        - Questions about next steps or follow-up
        - Concerns about symptoms or side effects
        - Request for additional information or explanation
        - Timeline questions

        Remember to be professional, clear, and respectful while helping the patient communicate effectively with their care team.`;
        break;

      case 'chat':
        const patientInfo = context.patientContext ? `
        Patient Information:
        - Name: ${context.patientContext.name}
        - Diagnosis: ${context.patientContext.diagnosis}
        - Department: ${context.patientContext.department}
        - Treatment Status: ${context.patientContext.treatmentStatus}
        - Admission Date: ${context.patientContext.admissionDate}
        ` : '';

        const conversationHistory = context.conversationHistory?.length > 0 ?
          context.conversationHistory.map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`).join('\n') : '';

        prompt = `# Context
        You are an AI healthcare assistant helping a patient understand their medical care and records.

        ${patientInfo}

        # Recent Conversation
        ${conversationHistory}

        # User Message
        ${context.message}

        # Your Task
        Provide a helpful, compassionate response to the patient's question or concern.

        # Guidelines
        - Use simple, clear language that patients can understand
        - Be empathetic and supportive
        - If discussing medical information, explain it in layman's terms
        - Encourage the patient to discuss important concerns with their healthcare team
        - Keep responses concise but informative (under 150 words)
        - If you don't have specific information, acknowledge this and suggest they consult their care team
        - Always maintain a professional and caring tone

        Remember: You are here to help the patient understand their care better, not to provide medical advice or diagnoses.`;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid insight type' },
          { status: 400 }
        );
    }
    console.log(prompt);
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