import { handleBokomonMessage } from "./bokomon";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
      });
    }

    const response = await handleBokomonMessage(message);

    return new Response(JSON.stringify({ response }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in Bokomon endpoint:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
