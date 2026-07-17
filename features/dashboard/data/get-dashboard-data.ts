import { createClient } from "@/lib/supabase/server";

export async function getDashboardData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, todos: null, todosError: null };
  }

  const { data: todos, error: todosError } = await supabase
    .from("todos")
    .select();

  return { user, todos, todosError };
}
