import { Node, mergeAttributes } from "@tiptap/core";
import { SvelteNodeViewRenderer } from "svelte-tiptap";
import AIExtension from "$lib/AIExtension.svelte";
import { DOMSerializer } from "@tiptap/pm/model";

export interface AINodeOptions {
    /**
     * HTML attributes to add to the node.
     */
    HTMLAttributes: Record<string, any>;

    /**
     * The API endpoint for generating AI content.
     * @default ""
     */
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

/**
 * AINode is a custom node for the Tiptap editor that allows users to regenerate selected text using AI.
 * It provides an interface for interacting with an AI API endpoint.
 */
const AINode = Node.create<AINodeOptions>({
    name: "aiNode",
    group: "block",
    atom: true,

    addOptions() {
        return {
            HTMLAttributes: {},
            endpoint: "",
        };
    },

    addAttributes() {
        return {
            endpoint: {
                default: this.options.endpoint,
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
        return [{ tag: "ai-node" }];
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
