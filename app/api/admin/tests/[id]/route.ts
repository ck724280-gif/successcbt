import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/utils/apiResponse";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return errorResponse("Forbidden", 403);
    }

    const { id } = params;

    const test = await prisma.test.findUnique({
      where: { id },
      include: {
        exam: true,
        sections: {
          orderBy: { orderIndex: "asc" },
          include: {
            testQuestions: {
              orderBy: { orderIndex: "asc" },
              include: {
                question: {
                  include: {
                    options: true,
                    subject: true,
                  },
                },
              },
            },
          },
        },
        testQuestions: {
          where: { sectionId: null },
          include: {
            question: {
              include: {
                options: true,
                subject: true,
              },
            },
          },
        },
      },
    });

    if (!test) {
      return errorResponse("Test not found", 404);
    }

    return successResponse(test, "Test details retrieved");
  } catch (error: any) {
    console.error("Admin Test GET [id] Error:", error);
    return errorResponse("Failed to fetch test", 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return errorResponse("Forbidden", 403);
    }

    const { id } = params;
    const body = await req.json();

    const updated = await prisma.test.update({
      where: { id },
      data: body,
    });

    return successResponse(updated, "Test updated successfully");
  } catch (error: any) {
    console.error("Admin Test PATCH [id] Error:", error);
    return errorResponse("Failed to update test", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return errorResponse("Forbidden", 403);
    }

    const { id } = params;

    await prisma.test.delete({
      where: { id },
    });

    return successResponse({ deleted: true }, "Test deleted successfully");
  } catch (error: any) {
    console.error("Admin Test DELETE [id] Error:", error);
    return errorResponse("Failed to delete test", 500);
  }
}
