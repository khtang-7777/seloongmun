import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import { Shooting } from '../target/types/shooting';
const { SystemProgram } = anchor.web3;

describe('shooting', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.Shooting as Program<Shooting>;

  const shootingKeypair = Keypair.generate();
  console.log(`shootingKeypair Account: ${shootingKeypair.publicKey}`);

  const [shootingPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('shooting')],
    program.programId
  );
  console.log(`shootingPDA Account: ${shootingPDA}`);
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
        shooting: shootingPDA,
        safeVault: safeVaultPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    const shootingData = await program.account.shooting.fetch(shootingPDA);
    console.log('Last Card Draw: ', shootingData.lastCard + '\n');
    console.log(
      'shootingPDA R Pole: ',
      getCard(shootingData.leftPole) + '(' + shootingData.leftPole + ')\n'
    );
    console.log(
      'shootingPDA L Pole: ',
      getCard(shootingData.rightPole) + '(' + shootingData.rightPole + ')\n'
    );
    console.log(
      'shootingPDA deck: ',
      shootingData.deck + '(' + shootingData.deck.toString(2) + ')\n'
    );
  });

  it('draw', async () => {
    let balanceVault = await provider.connection.getBalance(safeVaultPDA);
    let balancePlayer = await provider.connection.getBalance(payer.publicKey);
    let safeVaultData = await program.account.safeVault.fetch(safeVaultPDA);
    console.log(
      'Account Balance\tsafevault: ' +
        balanceVault +
        '(poll:'+safeVaultData.poolAmount+')\tplayer' +
        balancePlayer +
        '\n'
    );
    let shootingData;
    for (let i = 0; i < 10; i++) {
      shootingData = await program.account.shooting.fetch(shootingPDA);
      console.log(
        'R Pole: ',
        getCard(shootingData.leftPole) +
          '(' +
          shootingData.leftPole +
          ') L Pole: ',
        getCard(shootingData.rightPole) +
          '(' +
          shootingData.rightPole +
          ') deck: ',
        shootingData.deck +
          '(' +
          shootingData.deck.toString(2) +
          '), remaining' +
          shootingData.deck.toString(2).match(/1/g).length +
          '\n'
      );
      await program.methods
        .draw(new anchor.BN(40))
        .accounts({
          player: payer.publicKey,
          shooting: shootingPDA,
          safeVault: safeVaultPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      shootingData = await program.account.shooting.fetch(shootingPDA);
      console.log(
        'Card Draw: ',
        getCard(shootingData.lastCard) + '(' + shootingData.lastCard + ')\n'
      );
      balanceVault = await provider.connection.getBalance(safeVaultPDA);
      balancePlayer = await provider.connection.getBalance(payer.publicKey);
      safeVaultData = await program.account.safeVault.fetch(safeVaultPDA);
      console.log(
        'Account Balance\tsafevault: ' +
          balanceVault +
          '(poll:'+safeVaultData.poolAmount+')\tplayer' +
          balancePlayer +
          '\n'
      );
    }
  });

  it('safe-vault-test', async () => {
    let shootingData = await program.account.shooting.fetch(shootingPDA);
    console.log(
      'R Pole: ',
      getCard(shootingData.leftPole) +
        '(' +
        shootingData.leftPole +
        ') L Pole: ',
      getCard(shootingData.rightPole) +
        '(' +
        shootingData.rightPole +
        ') deck: ',
      shootingData.deck +
        '(' +
        shootingData.deck.toString(2) +
        '), remaining' +
        shootingData.deck.toString(2).match(/1/g).length +
        '\n'
    );
    let balanceVault = await provider.connection.getBalance(safeVaultPDA);
    let safeVaultData = await program.account.safeVault.fetch(safeVaultPDA);
    console.log(
      'Safe-Vault balance: ' +
        balanceVault +
        '\tpool: ' +
        safeVaultData.poolAmount +
        '\n'
    );
    await program.methods
      .draw(new anchor.BN(40))
      .accounts({
        player: payer.publicKey,
        shooting: shootingPDA,
        safeVault: safeVaultPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    shootingData = await program.account.shooting.fetch(shootingPDA);
    console.log(
      'Card Draw: ',
      getCard(shootingData.lastCard) + '(' + shootingData.lastCard + ')\n'
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
