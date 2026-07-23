"use client";

import { useActionState } from "react";
import { CheckCircle2, LoaderCircle, X } from "lucide-react";
import { recordImpactAction, type ImpactActionState } from "@/features/admin/actions";
import type { ImpactActionType, ImpactItemType } from "@/lib/impact/dashboard";

const INITIAL_STATE: ImpactActionState = { status: "idle", message: "" };

function ActionButton({ itemType, itemId, actionType }: {
  itemType: ImpactItemType;
  itemId: string;
  actionType: ImpactActionType;
}) {
  const [state, formAction, pending] = useActionState(recordImpactAction, INITIAL_STATE);
  const followedUp = actionType === "followed_up";

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="itemType" value={itemType} />
        <input type="hidden" name="itemId" value={itemId} />
        <input type="hidden" name="actionType" value={actionType} />
        <button type="submit" disabled={pending} className={`inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-[9px] font-extrabold transition disabled:cursor-wait disabled:opacity-60 ${followedUp ? "bg-[#0b7449] text-white hover:bg-[#096740]" : "border border-[#d7e1dc] bg-white text-[#677a72] hover:bg-[#f3f7f5]"}`}>
          {pending ? <LoaderCircle className="h-3 w-3 animate-spin" /> : followedUp ? <CheckCircle2 className="h-3 w-3" /> : <X className="h-3 w-3" />}
          {pending ? "Mencatat" : followedUp ? "Tindak lanjuti" : "Abaikan"}
        </button>
      </form>
      {state.status !== "idle" ? <p className={`mt-1 max-w-28 text-[8px] font-bold ${state.status === "error" ? "text-[#b33e48]" : "text-[#087447]"}`}>{state.message}</p> : null}
    </div>
  );
}

export function ImpactActionControls({ itemType, itemId }: Readonly<{ itemType: ImpactItemType; itemId: string }>) {
  return <div className="flex items-start justify-end gap-2">
    <ActionButton itemType={itemType} itemId={itemId} actionType="followed_up" />
    <ActionButton itemType={itemType} itemId={itemId} actionType="dismissed" />
  </div>;
}
