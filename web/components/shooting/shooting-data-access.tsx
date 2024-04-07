'use client';

import { ShootingIDL, getShootingProgramId } from '@shooting/anchor';
import { Program } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, Keypair, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';

export function useShootingProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getShootingProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = new Program(ShootingIDL, programId, provider);

  const accounts = useQuery({
    queryKey: ['shooting', 'all', { cluster }],
    queryFn: () => program.account.shooting.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const initialize = useMutation({
    mutationKey: ['shooting', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods
        .initialize()
        .accounts({ shooting: keypair.publicKey })
        .signers([keypair])
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to initialize account'),
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  };
}

export function useShootingProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useShootingProgram();

  const accountQuery = useQuery({
    queryKey: ['shooting', 'fetch', { cluster, account }],
    queryFn: () => program.account.shooting.fetch(account),
  });

  const closeMutation = useMutation({
    mutationKey: ['shooting', 'close', { cluster, account }],
    mutationFn: () =>
      program.methods.close().accounts({ shooting: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  const decrementMutation = useMutation({
    mutationKey: ['shooting', 'decrement', { cluster, account }],
    mutationFn: () =>
      program.methods.decrement().accounts({ shooting: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const incrementMutation = useMutation({
    mutationKey: ['shooting', 'increment', { cluster, account }],
    mutationFn: () =>
      program.methods.increment().accounts({ shooting: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const setMutation = useMutation({
    mutationKey: ['shooting', 'set', { cluster, account }],
    mutationFn: (value: number) =>
      program.methods.set(value).accounts({ shooting: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  };
}
