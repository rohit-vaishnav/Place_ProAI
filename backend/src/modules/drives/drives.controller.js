import * as drivesService from "./drives.service.js";
import { success, paginated } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const listDrives = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;
  const result = await drivesService.listDrives({
    status,
    page: parseInt(page || "1", 10),
    limit: parseInt(limit || "50", 10),
  });
  return paginated(res, result.items, result.pagination);
});

export const createDrive = asyncHandler(async (req, res) => {
  const drive = await drivesService.createDrive(req.user._id, req.body);
  return success(res, drive, "Placement drive created", 201);
});

export const deleteDrive = asyncHandler(async (req, res) => {
  await drivesService.deleteDrive(req.params.id);
  return success(res, null, "Placement drive deleted");
});
