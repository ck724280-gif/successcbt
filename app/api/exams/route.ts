import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/utils/apiResponse";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");

    const categories = await prisma.category.findMany({
      where: categorySlug ? { slug: categorySlug } : undefined,
      include: {
        exams: {
          where: { isPublished: true },
          include: {
            _count: {
              select: { tests: { where: { isPublished: true } } },
            },
          },
          orderBy: { title: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return successResponse(categories, "Categories and exams retrieved successfully");
  } catch (error: any) {
    console.error("Fetch Exams Error:", error);
    return errorResponse("Failed to fetch exams", 500);
  }
}
