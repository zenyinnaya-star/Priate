"use client";

import { FormEvent, useState } from "react";
import type { Movie } from "@/types/movie";

const initialMovies: Movie[] = [
  {
    id: "1",
    title: "The Matrix",
    actors: "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss",
    releaseDate: "1999-03-31",
  },
  {
    id: "2",
    title: "Inception",
    actors: "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page",
    releaseDate: "2010-07-16",
  },
  {
    id: "3",
    title: "Parasite",
    actors: "Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong",
    releaseDate: "2019-05-30",
  },
];

const emptyForm = { title: "", actors: "", releaseDate: "" };

function formatReleaseDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const isEditing = editingId !== null;

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const title = form.title.trim();
    const actors = form.actors.trim();
    const releaseDate = form.releaseDate;

    if (!title || !actors || !releaseDate) return;

    if (isEditing) {
      setMovies((prev) =>
        prev.map((movie) =>
          movie.id === editingId ? { ...movie, title, actors, releaseDate } : movie
        )
      );
    } else {
      setMovies((prev) => [
        ...prev,
        { id: crypto.randomUUID(), title, actors, releaseDate },
      ]);
    }

    resetForm();
  }

  function handleEdit(movie: Movie) {
    setEditingId(movie.id);
    setForm({ title: movie.title, actors: movie.actors, releaseDate: movie.releaseDate });
  }

  function handleDelete(id: string) {
    setMovies((prev) => prev.filter((movie) => movie.id !== id));
    if (editingId === id) resetForm();
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-12">
      <div className="text-center sm:text-left">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-cinema-red-bright">
          Now Showing
        </p>
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-foreground">
          Movie List
        </h1>
        <p className="mt-2 text-sm text-foreground/60">
          Add, update, or remove movies — including title, actors, and release date.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-[0_0_40px_-10px_rgba(225,6,0,0.25)]"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-foreground/80">
            Title
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Movie title"
              required
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none placeholder:text-foreground/30 focus:border-cinema-red"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-foreground/80">
            Release Date
            <input
              type="date"
              value={form.releaseDate}
              onChange={(e) => setForm((f) => ({ ...f, releaseDate: e.target.value }))}
              required
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none [color-scheme:dark] focus:border-cinema-red"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium text-foreground/80">
          Actors
          <input
            type="text"
            value={form.actors}
            onChange={(e) => setForm((f) => ({ ...f, actors: e.target.value }))}
            placeholder="Comma-separated actor names"
            required
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none placeholder:text-foreground/30 focus:border-cinema-red"
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-full bg-cinema-red px-5 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-[0_0_20px_-4px_rgba(225,6,0,0.8)] transition-colors hover:bg-cinema-red-bright"
          >
            {isEditing ? "Update Movie" : "Add Movie"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-surface-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <ul className="flex flex-col gap-3">
        {movies.length === 0 && (
          <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-foreground/50">
            No movies yet. Add one above.
          </li>
        )}
        {movies.map((movie) => (
          <li
            key={movie.id}
            className="flex flex-col gap-3 rounded-xl border border-border border-l-4 border-l-cinema-red bg-surface p-5 transition-shadow hover:shadow-[0_0_30px_-8px_rgba(225,6,0,0.4)] sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 className="text-lg font-bold uppercase tracking-tight text-foreground">
                {movie.title}
              </h2>
              <p className="text-sm text-foreground/60">{movie.actors}</p>
              <p className="text-sm text-cinema-red-bright">
                Released {formatReleaseDate(movie.releaseDate)}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => handleEdit(movie)}
                className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface-2"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(movie.id)}
                className="rounded-full border border-cinema-red-dim px-4 py-1.5 text-sm font-medium text-cinema-red-bright transition-colors hover:bg-cinema-red-dim"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
