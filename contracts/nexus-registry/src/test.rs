#![cfg(test)]

extern crate std;

use crate::{NexusRegistry, NexusRegistryClient};
use soroban_sdk::{testutils::Address as _, Address, Env, String as SorobanString};

fn setup_test() -> (Env, Address, NexusRegistryClient<'static>) {
    let env = Env::default();
    let admin = Address::generate(&env);
    let contract_id = env.register_contract(None, NexusRegistry);
    let client = NexusRegistryClient::new(&env, &contract_id);

    client.init(&admin);
    (env, admin, client)
}

fn phone(env: &Env, s: &str) -> SorobanString {
    SorobanString::from_str(env, s)
}

#[test]
fn test_init_and_pause() {
    let (env, admin, client) = setup_test();

    assert!(!client.is_paused());
    client.set_paused(&admin, &true);
    assert!(client.is_paused());
    client.set_paused(&admin, &false);
    assert!(!client.is_paused());
}

#[test]
fn test_register_and_resolve() {
    let (env, _admin, client) = setup_test();
    let user = Address::generate(&env);
    let p = phone(&env, "2348012345678");

    client.register(&user, &p);
    let resolved = client.resolve(&p);
    assert_eq!(resolved, user);
}

#[test]
fn test_register_duplicate_panics() {
    let (env, _admin, client) = setup_test();
    let user = Address::generate(&env);
    let p = phone(&env, "2348012345678");

    client.register(&user, &p);
    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        client.register(&user, &p);
    }));
    assert!(result.is_err());
}

#[test]
fn test_resolve_unregistered_panics() {
    let (env, _admin, client) = setup_test();
    let p = phone(&env, "2348012345678");

    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        client.resolve(&p);
    }));
    assert!(result.is_err());
}

#[test]
fn test_send() {
    let (env, _admin, client) = setup_test();
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let alice_phone = phone(&env, "2348012340001");
    let bob_phone = phone(&env, "2348012340002");

    client.register(&alice, &alice_phone);
    client.register(&bob, &bob_phone);

    client.send(&alice, &bob_phone, &100_0000000);
}

#[test]
fn test_send_exceeds_daily_limit() {
    let (env, _admin, client) = setup_test();
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let alice_phone = phone(&env, "2348012340001");
    let bob_phone = phone(&env, "2348012340002");

    client.register(&alice, &alice_phone);
    client.register(&bob, &bob_phone);

    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        client.send(&alice, &bob_phone, &2000_0000000i128);
    }));
    assert!(result.is_err());
}

#[test]
fn test_send_when_paused_panics() {
    let (env, admin, client) = setup_test();
    client.set_paused(&admin, &true);

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let alice_phone = phone(&env, "2348012340001");
    let bob_phone = phone(&env, "2348012340002");

    client.register(&alice, &alice_phone);
    client.register(&bob, &bob_phone);

    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        client.send(&alice, &bob_phone, &100_0000000i128);
    }));
    assert!(result.is_err());
}

#[test]
fn test_is_paused() {
    let (env, admin, client) = setup_test();
    assert!(!client.is_paused());
    client.set_paused(&admin, &true);
    assert!(client.is_paused());
}
