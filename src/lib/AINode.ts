import { Node, mergeAttributes } from "@tiptap/core";
import { SvelteNodeViewRenderer } from "svelte-tiptap";
import AIExtension from "$lib/AIExtension.svelte";
import { DOMSerializer } from "@tiptap/pm/model";

export interface AINodeOptions {
    HTMLAttributes: Record<string, any>;
    endpoint: string;
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        aiNode: {
            /**
             * Regenerates the selected text using AI and replaces it with the result.
             */
            regenerateSelectedText: (attributes: {
                endpoint: string;
            }) => ReturnType;
        };
    }
}

const AINode = Node.create<AINodeOptions>({
    name: "aiNode",
    group: "block",
	atom: true,

    addAttributes() {
        return {
            endpoint: {
                default: "/api/llm",
                parseHTML: (element) => element.getAttribute("data-endpoint"),
                renderHTML: (attributes) => {
                    return { "data-endpoint": attributes.endpoint };
                },
            },
            selectedText: {
                default: "",
                parseHTML: (element) =>
                    element.getAttribute("data-selected-text"),
                renderHTML: (attributes) => {
                    return { "data-selected-text": attributes.selectedText };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "ai-node",
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            "ai-node",
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
        ];
    },

    addNodeView() {
        return SvelteNodeViewRenderer(AIExtension);
    },

    addCommands() {
        return {
            regenerateSelectedText:
                (attributes) =>
                ({ editor, chain }) => {
                    const { from, to } = editor.state.selection;

                    const selectedFragment = editor.state.doc.slice(from, to);
                    const serializer = DOMSerializer.fromSchema(editor.schema);
                    const div = document.createElement("div");
                    div.appendChild(
                        serializer.serializeFragment(selectedFragment.content),
                    );
                    const selectedHTML = div.innerHTML;

                    if (!selectedHTML.trim()) {
                        console.error("No text selected for regeneration.");
                        return false;
                    }

                    return chain()
                        .insertContent({
                            type: this.name,
                            attrs: {
                                ...attributes,
                                selectedText: selectedHTML,
                            },
                        })
                        .run();
                },
        };
    },
});

export default AINode;
