import { BubbleMessage } from "../types/bubble-types";
import { getLocalStorageItem } from "./localStorage";

export const getMessages = (parentBubbleId: string) => {
  const bubbleMessages = getLocalStorageItem("bubbleMessages", []) as BubbleMessage[];
  return bubbleMessages.filter(message => {
    if (parentBubbleId === message.parentBubbleId) return message;
    return;
  });
};