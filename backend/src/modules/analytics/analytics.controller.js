import * as analyticsService from "./analytics.service.js";
import { success } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getAnalytics = asyncHandler(async (_req, res) => {
  const data = await analyticsService.getPlacementAnalytics();
  return success(res, data);
});
