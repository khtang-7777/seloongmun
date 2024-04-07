import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import { Shooting } from '../target/types/shooting';

describe('shooting', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.Shooting as Program<Shooting>;

  const shootingKeypair = Keypair.generate();

  it('Initialize Shooting', async () => {
    await program.methods
      .initialize()
      .accounts({
        shooting: shootingKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([shootingKeypair])
      .rpc();

    const currentCount = await program.account.shooting.fetch(
      shootingKeypair.publicKey
    );

    expect(currentCount.count).toEqual(0);
  });

  it('Increment Shooting', async () => {
    await program.methods
      .increment()
      .accounts({ shooting: shootingKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.shooting.fetch(
      shootingKeypair.publicKey
    );

    expect(currentCount.count).toEqual(1);
  });

  it('Increment Shooting Again', async () => {
    await program.methods
      .increment()
      .accounts({ shooting: shootingKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.shooting.fetch(
      shootingKeypair.publicKey
    );

    expect(currentCount.count).toEqual(2);
  });

  it('Decrement Shooting', async () => {
    await program.methods
      .decrement()
      .accounts({ shooting: shootingKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.shooting.fetch(
      shootingKeypair.publicKey
    );

    expect(currentCount.count).toEqual(1);
  });

  it('Set shooting value', async () => {
    await program.methods
      .set(42)
      .accounts({ shooting: shootingKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.shooting.fetch(
      shootingKeypair.publicKey
    );

    expect(currentCount.count).toEqual(42);
  });

  it('Set close the shooting account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        shooting: shootingKeypair.publicKey,
      })
      .rpc();

    // The account should no longer exist, returning null.
    const userAccount = await program.account.shooting.fetchNullable(
      shootingKeypair.publicKey
    );
    expect(userAccount).toBeNull();
  });
});
