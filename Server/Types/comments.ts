export type { DataEnvelope, DataListEnvelope } from "./dataEnvelopes";
// ============================================================================
// COMMENT TYPE
// ============================================================================
export type Comment = {
  id: number;
  userId: number;
  content: string;
  createdAt: string;
};
