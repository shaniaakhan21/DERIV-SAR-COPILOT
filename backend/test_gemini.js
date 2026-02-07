require("dotenv").config({ path: "src/.env" });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
  console.log("API Key:", process.env.GEMINI_API_KEY ? "loaded (" + process.env.GEMINI_API_KEY.slice(0, 10) + "...)" : "MISSING");
  console.log("Model:", process.env.GEMINI_MODEL);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    const result = await model.generateContent("Say hello in one sentence.");
    console.log("SUCCESS:", result.response.text().trim());
  } catch (e) {
    console.log("ERROR:", e.message);
    console.log("Status:", e.status);
    console.log("Full error:", e);
  }
}

test();
