<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { Editor } from "@tiptap/core";
	import StarterKit from "@tiptap/starter-kit";
	import BubbleMenu from "@tiptap/extension-bubble-menu";
	import Placeholder from "@tiptap/extension-placeholder";

	let element: Element | undefined;
	let editor: any;

	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: [
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

<div id="bubble-menu">
	<button>Ask AI</button>
	<button on:click={() => editor.chain().focus().toggleBold().run()}
		><strong>B</strong></button
	>
	<button on:click={() => editor.chain().focus().toggleItalic().run()}
		><em>I</em></button
	>
	<button on:click={() => editor.chain().focus().toggleStrike().run()}
		><s>S</s></button
	>
</div>
<div bind:this={element}></div>
