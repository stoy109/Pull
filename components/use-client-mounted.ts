"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function useClientMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    clientSnapshot,
    serverSnapshot,
  );
}
