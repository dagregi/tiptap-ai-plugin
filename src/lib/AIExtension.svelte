<script lang="ts">
	import type { NodeViewProps } from "@tiptap/core";
	import { NodeViewWrapper } from "svelte-tiptap";

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
			responseText = data.body.result || "No response received.";
		} catch (error) {
			console.error("Error:", error);
			responseText = "Failed to fetch response.";
		} finally {
			isLoading = false;
		}
	}

	function insertAndDelete() {
		if (!responseText.trim()) return;

		props.editor
			.chain()
			.focus()
			.insertContentAt(
				props.editor.state.selection.$anchor.pos,
				responseText,
			)
			.run();

		props.deleteNode();
		props.editor.commands.focus();
	}
</script>

<NodeViewWrapper class="p-4 bg-white border rounded-lg shadow">
	<form onsubmit={handleSubmit} class="flex flex-col gap-4">
		<label for="aiPrompt" class="block text-sm font-medium text-gray-700"
			>Prompt</label
		>
		<input
			id="aiPrompt"
			type="text"
			bind:value={inputValue}
			class="rounded p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
			placeholder="Enter a custom prompt"
		/>
		<button
			type="submit"
			class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
			disabled={isLoading}
		>
			{isLoading ? "Generating..." : "Generate"}
		</button>
	</form>

	{#if isLoading}
		<div class="mt-4 text-sm text-gray-500">Loading AI response...</div>
	{:else if responseText}
		<div
			class="mt-4 p-2 bg-gray-50 border border-gray-200 rounded-md text-sm"
		>
			{responseText}
		</div>
	{/if}

	{#if responseText && !isLoading}
		<button
			onclick={insertAndDelete}
			class="mt-4 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
		>
			Insert
		</button>
	{/if}
</NodeViewWrapper>
