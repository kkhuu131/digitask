import { NextResponse } from "next/server";
import { handleBokomonMessage } from "@/api/bokomon";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const response = await handleBokomonMessage(message);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error handling Bokomon message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
