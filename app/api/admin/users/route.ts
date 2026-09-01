import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/utils/apiResponse";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return errorResponse("Forbidden", 403);
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") as Role | null;

    const users = await prisma.user.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          role ? { role } : {},
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBlocked: true,
        createdAt: true,
        _count: {
          select: { attempts: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(users, "Users list retrieved");
  } catch (error: any) {
    console.error("Admin Users GET Error:", error);
    return errorResponse("Failed to fetch users", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return errorResponse("Forbidden", 403);
    }

    const body = await req.json();
    const { userId, isBlocked, role } = body;

    if (!userId) {
      return errorResponse("User ID is required", 400);
    }

    // Prevent self-block or self-demote
    if (userId === session.user.id && (isBlocked === true || role !== "ADMIN")) {
      return errorResponse("You cannot block or demote your own admin account.", 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(typeof isBlocked === "boolean" ? { isBlocked } : {}),
        ...(role ? { role: role as Role } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBlocked: true,
      },
    });

    return successResponse(updatedUser, "User status updated successfully");
  } catch (error: any) {
    console.error("Admin User PATCH Error:", error);
    return errorResponse("Failed to update user status", 500);
  }
}
