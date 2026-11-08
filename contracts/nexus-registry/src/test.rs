#![cfg(test)]

extern crate std;

use crate::{NexusRegistry, NexusRegistryClient};
use soroban_sdk::{
    testutils::Address as _, testutils::Events as _, Address, Env,
    String as SorobanString, Symbol, TryFromVal,
};

fn setup_test() -> (Env, Address, NexusRegistryClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();
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
    let (_env, _admin, client) = setup_test();

    assert!(!client.is_paused());
    client.set_paused(&true);
    assert!(client.is_paused());
    client.set_paused(&false);
    assert!(!client.is_paused());
}

#[test]
fn test_register_and_resolve() {
    let (env, _admin, client) = setup_test();
    let user = Address::generate(&env);
    let p = phone(&env, "2348012345678");

    client.register(&p, &user);
    let resolved = client.resolve(&p);
    assert_eq!(resolved, user);
}

#[test]
fn test_register_duplicate_panics() {
    let (env, _admin, client) = setup_test();
    let user = Address::generate(&env);
    let p = phone(&env, "2348012345678");

    client.register(&p, &user);
    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        client.register(&p, &user);
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

    client.register(&alice_phone, &alice);
    client.register(&bob_phone, &bob);

    let amount = 100_0000000i128;
    client.send(&alice, &bob_phone, &amount);

    let events = env.events().all();
    assert!(!events.events().is_empty(), "expected at least one event");

    let event = events.events().last().expect("expected event");
    match &event.body {
        soroban_sdk::xdr::ContractEventBody::V0(v0) => {
            let topic0 = Symbol::try_from_val(&env, &v0.topics[0]).unwrap();
            assert_eq!(topic0, Symbol::new(&env, "sent"));
            let topic1 = Address::try_from_val(&env, &v0.topics[1]).unwrap();
            assert_eq!(topic1, alice);

            let data_val = soroban_sdk::Val::try_from_val(&env, &v0.data).unwrap();
            let (emitted_phone, emitted_amount, emitted_day): (SorobanString, i128, u64) =
                <(SorobanString, i128, u64)>::try_from_val(&env, &data_val).unwrap();
            assert_eq!(emitted_phone, bob_phone);
            assert_eq!(emitted_amount, amount);
            let expected_day = env.ledger().timestamp() / 86400;
            assert_eq!(emitted_day, expected_day);
        }
    }
}

#[test]
fn test_send_exceeds_daily_limit() {
    let (env, _admin, client) = setup_test();
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let alice_phone = phone(&env, "2348012340001");
    let bob_phone = phone(&env, "2348012340002");

    client.register(&alice_phone, &alice);
    client.register(&bob_phone, &bob);

    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        client.send(&alice, &bob_phone, &2000_0000000i128);
    }));
    assert!(result.is_err());
}

#[test]
fn test_send_when_paused_panics() {
    let (env, _admin, client) = setup_test();

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let alice_phone = phone(&env, "2348012340001");
    let bob_phone = phone(&env, "2348012340002");

    client.register(&alice_phone, &alice);
    client.register(&bob_phone, &bob);

    client.set_paused(&true);

    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        client.send(&alice, &bob_phone, &100_0000000i128);
    }));
    assert!(result.is_err());
}

#[test]
fn test_is_paused() {
    let (_env, _admin, client) = setup_test();
    assert!(!client.is_paused());
    client.set_paused(&true);
    assert!(client.is_paused());
}
