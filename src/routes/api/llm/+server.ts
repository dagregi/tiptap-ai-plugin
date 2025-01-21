import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import { OPENAI_API_KEY } from "$env/static/private";

export const POST: RequestHandler = async ({ fetch, request }) => {
    const { prompt, text } = await request.json();

    try {
        const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "developer",
                            content:
                                "You are a helpful assistant. Keep the original HTML structure, including headings, bold, italics, lists, and other formatting. Don't add extra blank lines. Only modify the content as requested and just do what you're asked. Keep the original html structure",
                        },
                        {
                            role: "user",
                            content: `${text}\n\n${prompt}`,
                        },
                    ],
                }),
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            return error(response.status, {
                message: `API Error: ${errorText}`,
            });
        }

        const data = await response.json();
        return json({
            status: 200,
            body: { result: data.choices[0].message.content },
        });
    } catch (err: any) {
        if (err instanceof TypeError && err.message.includes("fetch")) {
            return error(503, {
                message:
                    "Network Error: Unable to connect to the server. Please check your internet connection.",
            });
        }
        return error(500, { message: `Unexpected error: ${err.message}` });
    }
};
