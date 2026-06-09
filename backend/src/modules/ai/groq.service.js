import env from "../../config/env.js";
import logger from "../../utils/logger.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export function isGroqConfigured() {
  return !!env.groqApiKey;
}

async function getGroqResponse(prompt, expectJson = false, systemInstruction = "") {
  if (!env.groqApiKey) throw new Error("Groq API key is not configured.");

  const messages = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  const body = {
    model: env.groqModel || DEFAULT_MODEL,
    messages,
    temperature: 0.6,
    max_tokens: 4096,
  };

  if (expectJson) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.groqApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    logger.error("Groq API error", { status: res.status, body: errText });
    throw new Error(`Groq API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

function parseJsonResponse(text) {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : trimmed);
}

export async function analyzeResume({ resumeText, jobDescription, candidateCoreInfo }) {
  const jdText = jobDescription || "General software development internship roles";
  const systemInstruction =
    "You are a veteran Corporate Recruitment Specialist and ATS Automated Screener. Analyze resumes and output valid JSON only.";
  const prompt = `Analyze this resume against the job description:

--- RESUME ---
${resumeText}
${candidateCoreInfo ? `Candidate Info: ${JSON.stringify(candidateCoreInfo)}` : ""}

--- JOB DESCRIPTION ---
${jdText}

Return JSON: { "atsScore": number, "resumeScore": number, "readinessRating": string, "skillGapAnalysis": { "detectedSkills": [], "missingCriticalSkills": [], "goodToHaveMissing": [] }, "improvementSuggestions": { "formatting": [], "keywords": [], "experienceImpact": [] }, "industryReadinessSummary": string }`;

  try {
    if (isGroqConfigured()) {
      const text = await getGroqResponse(prompt, true, systemInstruction);
      return parseJsonResponse(text);
    }
    throw new Error("Groq not configured");
  } catch (err) {
    logger.warn("Resume analysis fallback", err.message);
    const mockScore = Math.floor(Math.random() * 20) + 65;
    return {
      atsScore: mockScore,
      resumeScore: mockScore + 3,
      readinessRating: mockScore > 80 ? "Excellent" : "Good",
      skillGapAnalysis: {
        detectedSkills: ["React", "TypeScript", "JavaScript", "HTML/CSS", "Git"],
        missingCriticalSkills: ["Database Design", "System Architecture", "Unit Testing"],
        goodToHaveMissing: ["Express.js", "Docker", "REST API Development"],
      },
      improvementSuggestions: {
        formatting: ["Use stronger action verbs.", "Add Certifications and Links sections."],
        keywords: ["Include 'API Integration', 'Full-Stack Development'."],
        experienceImpact: ["Quantify achievements with metrics."],
      },
      industryReadinessSummary:
        "Solid front-end fundamentals. Strengthen backend and database skills for full readiness.",
    };
  }
}

export async function chatbot({ messages, userRole, currentTab }) {
  const systemInstruction = `You are the AI Career Assistant for PlacePro — a campus placement platform helping students land internships and jobs. Role: ${userRole || "student"}. Current section: ${currentTab || "general"}. Give practical, encouraging placement advice. Use clear Markdown.`;
  const history = messages.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");
  const prompt = `Conversation:\n${history}\n\nRespond to the latest query:`;

  try {
    if (isGroqConfigured()) {
      const text = await getGroqResponse(prompt, false, systemInstruction);
      return { content: text };
    }
    throw new Error("Groq not configured");
  } catch (err) {
    logger.warn("Chatbot fallback", err.message);
    const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
    let reply =
      "I can help with placement tips, mock interviews, and resume feedback. What would you like to focus on?";
    if (lastMsg.includes("resume")) {
      reply =
        "For a strong resume:\n1. **Single page**\n2. **Skills & Projects** near top\n3. Use **STAR format**\n4. Brief professional summary instead of objective";
    } else if (lastMsg.includes("interview")) {
      reply =
        "Interview prep: **Technical** (DSA, OOP), **Behavioral** (STAR), **HR** (motivation). Try the AI Mock Interview screen!";
    } else if (lastMsg.includes("job") || lastMsg.includes("internship")) {
      reply =
        "Land internships with **2-3 real projects**, master your stack, and get your profile **Verified** by placement office.";
    }
    return { content: reply };
  }
}

export async function generateInterviewQuestions({ jobTitle, jobDescription, roundType }) {
  const round = roundType || "Technical";
  const systemInstruction = "Generate 5 original interview questions as JSON array only.";
  const prompt = `Generate 5 ${round} interview questions for: ${jobTitle || "Software Engineer Intern"}. Description: ${jobDescription || "JS/TS, SPA, teamwork"}. Format: [{ "id": number, "question": string, "conceptsTested": string }]`;

  const fallbackMap = {
    Technical: [
      { id: 1, question: "Explain the difference between state and props in React.", conceptsTested: "React fundamentals" },
      { id: 2, question: "What is the Event Loop in JavaScript?", conceptsTested: "Async execution" },
      { id: 3, question: "How do you prevent SQL injection in APIs?", conceptsTested: "Security" },
      { id: 4, question: "How would you optimize a slow React SPA?", conceptsTested: "Performance" },
      { id: 5, question: "When would you use a Map vs Object?", conceptsTested: "DSA usage" },
    ],
    HR: [
      { id: 1, question: "Tell me about yourself and why you applied.", conceptsTested: "Motivation" },
      { id: 2, question: "Where do you see yourself in 3-5 years?", conceptsTested: "Career planning" },
      { id: 3, question: "Your biggest strength and area to improve?", conceptsTested: "Self-awareness" },
      { id: 4, question: "Why should we hire you?", conceptsTested: "Value proposition" },
      { id: 5, question: "Questions for us about culture?", conceptsTested: "Engagement" },
    ],
    Behavioral: [
      { id: 1, question: "Describe a team conflict and how you handled it.", conceptsTested: "Collaboration" },
      { id: 2, question: "A critical bug near a deadline — what did you do?", conceptsTested: "Pressure handling" },
      { id: 3, question: "Learning a new technology quickly?", conceptsTested: "Adaptability" },
      { id: 4, question: "A mistake on a project — how did you fix it?", conceptsTested: "Accountability" },
      { id: 5, question: "Leading a group project?", conceptsTested: "Leadership" },
    ],
  };

  try {
    if (isGroqConfigured()) {
      const text = await getGroqResponse(prompt, true, systemInstruction);
      const parsed = parseJsonResponse(text);
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (parsed && Array.isArray(parsed.questions)) {
        return parsed.questions;
      } else if (parsed && Array.isArray(parsed.data)) {
        return parsed.data;
      } else if (parsed && typeof parsed === "object") {
        const arr = Object.values(parsed).find(Array.isArray);
        if (arr) return arr;
      }
      return parsed;
    }
    throw new Error("Groq not configured");
  } catch (err) {
    logger.warn("Interview questions fallback", err.message);
    return fallbackMap[round] || fallbackMap.Technical;
  }
}

export async function evaluateInterview({ jobTitle, roundType, qnas }) {
  const systemInstruction = "Evaluate mock interview answers. Output valid JSON only.";
  const prompt = `Role: ${jobTitle || "Software Developer Intern"}, Round: ${roundType || "Technical"}
${qnas.map((item, idx) => `Q${idx + 1}: ${item.question}\nA: ${item.answer}`).join("\n\n")}
Return JSON: { "totalScore", "grade", "readinessVerdict", "strengths", "weaknesses", "detailedQnaFeedback": [{ "questionId", "question", "candidateAnswer", "score", "pros", "cons", "suggestedExcellentModelAnswer" }], "actionableTips" }`;

  try {
    if (isGroqConfigured()) {
      const text = await getGroqResponse(prompt, true, systemInstruction);
      const parsed = parseJsonResponse(text);
      
      const totalScore = parseInt(parsed.totalScore, 10) || 70;
      const grade = parsed.grade || (totalScore > 85 ? "A" : totalScore > 70 ? "B" : "C");
      const readinessVerdict = parsed.readinessVerdict || parsed.verdict || "Evaluated successfully";
      const strengths = Array.isArray(parsed.strengths) ? parsed.strengths : [];
      const weaknesses = Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [];
      const actionableTips = Array.isArray(parsed.actionableTips) ? parsed.actionableTips : [];
      
      const detailedQnaFeedback = (Array.isArray(parsed.detailedQnaFeedback) ? parsed.detailedQnaFeedback : []).map((item, idx) => {
        let qId = idx + 1;
        if (item.questionId) {
          const matched = String(item.questionId).match(/\d+/);
          if (matched) {
            qId = parseInt(matched[0], 10);
          }
        }
        
        let pros = "";
        if (Array.isArray(item.pros)) {
          pros = item.pros.join(", ");
        } else if (item.pros) {
          pros = String(item.pros);
        }
        
        let cons = "";
        if (Array.isArray(item.cons)) {
          cons = item.cons.join(", ");
        } else if (item.cons) {
          cons = String(item.cons);
        }
        
        return {
          questionId: qId,
          question: item.question || "",
          candidateAnswer: item.candidateAnswer || item.answer || "",
          score: parseInt(item.score, 10) || 70,
          pros,
          cons,
          suggestedExcellentModelAnswer: item.suggestedExcellentModelAnswer || item.modelAnswer || ""
        };
      });
      
      return {
        totalScore,
        grade,
        readinessVerdict,
        strengths,
        weaknesses,
        detailedQnaFeedback,
        actionableTips,
      };
    }
    throw new Error("Groq not configured");
  } catch (err) {
    logger.warn("Interview evaluation fallback", err.message);
    const feedbacks = qnas.map((q, idx) => {
      const len = q.answer?.trim().length || 0;
      const score = Math.min(Math.max(Math.floor(len * 0.4) + 40, 50), 95);
      return {
        questionId: idx + 1,
        question: q.question,
        candidateAnswer: q.answer || "(No Answer)",
        score,
        pros: len > 30 ? "Good conceptual approach." : "Baseline understanding shown.",
        cons: len < 50 ? "Too short — add examples." : "Could use STAR structure.",
        suggestedExcellentModelAnswer:
          "Define the term, give a real example, discuss edge cases and benefits.",
      };
    });
    const avg = Math.floor(feedbacks.reduce((s, f) => s + f.score, 0) / feedbacks.length) || 72;
    return {
      totalScore: avg,
      grade: avg > 85 ? "A" : avg > 70 ? "B" : avg > 55 ? "C" : "D",
      readinessVerdict:
        avg > 80 ? "Well prepared for corporate interviews." : "Solid foundations — improve technical depth.",
      strengths: ["Covers basic terminology", "Shows practical awareness"],
      weaknesses: ["Needs more elaboration", "Missing project references"],
      detailedQnaFeedback: feedbacks,
      actionableTips: ["Practice out loud", "Use STAR format", "Review OOP and DSA fundamentals"],
    };
  }
}

export async function rankCandidates({ jobRequirements, candidates }) {
  const systemInstruction =
    "You are an expert campus recruiter. Rank candidates by job fit. Output valid JSON array only.";
  const prompt = `Job: ${jobRequirements || "Software Developer Intern"}
Candidates: ${JSON.stringify(candidates)}
Return JSON array: [{ "rank": number, "name": string, "matchScore": number, "keyReason": string, "recommendedRoles": string[] }]`;

  try {
    if (isGroqConfigured()) {
      const text = await getGroqResponse(prompt, true, systemInstruction);
      return parseJsonResponse(text);
    }
    throw new Error("Groq not configured");
  } catch (err) {
    logger.warn("Candidate ranking fallback", err.message);
    return sortApplicantsManually(candidates);
  }
}

export function sortApplicantsManually(candidates) {
  return [...candidates]
    .map((c) => {
      const resumeMetric = c.resumeScore || 70;
      const interviewMetric = c.interviewScore || 0;
      const gpaMetric = parseFloat(c.gpa) ? parseFloat(c.gpa) * 10 : 75;
      const bonus = c.verified ? 5 : 0;
      const matchScore = Math.min(
        Math.floor((resumeMetric + (interviewMetric || resumeMetric) + gpaMetric) / 3) + bonus,
        100
      );
      return { ...c, matchScore };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .map((item, idx) => ({
      rank: idx + 1,
      name: item.name,
      matchScore: item.matchScore,
      keyReason: `Resume score ${item.resumeScore || "N/A"}, interview ${item.interviewScore || "pending"}, verification ${item.verified ? "approved" : "pending"}.`,
      recommendedRoles: idx === 0 ? ["Primary shortlist"] : ["Review manually"],
    }));
}
