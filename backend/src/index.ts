import express from "express"
import dotenv from "dotenv"
import cors from "cors";
dotenv.config();
// import OpenAI from 'openai';
import Groq from "groq-sdk";
import { BASE_PROMPT, getSystemPrompt } from "./prompt.js";
import { basePrompt as nodeBasePrompt } from "./defaults/node.js";
import { basePrompt as reactBasePrompt } from "./defaults/react.js";

// const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY
const app = express();
app.use(express.json());
app.use(cors());

// const openai = new OpenAI({
//   baseURL: "https://openrouter.ai/api/v1",
//   apiKey: OPENROUTER_API_KEY
// });

const groq = new Groq({ apiKey: GROQ_API_KEY });


app.post("/template", async (req, res) => {
  const prompt = req.body.prompt;
  const response = await groq.chat.completions.create({
    // model: 'anthropic/claude-sonnet-4.5',
    model: 'llama-3.1-8b-instant',
    messages: [{
      role: "system",
      content:
        "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra.",
    }, {
      role: 'user', content: prompt
    }],
    max_tokens: 200,
  });

  let answer = response.choices[0].message?.content?.trim().toLowerCase();

  if (answer.includes("node")) answer = "node";
  else if (answer.includes("react")) answer = "react";

  if (answer !== "node" && answer !== "react") {
    return res.status(400).json({
      error: "Invalid answer from AI",
      expected: "node or react",
      received: answer
    });
  }
  if (answer == "react") {
    res.json({
      prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
      uiPrompts: [reactBasePrompt]
    })
    return;
  }
  if (answer == "node") {
    res.json({
      prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
      uiPrompts: [nodeBasePrompt]
    })
    return;
  }
  res.status(403).json({ message: "You cant access this" })
  return;
});


app.post("/chat", async (req, res) => {
  const userMessages = req.body.messages;

  const response = await groq.chat.completions.create({
    // model: "anthropic/claude-sonnet-4.5",
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: getSystemPrompt()
      },
      ...userMessages
    ],
    max_tokens: 2000,
  });
  const content = response.choices[0].message.content;

  let text = "";
  if (Array.isArray(content) && content[0]?.text) {
    text = content[0].text;
  } else {
    text = content;
  }

  console.log(text);

  res.json({
    response: response.choices[0].message.content.trim()
  });
});

app.listen(3000);