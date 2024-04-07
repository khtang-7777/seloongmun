#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("7ufZLJwYB2tCgEQjfnGxWhLbRuD6rAU6hvi1XiYw3Wzp");

#[program]
pub mod shooting {
    use super::*;

  pub fn close(_ctx: Context<CloseShooting>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.shooting.count = ctx.accounts.shooting.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.shooting.count = ctx.accounts.shooting.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeShooting>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.shooting.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeShooting<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Shooting::INIT_SPACE,
  payer = payer
  )]
  pub shooting: Account<'info, Shooting>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseShooting<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub shooting: Account<'info, Shooting>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub shooting: Account<'info, Shooting>,
}

#[account]
#[derive(InitSpace)]
pub struct Shooting {
  count: u8,
}
