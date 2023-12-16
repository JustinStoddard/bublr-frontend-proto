export type BubbleMessage = {
  id: string;
  ownerId: string;
  parentBubbleId: string;
  content: string;
  createdAt: string;
};

export type Bubble = {
  id: string;
  ownerId: string;
  bubbleName: string;
  bubbleLongitude: number;
  bubbleLatitude: number;
  bubbleRadius: number;
};

export enum BublrAccountType {
  Standard = "standard",
  Premium = "premium",
  Business = "business",
}

export type BublrUser = {
  id: string;
  displayName: string;
  handle: string;
  email: string;
  password: string;
  accountType: BublrAccountType;
};

export type UserContext = {
  loggedIn: boolean;
  user: BublrUser | null;
};