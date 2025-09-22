import { NextRequest, NextResponse } from 'next/server';
import { getSalesforceClient } from '@/lib/salesforce';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, patientContext, medicalRecordsContext, vitalsContext, departmentContext, departmentMetricsContext, currentPage, conversationHistory } = body;

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
- Estimated Discharge Date: ${patientContext.estimatedDischargeDate}
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

    // Add department metrics context if on metrics page
    const metricsInfo = departmentMetricsContext ? `
Hospital-Wide Department Metrics:
${departmentMetricsContext.summary}

Department Occupancy Details:
${
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  departmentMetricsContext.metrics?.map((m: any) =>
  `- ${m.department}: ${m.occupancyPercentage}% occupied (${m.occupancy}/${m.totalBeds} beds used, ${m.availableBeds} available)`
).join('\n')}

Last Updated: ${departmentMetricsContext.lastUpdated}

The patient is currently viewing the Department Metrics page showing hospital-wide analytics. They may be asking about:
- Why certain departments are busy or slow
- How department occupancy affects their wait time or care
- General hospital capacity and resource allocation
- Predictions or trends about when things might improve

When discussing metrics:
- Help them understand how department occupancy affects patient care timelines
- Explain that high occupancy can mean longer wait times but doesn't affect quality of care
- Be reassuring that all patients receive care based on medical priority
- Provide insights about typical patterns (e.g., ERs busier in evenings, weekends)
- If a department is beyond 100% occupancy then that means the patients are in the overflow area and are being treated in the hallway or other areas of the hospital.
- Don't mention the wait time estimation formula to the patient. Just use it to estimate the wait time and give the patient a useful time range based on the formula as opposed to a specific number.

Wait Time Estimation Formula:
For any department, base wait time = Math.round(16 * (occupancy)) minutes
- High-risk/urgent cases: Math.max(5, Math.round(baseWaitTime * 0.3)) minutes
- Normal priority cases: Math.round(baseWaitTime * 1.2) minutes
- Low priority cases: Math.round(baseWaitTime * 1.8) minutes


Example: If Emergency Department is at 85% occupancy:
- Base wait time = 12 * 0.85 * 4 = ~41 minutes
- High-risk patients (heart attack, stroke): ~12 minutes
- Normal priority (fracture, moderate pain): ~49 minutes
- Low priority (minor cuts, cold symptoms): ~74 minutes

Always emphasize that critical cases are seen immediately regardless of wait times.

Department-to-Condition Mapping:
- Infectious Disease: Septicemia, Urinary Tract Infection etc
- Cardiology: Heart Attack, Angina, Atrial Fibrillation, etc
- Orthopedics Rehabilitation: Osteoarthritis, etc
- Internal Medicine: Pneumonia, Bronchitis, etc
- Endocrinology: Diabetes, Thyroid Disorders, etc
- Neurology: Stroke, etc
- Hematology Vascular Medicine: Venous Thromboembolism, etc
- Pulmonology Respiratory: COPD, Asthma, etc
- Gastroenterology: GI Bleeding, Acute Pancreatitis, etc
- Nephrology: Hypo Hypernatremia, Hyperkalemia, Acute Kidney Injury, etc
- Geriatrics General Internal Medicine: Delerium, Anemia, etc
` : '';

    // Add page context hint
    const pageContext = currentPage?.includes('/patient/records') ?
      '\nNote: The user is on the Medical Records page, so they may be asking about specific tests, results, or procedures.' :
      currentPage?.includes('/patient/vitals') ?
      '\nNote: The user is on the Vitals page, so they may be asking about their vital signs, what they mean, or trends.' :
      currentPage?.includes('/patient/metrics') ?
      '\nNote: The user is on the Department Metrics page, so they may be asking about hospital capacity, department busyness, or how this affects their care.' :
      (currentPage === '/' || currentPage === '/patient/dashboard') ?
      '\nNote: The user is on the Dashboard page, so they may be asking about department status, wait times, or when they will be seen.' :
      '';

    const systemMessage = `You are an AI healthcare assistant helping a patient understand their medical care and records.

${patientInfo}${recordsInfo}${vitalsInfo}${departmentInfo}${metricsInfo}${pageContext}

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