export const USER_ROLES = {
  STUDENT: "student",
  RECRUITER: "recruiter",
  PLACEMENT_OFFICER: "placementOfficer",
  ADMIN: "admin",
};

export const APPLICATION_STATUS = {
  APPLIED: "applied",
  SHORTLISTED: "shortlisted",
  MOCK_INTERVIEW_ASSIGNED: "mock_interview_assigned",
  INTERVIEW_SCHEDULED: "interview_scheduled",
  SELECTED: "selected",
  REJECTED: "rejected",
};

/** Maps backend enum to frontend display labels */
export const STATUS_TO_FRONTEND = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  mock_interview_assigned: "MockAssigned",
  interview_scheduled: "InterviewScheduled",
  selected: "Selected",
  rejected: "Rejected",
};

export const STATUS_FROM_FRONTEND = {
  Applied: "applied",
  Shortlisted: "shortlisted",
  MockAssigned: "mock_interview_assigned",
  MockCompleted: "mock_interview_assigned",
  InterviewScheduled: "interview_scheduled",
  Selected: "selected",
  Rejected: "rejected",
};

export const VERIFICATION_STATUS = {
  UNSUBMITTED: "Unsubmitted",
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
};

export const JOB_VERIFICATION_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};
