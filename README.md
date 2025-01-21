# Tiptap AI Editor

This project implements a text editor using Tiptap that allows users to select text and regenerate it using AI.

## Features

- Select text and regenerate it using an AI API.
- Inline input for custom prompts.
- Responsive design.

## Installation

Make sure you have an `.env` file with the variable `OPENAI_API_KEY` for the AI response.

1. Clone the repository.
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the development server
    ```bash
    npm run dev
    ```

## Usage

To use the extension add `AINode` to the list of extension.

```ts
// example configuration
editor = new Editor({
    element: "",
    extensions: [
        StarterKit,
        AINode.configure({ endpoint: "/api/llm" }),
    ],
    content: "",
    onTransaction: () => {
        editor = editor;
    },
});
```
