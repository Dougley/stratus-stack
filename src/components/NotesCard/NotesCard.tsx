import {
	ActionIcon,
	Alert,
	Button,
	Card,
	Group,
	Loader,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';
import { useState } from 'react';

// `getRouteApi` is the canonical way to access a route's typed context/loader
// from a component that lives outside that route file. Avoid the
// `createFileRoute('/')()` invocation, which creates a brand-new orphan route
// and only happens to work because the types overlap.
const route = getRouteApi('/');

export function NotesCard() {
	const [newNote, setNewNote] = useState('');
	const { trpc } = route.useRouteContext();
	const queryClient = useQueryClient();

	// Query to fetch all notes
	const notesQuery = useQuery(trpc.notes.list.queryOptions());

	// Invalidate the notes list cache after any mutation. `queryFilter()` is
	// the documented v11 idiom — it produces a typed `{ queryKey, ... }`
	// filter that scopes invalidation precisely to this procedure (and lets
	// you narrow further with `predicate`/`exact` later if needed).
	const invalidateNotes = () =>
		queryClient.invalidateQueries(trpc.notes.list.queryFilter());

	// Mutation to create a new note
	const createMutation = useMutation(
		trpc.notes.create.mutationOptions({
			onSuccess: () => {
				invalidateNotes();
				setNewNote('');
			},
		})
	);

	// Mutation to delete a note
	const deleteMutation = useMutation(
		trpc.notes.delete.mutationOptions({
			onSuccess: invalidateNotes,
		})
	);

	const handleCreate = () => {
		if (newNote.trim()) {
			createMutation.mutate({ content: newNote.trim() });
		}
	};

	const handleDelete = (id: number) => {
		deleteMutation.mutate({ id });
	};

	return (
		<Card withBorder p="lg">
			<Stack gap="sm">
				<Title order={3}>Notes (Drizzle ORM + tRPC)</Title>
				<Text c="dimmed">
					Demonstrates database access through tRPC procedures using Drizzle ORM
					and Cloudflare D1.
				</Text>

				{/* Add new note form */}
				<Group align="flex-end">
					<TextInput
						flex={1}
						placeholder="Write a note..."
						value={newNote}
						onChange={(e) => setNewNote(e.currentTarget.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								handleCreate();
							}
						}}
						maxLength={500}
					/>
					<Button
						onClick={handleCreate}
						loading={createMutation.isPending}
						disabled={!newNote.trim()}
					>
						Add Note
					</Button>
				</Group>

				{/* Notes list */}
				{notesQuery.isLoading ? (
					<Group justify="center" py="md">
						<Loader size="sm" />
					</Group>
				) : notesQuery.error ? (
					<Alert color="red" variant="light">
						Error loading notes: {notesQuery.error.message}
					</Alert>
				) : notesQuery.data && notesQuery.data.length > 0 ? (
					<Stack gap="xs">
						{notesQuery.data.map((note) => (
							<Card key={note.id} withBorder p="sm">
								<Group justify="space-between" align="flex-start">
									<Text flex={1}>{note.content}</Text>
									<ActionIcon
										color="red"
										variant="subtle"
										onClick={() => handleDelete(note.id)}
										loading={deleteMutation.isPending}
										size="sm"
									>
										×
									</ActionIcon>
								</Group>
							</Card>
						))}
					</Stack>
				) : (
					<Alert color="gray" variant="light">
						No notes yet. Add your first note above!
					</Alert>
				)}

				<Alert color="teal" variant="light">
					Data is stored in Cloudflare D1 (SQLite). Database operations only
					happen through tRPC procedures, not during SSR.
				</Alert>
			</Stack>
		</Card>
	);
}
