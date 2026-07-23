"use client";

import { useActionState } from "react";
import { Ban, CheckCircle2, LoaderCircle } from "lucide-react";
import {
  setUserStatusAction,
  type UserStatusActionState,
} from "@/features/admin/actions";

const INITIAL_STATE: UserStatusActionState = { status: "idle", message: "" };

export function UserStatusAction({
  userId,
  currentStatus,
  disabled,
}: Readonly<{
  userId: string;
  currentStatus: "active" | "suspended";
  disabled: boolean;
}>) {
  const [state, formAction, pending] = useActionState(setUserStatusAction, INITIAL_STATE);
  const nextStatus = currentStatus === "active" ? "suspended" : "active";
  const isSuspending = nextStatus === "suspended";

  return (
    <div className="min-w-36">
      <form
        action={formAction}
        onSubmit={(event) => {
          const message = isSuspending
            ? "Tangguhkan akun ini? Pengguna akan kehilangan akses ke dashboard."
            : "Aktifkan kembali akun ini?";
          if (!window.confirm(message)) event.preventDefault();
        }}
      >
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="status" value={nextStatus} />
        <button
          type="submit"
          disabled={disabled || pending}
          className={`inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border px-3 text-[10px] font-extrabold transition disabled:cursor-not-allowed disabled:opacity-40 ${
            isSuspending
              ? "border-[#e8c8ca] text-[#a63c46] hover:bg-[#fff2f2]"
              : "border-[#bcdcc9] text-[#087447] hover:bg-[#edf8f1]"
          }`}
        >
          {pending ? (
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          ) : isSuspending ? (
            <Ban className="h-3.5 w-3.5" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          {pending ? "Memproses" : isSuspending ? "Tangguhkan" : "Aktifkan"}
        </button>
      </form>
      {state.status !== "idle" ? (
        <p className={`mt-1 text-[8px] font-bold ${state.status === "error" ? "text-[#b33e48]" : "text-[#087447]"}`}>
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
