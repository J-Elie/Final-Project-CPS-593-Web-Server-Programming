/**
 * posts.ts
 * ========
 */
export type { DataEnvelope, DataListEnvelope } from "./dataEnvelopes";
export type { Comment } from "./comments";
import type { Comment } from "./comments";
// ============================================================================
// POST TYPE
// ============================================================================
export type Post = {
  id: number;
  userId: number;
  title: string;
  type: string;
  date: string;
  duration: string;
  intensity: string;
  picture: string;
  notes: string;
  createdAt: string;
  likes?: number[];
  comments?: Comment[];
};
