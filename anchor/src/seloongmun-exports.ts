// Here we export some useful types and functions for interacting with the Anchor program.
import { Cluster, PublicKey } from '@solana/web3.js';
import type { Seloongmun } from '../target/types/seloongmun';
import { IDL as SeloongmunIDL } from '../target/types/seloongmun';

// Re-export the generated IDL and type
export { Seloongmun, SeloongmunIDL };

// After updating your program ID (e.g. after running `anchor keys sync`) update the value below.
export const SHOOTING_PROGRAM_ID = new PublicKey(
  '7ufZLJwYB2tCgEQjfnGxWhLbRuD6rAU6hvi1XiYw3Wzp'
);

// This is a helper function to get the program ID for the Seloongmun program depending on the cluster.
export function getSeloongmunProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return SHOOTING_PROGRAM_ID;
  }
}
