import { Router, Request, Response } from "express";
import { handleInput, getInitialSession, getContractErrorMessage } from "../ussd";
import { queryOne, query } from "../db";
import { UssdSession, User, Transaction } from "../types";
import { verifyPin, hashPin } from "../auth";
import { createWallet, getSecretKey, getWalletByPublicKey, getWalletById } from "../wallet";
import { callSend, callResolve } from "../soroban";
import { config } from "../config";

const router = Router();

const sessions = new Map<string, UssdSession>();

function getOrCreateSession(phone: string): UssdSession {
  if (!sessions.has(phone)) {
    sessions.set(phone, getInitialSession(phone));
  }
  return sessions.get(phone)!;
}

router.post("/ussd", async (req: Request, res: Response): Promise<void> => {
  const { phoneNumber, text, sessionId } = req.body;

  if (!phoneNumber) {
    res.json({ message: "END Missing phone number", end: true });
    return;
  }

  const session = getOrCreateSession(phoneNumber);
  const input = text || "";

  // Handle send confirmation synchronously
  if (session.state === "send_confirm" && input === "1") {
    try {
      const fromUser = await queryOne<User>("SELECT * FROM users WHERE phone = $1", [session.phone]);
      if (!fromUser) {
        res.json({ message: "END You are not registered. Please contact support.", end: true });
        sessions.delete(phoneNumber);
        return;
      }

      const toPhone = session.data.recipient!;
      const amountStroops = parseInt(session.data.amountStroops!, 10);

      const toUser = await queryOne<User>("SELECT * FROM users WHERE phone = $1", [toPhone]);
      if (!toUser) {
        res.json({ message: "END Recipient not found.", end: true });
        sessions.delete(phoneNumber);
        return;
      }

      const fromWallet = await getWalletById(fromUser.wallet_id);
      if (!fromWallet) {
        res.json({ message: "END Wallet error. Contact support.", end: true });
        sessions.delete(phoneNumber);
        return;
      }

      const secret = getSecretKey(fromWallet.encrypted_secret);
      const result = await callSend(secret, session.phone, toPhone, amountStroops);

      await query(
        `INSERT INTO transactions (from_phone, to_phone, amount_stroops, tx_hash, status) VALUES ($1, $2, $3, $4, $5)`,
        [session.phone, toPhone, amountStroops, result.hash, result.success ? "completed" : "failed"]
      );

      sessions.delete(phoneNumber);

      if (result.success) {
        res.json({
          message: `END Success! Sent ${session.data.amount} USDC to ${toPhone}. https://stellar.expert/explorer/testnet/tx/${result.hash}`,
          end: true,
        });
      } else {
        res.json({ message: "END Transaction failed on-chain.", end: true });
      }
    } catch (err: any) {
      sessions.delete(phoneNumber);
      const msg = getContractErrorMessage(err);
      await query(
        `INSERT INTO transactions (from_phone, to_phone, amount_stroops, status, error_message) VALUES ($1, $2, $3, 'failed', $4)`,
        [session.phone, session.data.recipient!, parseInt(session.data.amountStroops!, 10), err.message]
      );
      res.json({ message: msg, end: true });
    }
    return;
  }

  const response = handleInput(session, input);
  sessions.set(phoneNumber, response.session);

  if (response.end) {
    sessions.delete(phoneNumber);
  }

  res.json({ message: response.message, end: response.end });
});

export default router;
