export type { DataEnvelope, DataListEnvelope } from "./dataEnvelopes";
// ============================================================================
// USER TYPE
// ============================================================================
export type User = {
  id: number;
  firstName: string;
  username: string;
  image: string;
  role: string;
  following: number[];
  followers: number[];
  bio: string;
};
