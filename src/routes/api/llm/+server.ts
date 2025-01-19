import { json } from "@sveltejs/kit";
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
                                "You are a helpful assistant. Keep the original HTML structure, including headings, bold, italics, lists, and other formatting. Only modify the content as requested and just do what you're asked.",
                        },
                        {
                            role: "user",
                            content: `${prompt}\n\n${text}`,
                        },
                    ],
                }),
            },
        );

        const data = await response.json();
        return json({
            status: 200,
            body: { result: data.choices[0].message.content },
        });
    } catch (error) {
        return json({
            status: 500,
            body: { error: `Failed to connect to OpenAI API` },
        });
    }
};
