import jwt from "jsonwebtoken";
import env from "../../config/env.js";
import User from "../../models/User.js";
import Student from "../../models/Student.js";
import { USER_ROLES, VERIFICATION_STATUS } from "../../constants/index.js";
import { mapUser } from "../../utils/mappers.js";

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export async function registerUser(payload) {
  const { name, email, password, role, companyName, location, officerPasscode, adminPasscode, studentProfile } = payload;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const err = new Error("An account with this email already exists");
    err.statusCode = 409;
    throw err;
  }

  if (role === USER_ROLES.PLACEMENT_OFFICER && officerPasscode !== env.officerPasscode) {
    const err = new Error("Invalid Coordinator placement office authorization passcode");
    err.statusCode = 403;
    throw err;
  }

  if (role === USER_ROLES.ADMIN && adminPasscode !== env.adminPasscode) {
    const err = new Error("Invalid master system administrator secret security phrase");
    err.statusCode = 403;
    throw err;
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    companyName: role === USER_ROLES.RECRUITER ? companyName : undefined,
    location: role === USER_ROLES.RECRUITER ? location : undefined,
  });

  if (role === USER_ROLES.STUDENT) {
    await Student.create({
      userId: user._id,
      name,
      email,
      phone: studentProfile?.phone || "",
      linkedin: studentProfile?.linkedin || "",
      github: studentProfile?.github || "",
      skills: studentProfile?.skills || ["React", "JavaScript", "HTML/CSS", "Python"],
      projects: studentProfile?.projects || [],
      certifications: studentProfile?.certifications || ["PlacePro AI Academy Graduate"],
      resumeText: studentProfile?.resumeText || `${name.toUpperCase()} - Software Aspirant`,
      academic: studentProfile?.academic || {},
      verificationStatus: VERIFICATION_STATUS.PENDING,
      resumeScore: 70,
      atsScore: 68,
      readinessScore: 72,
    });
  }

  const token = signToken(user);
  return { user: mapUser(user), token };
}

export async function loginUser(email, password) {
  console.log("4. SERVICE START");

  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  console.log("5. USER QUERY DONE");

  if (!user) {
    console.log("6. USER NOT FOUND");
    throw new Error("Invalid email or password");
  }

  const match = await user.comparePassword(password);

  console.log("7. PASSWORD CHECK DONE", match);

  if (!match) {
    throw new Error("Invalid email or password");
  }

  const token = signToken(user);

  console.log("8. TOKEN CREATED");

  return {
    user: mapUser(user),
    token,
  };
}

export async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  return mapUser(user);
}
