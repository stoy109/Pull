import { createClient } from "@/utils/supabase/server";
import LeafletMap from "@/components/leaflet-map";

export default async function Page() {
  const supabase = await createClient();

  const { data: todos } = await supabase.from("todos").select();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 p-6 md:p-10">
      <section className="rounded-[2rem] border border-border bg-surface-inverse p-6 text-text-inverse shadow-2xl shadow-primary-900/30 md:p-8">
        <div className="mb-6 flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.3em] text-accent-green">
            Supabase
          </p>
          <h1 className="text-heading tracking-tight">
            Todos and map preview
          </h1>
          <p className="max-w-3xl text-body text-text-inverse/80">
            The page stays server-rendered for the database query, while Leaflet
            mounts on the client inside a PWA-ready shell.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-3xl border border-border bg-surface/10 p-5">
            <h2 className="mb-4 text-subheading text-text-inverse">Todos</h2>
            <ul className="space-y-3 text-sm text-text-inverse/85">
              {todos?.length ? (
                todos.map((todo) => (
                  <li
                    key={todo.id}
                    className="rounded-2xl border border-border-muted bg-primary-900/80 px-4 py-3"
                  >
                    {todo.name}
                  </li>
                ))
              ) : (
                <li className="rounded-2xl border border-dashed border-border-muted px-4 py-8 text-text-inverse/60">
                  No todos found yet.
                </li>
              )}
            </ul>
          </div>

          <div className="min-h-[420px] overflow-hidden rounded-3xl border border-border bg-surface/10 p-3">
            <LeafletMap />
          </div>
        </div>
      </section>
    </main>
  );
}
