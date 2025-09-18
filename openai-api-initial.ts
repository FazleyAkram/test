////////////// Back-end Processing //////////////

import OpenAI from "openai";
import express from "express";

const app = express();
const port = 3000;

// Listen on hardcoded port
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

// Create new client configured with OpenAI API key
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // KEY TO BE SET IN ENVIRONMENT VARIABLES WHEN CLIENT PROVIDES IT
});

// Post request to OpenAI API when the frontend posts an /ask request using fetch to http://localhost:${port}
app.post("/ask", async (req, res) => {
    try {
        // Conversation history is sent as part of the post body
        const conversationHistory = req.body.conversationHistory;

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini", // Faster and cheaper variant of GPT-4o
            messages: conversationHistory,
        });

        res.json(response);
    } 
    catch (error) {
        console.error("Error calling OpenAI API:", error);
        res.status(500).json({ error: "Failed to call OpenAI API" });
    }
});

////////////// Front-end Requests //////////////

// question: Summary of reports or user question from chat system
// behaviourDescription: Sets the system role for OpenAI to describe its behaviour in responding to a question
// conversationHistory (OPTIONAL): Array of past messages passed to add context for OpenAI when creating a response
async function ask(
    question: any,
    behaviourDescription: string,
    conversationHistory?: { role: string; content: string }[]
) {
    // If a conversationHistory is provided, merge the new question with it and if not, start a new conversation with the behaviourDescription
    const messages = conversationHistory
        ? [...conversationHistory, { role: "user", content: question }]
        : [{ role: "system", content: behaviourDescription }, { role: "user", content: question }];

    // When this function is called, the backend's app.post processes the request and returns the JSON response from the AI
    const response = await fetch("http://localhost:${port}", { // Calls own server so the backend can process the request
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            conversationHistory: messages // Add the constructed message structure to the body of the request
        })
    });

    return await response.json(); // Returns the JSON of the reply
}