import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import { Seloongmun } from '../target/types/seloongmun';
const { SystemProgram } = anchor.web3;

describe('seloongmun', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.Seloongmun as Program<Seloongmun>;

  const seloongmunKeypair = Keypair.generate();
  console.log(`seloongmunKeypair Account: ${seloongmunKeypair.publicKey}`);

  const [seloongmunPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('seloongmun')],
    program.programId
  );
  console.log(`seloongmunPDA Account: ${seloongmunPDA}`);
  const [safeVaultPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('safevault')],
    program.programId
  );
  console.log(`safeVaultPDA Account: ${safeVaultPDA}`);
  console.log('Account Balance before Draw: \n');

  it('init', async () => {
    await program.methods
      .initialize()
      .accounts({
        signer: payer.publicKey,
        seloongmun: seloongmunPDA,
        safeVault: safeVaultPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    const seloongmunData = await program.account.seloongmun.fetch(seloongmunPDA);
    console.log('Last Card Draw: ', seloongmunData.lastCard + '\n');
    console.log(
      'seloongmunPDA R Pole: ',
      getCard(seloongmunData.leftPole) + '(' + seloongmunData.leftPole + ')\n'
    );
    console.log(
      'seloongmunPDA L Pole: ',
      getCard(seloongmunData.rightPole) + '(' + seloongmunData.rightPole + ')\n'
    );
    console.log(
      'seloongmunPDA deck: ',
      seloongmunData.deck + '(' + seloongmunData.deck.toString(2) + ')\n'
    );
  });

  it('draw', async () => {
    let balanceVault = await provider.connection.getBalance(safeVaultPDA);
    let balancePlayer = await provider.connection.getBalance(payer.publicKey);
    let safeVaultData = await program.account.safeVault.fetch(safeVaultPDA);
    console.log(
      'Account Balance\tsafevault: ' +
        balanceVault/1000000000 +
        '(poll:'+safeVaultData.poolAmount+')\tplayer' +
        balancePlayer/1000000000 +
        '\n'
    );
    let seloongmunData;
    for (let i = 0; i < 10; i++) {
      seloongmunData = await program.account.seloongmun.fetch(seloongmunPDA);
      console.log(
        'R Pole: ',
        getCard(seloongmunData.leftPole) +
          '(' +
          seloongmunData.leftPole +
          ') L Pole: ',
        getCard(seloongmunData.rightPole) +
          '(' +
          seloongmunData.rightPole +
          ') deck: ',
        seloongmunData.deck +
          '(' +
          seloongmunData.deck.toString(2) +
          '), remaining' +
          seloongmunData.deck.toString(2).match(/1/g).length +
          '\n'
      );
      await program.methods
        .draw(new anchor.BN(1000000000))
        .accounts({
          player: payer.publicKey,
          seloongmun: seloongmunPDA,
          safeVault: safeVaultPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      seloongmunData = await program.account.seloongmun.fetch(seloongmunPDA);
      console.log(
        'Card Draw: ',
        getCard(seloongmunData.lastCard) + '(' + seloongmunData.lastCard + ')\n'
      );
      balanceVault = await provider.connection.getBalance(safeVaultPDA);
      balancePlayer = await provider.connection.getBalance(payer.publicKey);
      safeVaultData = await program.account.safeVault.fetch(safeVaultPDA);
      console.log(
        'Account Balance\tsafevault: ' +
          balanceVault/1000000000 +
          '(poll:'+safeVaultData.poolAmount+')\tplayer' +
          balancePlayer/1000000000 +
          '\n'
      );
    }
  });

  it('safe-vault-test', async () => {
    let seloongmunData = await program.account.seloongmun.fetch(seloongmunPDA);
    console.log(
      'R Pole: ',
      getCard(seloongmunData.leftPole) +
        '(' +
        seloongmunData.leftPole +
        ') L Pole: ',
      getCard(seloongmunData.rightPole) +
        '(' +
        seloongmunData.rightPole +
        ') deck: ',
      seloongmunData.deck +
        '(' +
        seloongmunData.deck.toString(2) +
        '), remaining' +
        seloongmunData.deck.toString(2).match(/1/g).length +
        '\n'
    );
    let balanceVault = await provider.connection.getBalance(safeVaultPDA);
    let safeVaultData = await program.account.safeVault.fetch(safeVaultPDA);
    console.log(
      'Safe-Vault balance: ' +
        balanceVault/1000000 +
        '\tpool: ' +
        safeVaultData.poolAmount/1000000 +
        '\n'
    );
    await program.methods
      .draw(new anchor.BN(40))
      .accounts({
        player: payer.publicKey,
        seloongmun: seloongmunPDA,
        safeVault: safeVaultPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    seloongmunData = await program.account.seloongmun.fetch(seloongmunPDA);
    console.log(
      'Card Draw: ',
      getCard(seloongmunData.lastCard) + '(' + seloongmunData.lastCard + ')\n'
    );
    balanceVault = await provider.connection.getBalance(safeVaultPDA);
    safeVaultData = await program.account.safeVault.fetch(safeVaultPDA);
    console.log(
      'Safe-Vault balance: ' +
        balanceVault +
        '\tpool: ' +
        safeVaultData.poolAmount +
        '\n'
    );
  });

  function getCard(a: number) {
    let result: string = '';
    switch (Math.floor(a / 4)) {
      case 0: {
        result = 'A';
        break;
      }
      case 10: {
        result = 'J';
        break;
      }
      case 11: {
        result = 'Q';
        break;
      }
      case 12: {
        result = 'K';
        break;
      }
      default: {
        result = Math.floor(a / 4 + 1).toString();
        break;
      }
    }
    switch (a % 4) {
      case 0: {
        result += '♠';
        break;
      }
      case 1: {
        result += '♥';
        break;
      }
      case 2: {
        result += '♦';
        break;
      }
      case 3: {
        result += '♣';
        break;
      }
    }
    return result;
  }
});
