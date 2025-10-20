import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Initialise OpenAI
const genAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Different system prompt to regular chatbot, specialised for summary and insights generation
const SUMMARY_CONTEXT = `
Summarise JSON reports.
From the data, you will generate a JSON summary of this data.
You are to fill all the categories in.
If you are not given any data simply fill all categories with "N/A".

You should follow a very strict format similar to as follows:

Rules:
- There is an example JSON object with lines you must modify.
- "Key Insights" contains 3 short strings of key insights (doesn't have to be directly related to previously created categories)
- "Observations" contains 3 short strings of some observations, including potentially critical trends (again, doesn't have to be directly related to previously created categories)
- "Actionable Items" contains suggestions a SME owner who isn't necessarily marketing literate should follow to improve their marketing strategy. You should also explain what this will provide the business owner. Only these insights are allowed to be a couple sentences to maximise user understanding.
- "categories" contains 4 key categories with the associated metrics accurately based on the data.
- Rates/percentages are given to you out of 100, a value of 0.7 = 0.7%, while a value of 1.4 = 1.4% etc. Ensure that this rule is applied everywhere, especially the metrics in categories.
- If a value (such as revenue) is not specified or the value is 0, the revenue should outputted as N/A. Never output $0 revenue.
- When generating insights, observations and actionable items do not bring up metrics that are empty, have a value of 0 or that you marked N/A.
- No categories can have empty text, source directly from the given data and if no data is available for a metric, mark as N/A.
- Include any punctation required e.g. $, ,, %. This means that numbers should have commas where relevant e.g. 1000000 should be 1,000,000
- Define the JSON section with a clear delimiter: \`\`\`JSON_START\`\`\` and \`\`\`JSON_END\`\`\`.
- Do not include explanations, only JSON.

Example of output structure:

\`\`\`JSON_START
{
  "insights": [
    { "title": "Key Insights", "insight1": "", "insight2": "", "insight3": "" },
    { "title": "Observations", "insight1": "", "insight2": "", "insight3": "" },
    { "title": "Actionable Items", "insight1": "", "insight2": "", "insight3": "" },
    ...
  ],
  "categories": [
    { "title": "Total Sessions", "metric": "" },
    { "title": "Total Revenue", "metric": "" },
    { "title": "Conversion Rate", "metric": "" },
    { "title": "Bounce Rate", "metric": "" },
  ],
}
\`\`\`JSON_END
`;

export async function POST(request: NextRequest) {
    try {
        // reports: JSON structure of all reports AI uses to generate summary. Unlike the chatbot, this one needs reports to do anything
        const { reports } = await request.json();

        // Check authentication
        const token = request.cookies.get("token")?.value;
        const user = token ? await verifyToken(token) : null;
        if (!user) {
          return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
        }

        // API Key validation output in server
        let models, isKeyValid;
        try {
            models = await genAI.models.list(); // Attempt to get the available models without using any tokens
            isKeyValid = models.data && models.data.length > 0; // Use the previously retrieved available models to validate the key
        } catch(keyError) {
            console.log(`API Key Invalid:`, (keyError as Error).message);
            isKeyValid = false;
        }
    
        console.log("API Key check:", {
            hasKey: !!process.env.OPENAI_API_KEY, // Converts String -> true, Undefined -> false
            keyLength: process.env.OPENAI_API_KEY?.length || 0,
            keyStart: process.env.OPENAI_API_KEY?.substring(0, 10) || 'none',
            keyValid: isKeyValid
        });

        let aiResponse = "";
        if (!isKeyValid) { // AI call won't work without the API key by default
            console.log("API Key invalid, cancelling summary generation.");
            return NextResponse.json({ success: true, response: aiResponse });
        }
        else { // Attempt to generate a response
            try {
                console.log("Attempting AI generation...");
                let hasGeneratedResponse = false;

                console.log(`Reports to be sent to AI: ${reports}`);

                // Craft prompt
                const prompt = `Here are the reports:\n${JSON.stringify(reports, null, 2)}\nPlease generate as instructed.`;

                console.log(`Sending prompt to AI...`);
                const response = await genAI.chat.completions.create({
                    model: "gpt-4o-mini", // Faster and cheaper variant of GPT-4o
                    messages: [{ role: "system", content: SUMMARY_CONTEXT }, { role: "user", content: prompt }],
                });
                aiResponse = String(response.choices?.[0]?.message?.content || ""); // Get the response message from the JSON and convert to a String (avoid null)
              
                console.log(`AI response received: ${aiResponse}`);
                hasGeneratedResponse = true;

                if (!hasGeneratedResponse) {
                    throw new Error("Failed to generate a response.");
                }
            } catch (modelError) {
                console.log(`API Call Failed:`, (modelError as Error).message);
                return NextResponse.json({ success: true, response: aiResponse });
            }
        }

        return NextResponse.json({
            success: true,
            response: aiResponse,
        });

    } catch (error) {
        console.error("AI API error:", error);
        return NextResponse.json(
            { error: "Failed to process chat message" },
            { status: 500 }
        );
    };
}