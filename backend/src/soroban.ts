import {
  Contract, Keypair, Address,
  nativeToScVal, scValToNative, xdr,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { Server, Api } from "@stellar/stellar-sdk/rpc";
import { config } from "./config";

let rpcServer: Server | null = null;
let contract: Contract | null = null;

export function getRpcServer(): Server {
  if (!rpcServer) {
    rpcServer = new Server(config.sorobanRpcUrl);
  }
  return rpcServer;
}

export function getContract(): Contract {
  if (!contract) {
    if (!config.nexusContractId) {
      throw new Error("NEXUS_CONTRACT_ID not configured");
    }
    contract = new Contract(config.nexusContractId);
  }
  return contract;
}

export function phoneToScVal(phone: string): xdr.ScVal {
  return nativeToScVal(phone, { type: "string" });
}

export function amountToScVal(amount: number): xdr.ScVal {
  return nativeToScVal(amount.toString(), { type: "i128" });
}

const dummyAccount = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

export async function callResolve(phone: string): Promise<string> {
  const server = getRpcServer();
  const c = getContract();

  const tx = new TransactionBuilder(
    { accountId: () => dummyAccount, sequenceNumber: () => "0" } as any,
    { fee: "100", networkPassphrase: config.networkPassphrase }
  )
    .addOperation(c.call("resolve", phoneToScVal(phone)))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!Api.isSimulationSuccess(sim) || !sim.result) {
    throw new Error("Resolve simulation failed");
  }
  return scValToNative(sim.result.retval) as string;
}

export interface SendResult {
  hash: string;
  success: boolean;
}

export async function callSend(
  sourceSecret: string,
  fromPhone: string,
  toPhone: string,
  amountStroops: number
): Promise<SendResult> {
  const kp = Keypair.fromSecret(sourceSecret);
  const server = getRpcServer();
  const c = getContract();

  const account = await server.getAccount(kp.publicKey());

  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      c.call(
        "send",
        Address.fromString(kp.publicKey()).toScVal(),
        phoneToScVal(toPhone),
        amountToScVal(amountStroops)
      )
    )
    .setTimeout(30)
    .build();

  const preparedTx = await server.prepareTransaction(tx);
  (preparedTx as any).sign(kp);
  const result = await server.sendTransaction(preparedTx as any);
  const hash = result.hash;

  for (let i = 0; i < 30; i++) {
    const getResult = await server.getTransaction(hash);
    if (getResult.status === "SUCCESS") {
      return { hash, success: true };
    }
    if (getResult.status === "FAILED") {
      return { hash, success: false };
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  return { hash, success: false };
}
