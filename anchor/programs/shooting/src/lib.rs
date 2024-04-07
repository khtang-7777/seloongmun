#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use anchor_lang::system_program;
use std::mem;
use std::cmp::min;

const NEW_DECK: u64 = 0xFFFFFFFFFFFFF;
const DEFAULT_NEW_POOL_AMOUNT: u64 = 10000000;

declare_id!("7ufZLJwYB2tCgEQjfnGxWhLbRuD6rAU6hvi1XiYw3Wzp");

#[program]
pub mod shooting {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let slot1 = Clock::get()?.slot;
        let (left_pole, right_pole, new_mask) = draw_poles(slot1, NEW_DECK);
        ctx.accounts.shooting.last_card = 0xFF;
        ctx.accounts.shooting.left_pole = left_pole;
        ctx.accounts.shooting.right_pole = right_pole;
        ctx.accounts.shooting.deck = new_mask;
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.signer.to_account_info().clone(),
                to: ctx.accounts.safe_vault.to_account_info().clone(),
            },
        );
        ctx.accounts.safe_vault.pool_amount = DEFAULT_NEW_POOL_AMOUNT;
        ctx.accounts.safe_vault.reserve_rate = 90;

        system_program::transfer(cpi_context, 30000000)?;
        Ok(())
    }

    pub fn draw(ctx: Context<Draw>, _amount: u64) -> Result<()> {
        if _amount * 2 >= ctx.accounts.player.to_account_info().get_lamports() {
            return err!(ShootingError::NotEnoughBet);
        }
        if _amount > ctx.accounts.safe_vault.pool_amount {
            return err!(ShootingError::NotEnoughFund);
        }
        //Draw a card
        let seed = Clock::get()?.slot;
        let (card, mut new_mask) = rand_from_mask(seed, ctx.accounts.shooting.deck);
        //Check condition
        let left_num = ctx.accounts.shooting.left_pole / 4;
        let right_num = ctx.accounts.shooting.right_pole / 4;
        let card_num = card / 4;
        if card_num > left_num && card_num < right_num {
            **ctx
                .accounts
                .safe_vault
                .to_account_info()
                .try_borrow_mut_lamports()? -= _amount;
            **ctx
                .accounts
                .player
                .to_account_info()
                .try_borrow_mut_lamports()? += _amount;
            ctx.accounts.safe_vault.pool_amount -= _amount;
            if ctx.accounts.safe_vault.pool_amount == 0 {
                ctx.accounts.safe_vault.pool_amount = min(DEFAULT_NEW_POOL_AMOUNT, ctx.accounts.safe_vault.to_account_info().get_lamports())
            }
        } else {
            let amount = if card_num == left_num || card_num == right_num {
                _amount * 2
            } else {
                _amount
            };
            let cpi_context = CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.player.to_account_info().clone(),
                    to: ctx.accounts.safe_vault.to_account_info().clone(),
                },
            );
            system_program::transfer(cpi_context, amount)?;
            ctx.accounts.safe_vault.pool_amount += amount / 100 * (ctx.accounts.safe_vault.reserve_rate as u64);
        }
        //Draw two pole
        new_mask = if new_mask.count_ones() < 32 {
            NEW_DECK
        } else {
            new_mask
        };
        let (left_pole, right_pole, new_mask) = draw_poles(seed, new_mask);
        ctx.accounts.shooting.last_card = card;
        ctx.accounts.shooting.left_pole = left_pole;
        ctx.accounts.shooting.right_pole = right_pole;
        ctx.accounts.shooting.deck = new_mask;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + 9,
        seeds = [b"safevault"],
        bump,
    )]
    pub safe_vault: Account<'info, SafeVault>,
    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + 11,
        seeds = [b"shooting"],
        bump,
    )]
    pub shooting: Account<'info, Shooting>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Draw<'info> {
    #[account(mut)]
    pub player: Signer<'info>,
    #[account(
        mut,
        seeds = [b"safevault"],
        bump,
    )]
    pub safe_vault: Account<'info, SafeVault>,
    #[account(
        mut,
        seeds = [b"shooting"],
        bump,
    )]
    pub shooting: Account<'info, Shooting>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Shooting {
    pub last_card: u8,
    pub left_pole: u8,
    pub right_pole: u8,
    pub deck: u64,
}

#[account]
pub struct SafeVault {
    pub reserve_rate: u8,
    pub pool_amount: u64,
}

#[error_code]
pub enum ShootingError {
    #[msg("Your wallet should have at least double than your bet")]
    NotEnoughBet,
    #[msg("You betting more than our pool")]
    NotEnoughFund,
}

pub fn draw_poles(seed: u64, mask: u64) -> (u8, u8, u64) {
    let (mut left_pole, new_mask) = rand_from_mask(seed, mask);
    let (mut right_pole, new_mask) = rand_from_mask(seed, new_mask);
    if left_pole > right_pole {
        mem::swap(&mut left_pole, &mut right_pole);
    }
    (left_pole, right_pole, new_mask)
}

pub fn rand_from_mask(seed: u64, mask: u64) -> (u8, u64) {
    let bitcount = mask.count_ones();
    let mut x = xorshift64(seed);
    x = x % (bitcount as u64);
    let mut i = 0;
    loop {
        if (mask & 1 << i) != 0 {
            if x == 0 {
                break;
            }
            x -= 1;
        }
        i += 1;
    }
    (i, mask & !(1 << i))
}

pub fn xorshift64(seed: u64) -> u64 {
    let mut x = seed;
    x ^= x << 13;
    x ^= x >> 7;
    x ^= x << 17;
    x
}
