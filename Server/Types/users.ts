export type { DataEnvelope, DataListEnvelope } from "./dataEnvelopes";
// ============================================================================
// USER TYPE
// ============================================================================
export type User = {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  email: string;
  username: string;
  image: string;
  height: number;
  weight: number;
  role: string;
  following: number[];
  followers: number[];
  bio: string;
};
