#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, panic_with_error,
    Address, Env, String as SorobanString, Symbol,
};

const DAILY_LIMIT: i128 = 1000_0000000;
const DAY_SECS: u64 = 86400;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum NexusError {
    NotRegistered = 1,
    AlreadyRegistered = 2,
    Paused = 3,
    DailyLimitExceeded = 4,
    InvalidAmount = 5,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Paused,
    PhoneToAddress(SorobanString),
    DailyLimit(Address),
    LastResetDay(Address),
}

#[contract]
pub struct NexusRegistry;

#[contractimpl]
impl NexusRegistry {
    pub fn init(env: Env, admin: Address) {
        env.storage().persistent().set(&DataKey::Admin, &admin);
        env.storage().persistent().set(&DataKey::Paused, &false);
    }

    pub fn set_paused(env: Env, paused: bool) {
        let admin: Address = env
            .storage()
            .persistent()
            .get(&DataKey::Admin)
            .expect("not initialized");
        admin.require_auth();
        env.storage().persistent().set(&DataKey::Paused, &paused);
    }

    pub fn register(env: Env, phone: SorobanString, address: Address) {
        if env
            .storage()
            .persistent()
            .get::<_, bool>(&DataKey::Paused)
            .unwrap_or(false)
        {
            panic_with_error!(&env, NexusError::Paused);
        }

        let key = DataKey::PhoneToAddress(phone.clone());
        if env.storage().persistent().has(&key) {
            panic_with_error!(&env, NexusError::AlreadyRegistered);
        }

        address.require_auth();
        env.storage().persistent().set(&key, &address);
    }

    pub fn resolve(env: Env, phone: SorobanString) -> Address {
        let key = DataKey::PhoneToAddress(phone);
        env.storage()
            .persistent()
            .get(&key)
            .unwrap_or_else(|| panic_with_error!(&env, NexusError::NotRegistered))
    }

    pub fn is_paused(env: Env) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::Paused)
            .unwrap_or(false)
    }

    pub fn send(env: Env, from: Address, phone: SorobanString, amount: i128) {
        if env
            .storage()
            .persistent()
            .get::<_, bool>(&DataKey::Paused)
            .unwrap_or(false)
        {
            panic_with_error!(&env, NexusError::Paused);
        }

        from.require_auth();

        if amount <= 0 || amount > DAILY_LIMIT {
            panic_with_error!(&env, NexusError::InvalidAmount);
        }

        let _to = Self::resolve(env.clone(), phone.clone());

        let current_day = env.ledger().timestamp() / DAY_SECS;
        let last_day: u64 = env
            .storage()
            .persistent()
            .get(&DataKey::LastResetDay(from.clone()))
            .unwrap_or(0);

        let used: i128 = if last_day >= current_day {
            env.storage()
                .persistent()
                .get(&DataKey::DailyLimit(from.clone()))
                .unwrap_or(0)
        } else {
            env.storage()
                .persistent()
                .set(&DataKey::LastResetDay(from.clone()), &current_day);
            env.storage()
                .persistent()
                .set(&DataKey::DailyLimit(from.clone()), &0i128);
            0
        };

        let new_used = used + amount;
        if new_used > DAILY_LIMIT {
            panic_with_error!(&env, NexusError::DailyLimitExceeded);
        }

        env.storage()
            .persistent()
            .set(&DataKey::DailyLimit(from.clone()), &new_used);

        env.events().publish(
            (Symbol::new(&env, "sent"), from),
            (phone, amount, current_day),
        );
    }
}

#[cfg(all(test, feature = "testutils"))]
mod test;
