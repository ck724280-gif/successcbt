import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { RegisterSchema } from "@/lib/validation/schemas";
import { errorResponse, successResponse } from "@/lib/utils/apiResponse";
import { checkRateLimit } from "@/lib/utils/rateLimit";
import { Role } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "global-register";
    const rateCheck = checkRateLimit(`register-${ip}`, 10, 60000);
    if (!rateCheck.success) {
      return errorResponse("Too many registration requests. Please try again later.", 429);
    }

    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation error", 400, parsed.error.format());
    }

    const { name, email, password } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return errorResponse("An account with this email already exists.", 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        passwordHash,
        role: Role.USER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return successResponse(user, "Account created successfully. You can now login.", 201);
  } catch (error: any) {
    console.error("Register Error:", error);
    return errorResponse("Failed to create account. Please try again.", 500);
  }
}
