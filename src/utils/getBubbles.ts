import { Bubble } from "../types/bubble-types";
import { getLocalStorageItem } from "./localStorage";

export const getBubbles = (ownerId: string) => {
  const bubbles = getLocalStorageItem("bubbles", []) as Bubble[];
  return bubbles.filter(bubble => {
    if (ownerId === bubble.ownerId) return bubble;
    return;
  });
};