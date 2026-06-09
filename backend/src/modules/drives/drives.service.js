import PlacementDrive from "../../models/PlacementDrive.js";
import { mapDrive } from "../../utils/mappers.js";

export async function listDrives({ status, page = 1, limit = 50 }) {
  const filter = {};
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    PlacementDrive.find(filter).sort({ startDate: 1 }).skip(skip).limit(limit),
    PlacementDrive.countDocuments(filter),
  ]);

  return {
    items: items.map(mapDrive),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function createDrive(officerId, payload) {
  const drive = await PlacementDrive.create({
    ...payload,
    createdBy: officerId,
  });
  return mapDrive(drive);
}

export async function deleteDrive(driveId) {
  const drive = await PlacementDrive.findByIdAndDelete(driveId);
  if (!drive) {
    const err = new Error("Placement drive not found");
    err.statusCode = 404;
    throw err;
  }
  return { deleted: true };
}
