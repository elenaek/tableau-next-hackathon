import { NextRequest, NextResponse } from 'next/server';
import { getSalesforceClient } from '@/lib/salesforce';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, patientContext, conversationHistory } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const client = getSalesforceClient();

    // Build messages array for the chat API
    const messages = [];

    // Add system message with context
    const patientInfo = patientContext ? `
Patient Information:
- Name: ${patientContext.name}
- Diagnosis: ${patientContext.diagnosis}
- Department: ${patientContext.department}
- Treatment Status: ${patientContext.treatmentStatus}
- Admission Date: ${patientContext.admissionDate}
- Length of Stay: ${patientContext.lengthOfStay}
- Physician: ${patientContext.physician}
- Room Number: ${patientContext.roomNumber}
- Treatment Progress: ${patientContext.treatmentProgress}
- Provider Notes: ${patientContext.providerNotes}
` : '';

    const systemMessage = `You are an AI healthcare assistant helping a patient understand their medical care and records.

${patientInfo}

Guidelines:
- Use simple, clear language that patients can understand
- Be empathetic and supportive
- If discussing medical information, explain it in layman's terms
- Encourage the patient to discuss important concerns with their healthcare team
- Keep responses concise but informative (under 150 words)
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