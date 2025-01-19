<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { Editor } from "@tiptap/core";
	import AINode from "$lib/AINode";
	import StarterKit from "@tiptap/starter-kit";
	import BubbleMenu from "@tiptap/extension-bubble-menu";
	import Placeholder from "@tiptap/extension-placeholder";

	let element: Element | undefined;
	let editor: any;

	function addAINode() {
		editor
			.chain()
			.focus()
			.regenerateSelectedText({ endpoint: "/api/llm" })
			.run();
	}

	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: [
				AINode,
				StarterKit,
				Placeholder.configure({
					placeholder: "Start typing...",
				}),
				BubbleMenu.configure({
					element: document.querySelector("#bubble-menu"),
					tippyOptions: {
						duration: 200,
					},
				}),
			],
			content: "Hello World!",
			onTransaction: () => {
				editor = editor;
			},
		});
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});
</script>

<div id="bubble-menu" class="flex space-x-2 p-2 bg-gray-100 rounded shadow-md">
	<button
		on:click={addAINode}
		class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
	>
		Ask AI
	</button>
	<button
		on:click={() => editor.chain().focus().toggleBold().run()}
		class="px-3 py-2 text-gray-700 rounded active:bg-gray-400 active:ring-2 active:ring-gray-500 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
	>
		<strong>B</strong>
	</button>
	<button
		on:click={() => editor.chain().focus().toggleItalic().run()}
		class="px-3 py-2 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
	>
		<em>I</em>
	</button>
	<button
		on:click={() => editor.chain().focus().toggleStrike().run()}
		class="px-3 py-2 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
	>
		<s>S</s>
	</button>
</div>

<div>
	<div bind:this={element}></div>
</div>
