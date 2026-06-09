import * as groqService from "./groq.service.js";
import { success } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const health = asyncHandler(async (_req, res) => {
  return success(res, {
    status: "ok",
    provider: "groq",
    groqConfigured: groqService.isGroqConfigured(),
  });
});

export const analyzeResume = asyncHandler(async (req, res) => {
  if (!req.body.resumeText) {
    return res.status(400).json({ success: false, message: "resumeText is required" });
  }
  const result = await groqService.analyzeResume(req.body);
  return res.json(result);
});

export const chatbot = asyncHandler(async (req, res) => {
  if (!req.body.messages || !Array.isArray(req.body.messages)) {
    return res.status(400).json({ success: false, message: "messages array is required" });
  }
  const result = await groqService.chatbot(req.body);
  return res.json(result);
});

export const generateQuestions = asyncHandler(async (req, res) => {
  const result = await groqService.generateInterviewQuestions(req.body);
  return res.json(result);
});

export const evaluateInterview = asyncHandler(async (req, res) => {
  if (!req.body.qnas || !Array.isArray(req.body.qnas)) {
    return res.status(400).json({ success: false, message: "qnas array is required" });
  }
  const result = await groqService.evaluateInterview(req.body);
  return res.json(result);
});

export const sortApplicants = asyncHandler(async (req, res) => {
  if (!req.body.candidates || !Array.isArray(req.body.candidates)) {
    return res.status(400).json({ success: false, message: "candidates array is required" });
  }
  const result = await groqService.rankCandidates({
    jobRequirements: req.body.jobRequirements,
    candidates: req.body.candidates,
  });
  return res.json(result);
});
