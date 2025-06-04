import { NextResponse } from 'next/server';

export async function POST(req) {
  const { userInput } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;
  const assistantId = 'asst_Cz1bhb9DzCtrNdE7Jvz33Viu';

  const threadRes = await fetch("https://api.openai.com/v1/threads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    }
  });
  const thread = await threadRes.json();

  await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({ role: "user", content: userInput })
  });

  const runRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({ assistant_id: assistantId })
  });

  const run = await runRes.json();
  let runStatus = '';
  let runData;

  do {
    await new Promise(res => setTimeout(res, 1500));
    const statusCheck = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    runData = await statusCheck.json();
    runStatus = runData.status;
  } while (runStatus !== "completed");

  const finalRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  const finalData = await finalRes.json();
  const reply = finalData.data[0].content[0].text.value;

  return NextResponse.json({ reply });
}
