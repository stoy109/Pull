import { createClient } from "@/utils/supabase/server";
import LeafletMap from "@/components/leaflet-map";

export default async function Page() {
  const supabase = await createClient();

  const { data: todos } = await supabase.from("todos").select();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 p-6 md:p-10">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/30 md:p-8">
        <div className="mb-6 flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            Supabase
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Todos and map preview
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
            The page stays server-rendered for the database query, while Leaflet
            mounts on the client inside a PWA-ready shell.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="mb-4 text-lg font-medium text-white">Todos</h2>
            <ul className="space-y-3 text-sm text-slate-200">
              {todos?.length ? (
                todos.map((todo) => (
                  <li
                    key={todo.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3"
                  >
                    {todo.name}
                  </li>
                ))
              ) : (
                <li className="rounded-2xl border border-dashed border-white/15 px-4 py-8 text-slate-400">
                  No todos found yet.
                </li>
              )}
            </ul>
          </div>

          <div className="min-h-[420px] overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-3">
            <LeafletMap />
          </div>
        </div>
      </section>
    </main>
  );
}
