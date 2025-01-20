<script lang="ts">
	import type { NodeViewProps } from "@tiptap/core";
	import { NodeViewWrapper } from "svelte-tiptap";
	import Spinner from "./Spinner.svelte";

	let props: NodeViewProps = $props();

	let inputValue: string = $state("");
	let selectedText: string = $state(props.node.attrs.selectedText || "");
	let responseText: string = $state("");
	let isLoading: boolean = $state(false);

	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (!selectedText) return;

		const endpoint = props.node.attrs.endpoint;
		if (!endpoint) {
			console.error("No endpoint provided for the AI node.");
			return;
		}

		if (!inputValue.trim()) {
			console.error("Prompt cannot be empty.");
			return;
		}

		isLoading = true;

		try {
			const response = await fetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					prompt: inputValue,
					text: selectedText,
				}),
			});

			if (!response.ok) throw new Error("Error fetching AI response.");

			const data = await response.json();
			responseText = data.body.result;
		} catch (error) {
			console.error("Error:", error);
		} finally {
			isLoading = false;
			insertAndDelete();
		}
	}

	function insertAndDelete() {
		props.editor
			.chain()
			.focus()
			.insertContentAt(
				props.editor.state.selection.$anchor.pos,
				responseText.trim(),
			)
			.run();

		props.deleteNode();
		props.editor.commands.focus();
	}
</script>

<NodeViewWrapper>
	<form onsubmit={handleSubmit} class="flex space-x-2 p-2 relative">
		<input
			type="text"
			bind:value={inputValue}
			class="flex-grow px-4 border border-gray-300 rounded-[25px] shadow focus:outline-none focus:ring-1 focus:ring-gray-500"
			placeholder="Enter a custom prompt"
		/>
		<button
			type="submit"
			class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
			disabled={isLoading}
		>
			{isLoading ? "..." : "Generate"}
		</button>
	</form>

	{#if isLoading}
		<div class="mt-4 flex items-center gap-2 text-sm text-gray-500">
			<Spinner />
			<span>Loading AI response...</span>
		</div>
	{/if}
</NodeViewWrapper>
