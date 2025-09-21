import { NextRequest, NextResponse } from 'next/server';
import { getSalesforceClient } from '@/lib/salesforce';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, patientContext, medicalRecordsContext, vitalsContext, departmentContext, currentPage, conversationHistory } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // const parsedProviderNotes = JSON.parse(jsonProviderNotes || '[]');

    const client = getSalesforceClient();

    // Build messages array for the chat API
    const messages = [];

    // Add system message with context
    const patientInfo = patientContext ? `
Patient Information:
- Name: ${patientContext.name}
- Age: ${patientContext.age}
- Patient Gender: ${patientContext.gender}
- Diagnosis: ${patientContext.diagnosis}
- Department: ${patientContext.department}
- Treatment Status: ${patientContext.treatmentStatus}
- Admission Date: ${patientContext.admissionDate}
- Length of Stay: ${patientContext.lengthOfStay}
- Physician: ${patientContext.physician}
- Room Number: ${patientContext.roomNumber}
- Treatment Progress: ${JSON.stringify(patientContext.treatmentProgress)}
- Provider Notes: ${patientContext.providerNotes}
` : '';

    // Add medical records context if on records page
    const recordsInfo = medicalRecordsContext ? `
Medical Records Context:
${medicalRecordsContext.summary || 'These are the patient\'s medical records.'}

Recent Records:
${
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  medicalRecordsContext.recentRecords?.map((r: any) =>
  `- ${r.type}: ${r.title} (${r.date}) - Results: ${r.summary}`
).join('\n')}

The patient is currently viewing their medical records page and may have questions about specific test results, procedures, or consultations.
` : '';

    // Add vitals context if on vitals page
    const vitalsInfo = vitalsContext ? `
Current Vital Signs:
- Heart Rate: ${vitalsContext.current?.heartRate?.value} ${vitalsContext.current?.heartRate?.unit} (${vitalsContext.current?.heartRate?.status})
- Blood Pressure: ${vitalsContext.current?.bloodPressure?.value} ${vitalsContext.current?.bloodPressure?.unit} (${vitalsContext.current?.bloodPressure?.status})
- Temperature: ${vitalsContext.current?.temperature?.value}${vitalsContext.current?.temperature?.unit} (${vitalsContext.current?.temperature?.status})
- Respiratory Rate: ${vitalsContext.current?.respiratoryRate?.value} ${vitalsContext.current?.respiratoryRate?.unit} (${vitalsContext.current?.respiratoryRate?.status})
- Oxygen Saturation: ${vitalsContext.current?.oxygenSaturation?.value}${vitalsContext.current?.oxygenSaturation?.unit} (${vitalsContext.current?.oxygenSaturation?.status})

Historical Vital Signs:
- Heart Rate: ${JSON.stringify(vitalsContext.history?.heartRate)}
- Blood Pressure: ${JSON.stringify(vitalsContext.history?.bloodPressure)}
- Temperature: ${JSON.stringify(vitalsContext.history?.temperature)}
- Respiratory Rate: ${JSON.stringify(vitalsContext.history?.respiratoryRate)}
- Oxygen Saturation: ${JSON.stringify(vitalsContext.history?.oxygenSaturation)}

The patient is currently viewing their vital signs page and may have questions about their readings, trends, or what the values or trends mean.
` : '';

    // Add department context if on dashboard page
    const departmentInfo = departmentContext ? `
Department Status Information:
- Department: ${departmentContext.department}
- Current Occupancy: ${departmentContext.occupancy}% (${departmentContext.currentPatients} patients)
- Available Beds: ${departmentContext.availableBeds} out of ${departmentContext.totalBeds} total
- Current Wait Time: ${departmentContext.waitTime} minutes
- Staff on Duty:
  - Physicians: ${departmentContext.staffOnDuty?.physicians}
  - Nurses: ${departmentContext.staffOnDuty?.nurses}
  - Support Staff: ${departmentContext.staffOnDuty?.support}
- Last Updated: ${departmentContext.lastUpdated}
- Status: ${departmentContext.status}

The patient is currently viewing their dashboard and may have questions about department busyness, wait times, staffing levels, or when they might receive attention. 
` : '';

    // Add page context hint
    const pageContext = currentPage?.includes('/patient/records') ?
      '\nNote: The user is on the Medical Records page, so they may be asking about specific tests, results, or procedures.' :
      currentPage?.includes('/patient/vitals') ?
      '\nNote: The user is on the Vitals page, so they may be asking about their vital signs, what they mean, or trends.' :
      (currentPage === '/' || currentPage === '/patient/dashboard') ?
      '\nNote: The user is on the Dashboard page, so they may be asking about department status, wait times, or when they will be seen.' :
      '';

    const systemMessage = `You are an AI healthcare assistant helping a patient understand their medical care and records.

${patientInfo}${recordsInfo}${vitalsInfo}${departmentInfo}${pageContext}

Guidelines:
- Use simple, clear language that patients can understand
- Be empathetic and supportive
- If discussing medical information, explain it in layman's terms
- Encourage the patient to discuss important concerns with their healthcare team
- Keep responses concise but informative (under 200 words)
- If you don't have specific information, acknowledge this and suggest they consult their care team
- Always maintain a professional and caring tone

Remember: You are here to help the patient understand their care better, not to provide medical advice or diagnoses.`;

    messages.push({
      role: 'system',
      content: systemMessage
    });

    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg: { role: string; content: string }) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }

    // Add the current message
    messages.push({
      role: 'user',
      content: message
    });

    // console.log(systemMessage);

    // Call the new generateChat method
    const aiResponse = await client.generateChat(messages);


    // Handle the response format from Salesforce's generateChat API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responseContent = (aiResponse as any)?.generationDetails?.generations[0]?.content ||
                           'Unable to generate response at this time.';

    return NextResponse.json({
      insight: responseContent,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to generate chat response' },
      { status: 500 }
    );
  }
}