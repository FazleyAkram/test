import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Initialise OpenAI
const genAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Marketing context and system prompt (friendly and concise)
const MARKETING_CONTEXT = `
You are AskCODi, a friendly AI Marketing Assistant. You provide consultation for clients running marketing campaigns for their small to medium businesses.
Your clients are likely not interested in specific details of their marketing campaigns. Instead they are interested in insights, recommendations and reviews.

Style:
- Keep replies reasonably short and simple.
- Warm, helpful, and human. Avoid jargon.
- Use bullets for lists. No long paragraphs.
- Share 1–3 practical tips. If data is needed, ask one clear follow‑up.
 - If the user does not provide data, DO NOT delay. Give best‑practice guidance now and add one optional final line like: "If you can, share X for a tighter plan."

Expertise:
- Google Analytics insights
- KPI and campaign optimization (CTR, CPC, ROAS, etc.)
- Targeting, budgeting, experiments (A/B), and quick UX wins

Scope:
- Strongly avoid discussing topics outside your expertise.
- You are not to revise any reports you are given, but instead are to interpret them for your client like a marketing expert would.

You are able to also answer questions about the CODi Marketing Service to explain features available to the client. Do not add more about these features that isn't directly described below.
- Summary page
  - AskCODi generated summary with observations and key insights.
  - Ability for the client to click on these observations and key insights to learn more.
  - Chat system for the client to ask you about the their reports and your generated summary.
- View reports
  - Ability to view the user's reports with graphs to display data
- Import marketing data
  - This is where the client can link their Google Analytics data to automatically generate reports for them.
`;

// Fallback responses for when AI is not available (short and friendly)
const FALLBACK_RESPONSES = {
  roas:
    "ROAS = revenue/ad spend. Quick wins: focus budget on best channels, improve landing pages, and test higher‑intent keywords.",
  ctr:
    "Lift CTR with clearer CTAs, tighter keyword‑to‑copy match, and 2–3 headline tests. Extensions help too.",
  cpc:
    "Lower CPC by improving Quality Score: refine keywords/targeting, boost ad relevance, and speed up pages.",
  audience:
    "Segment by intent (new vs returning), device, and top geo. Try lookalikes; exclude low‑quality segments.",
  budget:
    "Shift spend to high‑ROAS campaigns. Use automated bidding where stable; keep a small test budget.",
  ecommerce:
    "Watch Conv Rate, AOV, cart drops. Quick wins: simpler checkout, trust badges, and smart bundles.",
  leads:
    "Offer a simple lead magnet, add a short form on a high‑traffic page, and retarget visitors. Start small."
};

// Expanded variants for fallback when user asks for detailed answers
const FALLBACK_EXPANDED = {
  roas:
    "ROAS (Return on Ad Spend) measures revenue generated per dollar of ad spend. Benchmarks vary by industry, but 4:1 is a common target. To improve:\n- Consolidate budget to campaigns with stable, positive ROAS.\n- Improve post‑click experience (load speed, message match, social proof).\n- Expand high‑intent keywords; exclude low‑converting queries.\n- Test bidding strategies (e.g., Target ROAS) once you have consistent conversion data.",
  ctr:
    "CTR reflects ad relevance and creative appeal. To increase:\n- Tighten keyword‑to‑ad copy alignment and use dynamic insertion carefully.\n- Write benefit‑led headlines and specific CTAs; test 3–5 variants.\n- Use assets/extensions (sitelinks, callouts) to boost engagement.\n- Segment by audience/device and tailor creatives accordingly.",
  cpc:
    "CPC depends on auction competition and Quality Score. To reduce:\n- Improve Quality Score: better ad relevance, expected CTR, landing page experience.\n- Use tighter match types and negatives to avoid wasted spend.\n- Bid by value, not volume—shift budget to efficient segments and times.\n- Improve technical performance (Core Web Vitals) to lift QS landing page.",
  audience:
    "Effective segmentation balances scale and relevance. Start with:\n- Intent: new vs returning, cart abandoners, purchasers (LTV tiers).\n- Context: device, geo, time‑of‑day, content categories.\n- Lookalikes from top‑value users; exclude chronic non‑converters.\n- Personalize messaging and offers by segment maturity.",
  budget:
    "Budget optimization playbook:\n- Allocate 70% to proven winners, 20% to controlled tests, 10% to exploration.\n- Use automated bidding where data is stable; set floors/ceilings.\n- Review weekly; reallocate based on ROAS/CAC trends and marginal returns.\n- Pause underperformers quickly; reroute to best channels/ad groups.",
  ecommerce:
    "E‑commerce focus areas:\n- Conversion rate: streamline checkout (fewer fields, guest checkout, wallets).\n- AOV: bundles, tiered shipping thresholds, cross‑sells on PDP/cart.\n- Recovery: remarket carts with urgency and social proof.\n- Measurement: track funnel steps and segment by device/source to find friction.",
  leads:
    "Lead growth framework:\n- Offer a compelling lead magnet (template, calculator, mini‑course) aligned to pain points.\n- Place short forms on high‑traffic, high‑intent pages; reduce fields.\n- Nurture with a 4–6 email sequence (value > pitch) and retarget visitors.\n- Score leads; route high‑intent to sales promptly; iterate based on close feedback."
};

// Function to find the best fallback response based on user message
function getFallbackResponse(message: string, expanded = false): string {
  const lowerMessage = message.toLowerCase();
  
  // Check for specific keywords and return appropriate responses
  if (lowerMessage.includes('roas') || lowerMessage.includes('return on ad spend')) {
    return expanded ? FALLBACK_EXPANDED.roas : FALLBACK_RESPONSES.roas;
  }
  if (lowerMessage.includes('ctr') || lowerMessage.includes('click through rate') || lowerMessage.includes('click-through rate')) {
    return expanded ? FALLBACK_EXPANDED.ctr : FALLBACK_RESPONSES.ctr;
  }
  if (lowerMessage.includes('cpc') || lowerMessage.includes('cost per click')) {
    return expanded ? FALLBACK_EXPANDED.cpc : FALLBACK_RESPONSES.cpc;
  }
  if (lowerMessage.includes('audience') || lowerMessage.includes('segment') || lowerMessage.includes('targeting')) {
    return expanded ? FALLBACK_EXPANDED.audience : FALLBACK_RESPONSES.audience;
  }
  if (lowerMessage.includes('budget') || lowerMessage.includes('spend') || lowerMessage.includes('cost')) {
    return expanded ? FALLBACK_EXPANDED.budget : FALLBACK_RESPONSES.budget;
  }
  if (lowerMessage.includes('ecommerce') || lowerMessage.includes('e-commerce') || lowerMessage.includes('conversion')) {
    return expanded ? FALLBACK_EXPANDED.ecommerce : FALLBACK_RESPONSES.ecommerce;
  }
  if (lowerMessage.includes('leads') || lowerMessage.includes('lead generation') || lowerMessage.includes('get more leads')) {
    return expanded ? FALLBACK_EXPANDED.leads : FALLBACK_RESPONSES.leads;
  }
  
  // Default response for general marketing questions
  return expanded
    ? "Happy to dive deep. Share your business goal and time frame, and I’ll map KPIs, key segments, and a step‑by‑step plan (tests, budget shifts, and measurement) you can run this month."
    : "I can help with ROAS, CTR, CPC, audiences, budgets, e‑commerce, and leads. What’s the goal you want to improve first?";
}

function isExpansiveRequest(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('detailed') ||
    m.includes('in depth') ||
    m.includes('in-depth') ||
    m.includes('long') ||
    m.includes('comprehensive') ||
    m.includes('expansive') ||
    m.includes('thorough') ||
    m.includes('explain fully') ||
    m.includes('more detail') ||
    m.startsWith('expand')
  );
}

function isEditRequest(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.startsWith('rewrite') ||
    m.startsWith('revise') ||
    m.includes('edit the last') ||
    m.includes('change the last') ||
    m.includes('make it shorter') ||
    m.includes('make it longer') ||
    m.includes('expand the last') ||
    m.includes('add a bullet') ||
    m.includes('add a point') ||
    m.includes('remove the part') ||
    m.includes('different tone') ||
    m.includes('rewrite in')
  );
}

// Retrieving conversation history accounts for reports used in responses if required
async function getConversationHistory(userId: any, reports: any, source: any) {
  let conversationHistory;

  // Get conversation history where the set of reports matches
  if (reports.length > 0) {
    const reportIdsArray: number[] = reports.map((r: { id?: number }) => r.id).filter((id: any): id is number => Boolean(id));
    conversationHistory = await prisma.chatMessage.findMany({
      where: { 
        userId: parseInt(userId),
        source: source, // Make sure the chat message is from the appropriate source
        Report: {
          some: {
            id: { in: reportIdsArray }
          }
        }
      },
      take: 5, // Get last 5 relevant messages (increase or decrease as needed)
      orderBy: { createdAt: 'desc' },
      select: { message: true, response: true }
    });
  }
  else { // Get the last 5 messages regardless of reports if no reports included
    conversationHistory = await prisma.chatMessage.findMany({
      where: { 
        userId: parseInt(userId),
        source: source // Make sure the chat message is from the appropriate source
      },
      take: 5, // Get last 5 relevant messages (increase or decrease as needed)
      orderBy: { createdAt: 'desc' },
      select: { message: true, response: true }
    });
  }

  console.log(conversationHistory);
  return conversationHistory;
}

async function saveChatMessage(userId: any, message: string, aiResponse: string, reports: any, source: any, user: any) {
  let chatMessage;

  // Save a chat message with reports used
  if (reports.length > 0) {
    // Get the report ids of the reports used to generate the chat message
    const reportIds = reports
      .map((r: { id?: number }) => r.id)
      .filter((id: any): id is number => Boolean(id)) // Remove invalid ids
      .map((id: any) => ({ id })); // Wrap needed for saving to database

    // Save chat message to database
    chatMessage = await prisma.chatMessage.create({
      data: {
        userId: parseInt(userId),
        message,
        response: aiResponse,
        type: "USER_QUERY",
        source: source,
        metadata: {
          userRole: user.role,
          hasCampaigns: user.campaigns.length > 0,
          dataSources: user.dataSources.map((ds: { provider: any; }) => ds.provider)
        },
        Report: {
          connect: reportIds // Link reports used to generate this chat message
        }
      }
    });
  }
  else { // Save a chat message without any used reports
    chatMessage = await prisma.chatMessage.create({
      data: {
        userId: parseInt(userId),
        message,
        response: aiResponse,
        type: "USER_QUERY",
        source: source,
        metadata: {
          userRole: user.role,
          hasCampaigns: user.campaigns.length > 0,
          dataSources: user.dataSources.map((ds: { provider: any; }) => ds.provider)
        }
      }
    });
  }
  
  return chatMessage;
}

// Used to send a prompt to the AI
export async function POST(request: NextRequest) {
  try {
    // message: User entered text
    // userId: Used for authentication and finding this user's past conversation history
    // reports: JSON structure of all reports AI can reference in conversation. Defaults to an empty JSON structure
    // summary: JSON structure of the summary AI can reference in conversation. Defaults to an empty JSON structure
    // source: Message is from chat window or inline. Defaults to WINDOW as chat window doesn't use reports
    const { message, userId, reports = {}, summary = {}, source = "WINDOW" } = await request.json();

    // Validate input message and userid before continuing. Don't need to validate reports as can get responses with or without them
    if (!message || !userId) {
      return NextResponse.json(
        { error: "Message and userId are required" },
        { status: 400 }
      );
    }

    // Get user context from database (non-blocking; proceed even if it fails)
    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        include: {
          // Keep context lightweight to avoid prompt bloat
          campaigns: { select: { id: true, name: true }, take: 5 },
          dataSources: { select: { provider: true } }
        }
      });
    } catch (e) {
      console.warn('User context load failed, continuing without DB context');
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

    let aiResponse = "Default message.";
    if (!isKeyValid) { // AI call won't work without the API key by default
      console.log("API Key invalid, using fallback response.");
      aiResponse = getFallbackResponse(message, isExpansiveRequest(message)); // Use Non-AI fallback message
    }
    else { // Attempt to generate a response by crafting a prompt with all relevant context and reports
      try {
        console.log("Attempting AI generation...");
        let hasGeneratedResponse = false;

        try {
          const wantsExpanded = isExpansiveRequest(message);
          const wantsEdit = isEditRequest(message);
          const conversationHistory = getConversationHistory(userId, reports, source);

          // Factor in reports if relevant
          const reportsString = Object.keys(reports).length != 0
            ? `Refer to these reports.\n---\n${JSON.stringify(reports)}\n---\nIf the client asks you about a specific report, find it in this json structure to extract relevant data. If you want to reference a report, tell the client the title of the report when talking about it.`
            : '';

          // Factor in summary if relevant
          const summaryString = Object.keys(summary).length != 0
            ? `Refer to this holistic summary of the client's marketing data.\n---\n${JSON.stringify(summary)}\n---\nThis is a previously AI generated response and may contain errors. Only refer to this if its relevant to what your client asks.`
            : '';

          // Factor in conversation history
          const historyString = conversationHistory
            ? `\n\nFor context, this is the previous reply:\n---\n${conversationHistory}\n---\nRefer to this conversation history when responding to your client if relevant.`
            : '';

          /////////////// TEMPORARILY OMITTED TO REDUCE NUMBER OF TOKENS BEING USED ///////////////
          // Factor in how large the reply should be
          //let additionalContext = wantsExpanded
          //  ? `\n\nReply in a friendly tone with a detailed, structured explanation (5–9 short bullets). Include specific examples and a brief step‑by‑step plan. Do not gate the answer on having data; give generic best practices now. Optionally end with a single one‑line data request if helpful.`
          //  : `\n\nReply in a friendly tone with 2–4 short sentences and 1–3 actionable tips. Do not gate the answer on having data; give generic best practices now. Optionally end with a single one‑line data request if helpful.`;

          // Factor in if the client wants revised information
          //additionalContext = additionalContext + wantsEdit
          //  ? `\n\nAlso, revise information about the last response based on your client's request.`
          //  : '';

          // Combine all context into a single prompt
          const prompt = `${reportsString}\n\n${summaryString}\n\nYour client entered:\n---\n"${message}"\n---\n${historyString}`;

          console.log(`Sending prompt to AI...`);
          const response = await genAI.chat.completions.create({
              model: "gpt-4o-mini", // Faster and cheaper variant of GPT-4o
              messages: [{ role: "system", content: MARKETING_CONTEXT }, { role: "user", content: prompt }],
          });
          aiResponse = String(response.choices?.[0]?.message?.content || ""); // Get the response message from the JSON and convert to a String (avoid null)
              
          console.log(`AI response received`);
          hasGeneratedResponse = true;
        } catch (modelError) {
          console.log(`Failed to send prompt:`, (modelError as Error).message);
          aiResponse = getFallbackResponse(message, isExpansiveRequest(message)); // Use Non-AI fallback message on error
        }

        if (!hasGeneratedResponse) {
          throw new Error("Failed to generate a response.");
        }
      } catch (modelError) {
        console.log(`API Call Failed:`, (modelError as Error).message);
        aiResponse = getFallbackResponse(message, isExpansiveRequest(message)); // Use Non-AI fallback message on error
      }
    }

    // Save chat message to database
    const chatMessage = saveChatMessage(userId, message, aiResponse, reports, source, user);

    return NextResponse.json({
      success: true,
      response: aiResponse,
      messageId: (await chatMessage).id
    });

  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}

// Used to get chat history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const source = searchParams.get("source") ?? "WINDOW";
    console.log(`Got source `, source);

    if (!userId || userId === "undefined") {
      return NextResponse.json(
        { error: "Valid userId is required" },
        { status: 400 }
      );
    }

    // Get chat history for user
    const chatHistory = await prisma.chatMessage.findMany({
      where: { userId: parseInt(userId), source: source },
      orderBy: { createdAt: "desc" },
      take: 20, // Last 20 messages
      select: {
        id: true,
        message: true,
        response: true,
        type: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      chatHistory: chatHistory.reverse() // Show oldest first
    });

  } catch (error) {
    console.error("Chat history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}


