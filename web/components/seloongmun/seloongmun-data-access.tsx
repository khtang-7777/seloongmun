'use client';

import { ShootingIDL, getShootingProgramId } from '@seloongmun/anchor';
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
    queryKey: ['seloongmun', 'all', { cluster }],
    queryFn: () => program.account.seloongmun.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const initialize = useMutation({
    mutationKey: ['seloongmun', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods
        .initialize()
        .accounts({ seloongmun: keypair.publicKey })
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
    queryKey: ['seloongmun', 'fetch', { cluster, account }],
    queryFn: () => program.account.seloongmun.fetch(account),
  });

  const closeMutation = useMutation({
    mutationKey: ['seloongmun', 'close', { cluster, account }],
    mutationFn: () =>
      program.methods.close().accounts({ seloongmun: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  const decrementMutation = useMutation({
    mutationKey: ['seloongmun', 'decrement', { cluster, account }],
    mutationFn: () =>
      program.methods.decrement().accounts({ seloongmun: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const incrementMutation = useMutation({
    mutationKey: ['seloongmun', 'increment', { cluster, account }],
    mutationFn: () =>
      program.methods.increment().accounts({ seloongmun: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const setMutation = useMutation({
    mutationKey: ['seloongmun', 'set', { cluster, account }],
    mutationFn: (value: number) =>
      program.methods.set(value).accounts({ seloongmun: account }).rpc(),
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
