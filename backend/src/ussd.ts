import { UssdSession } from "./types";

const USDC_STROOPS = 10_000_000; // 1 USDC = 10^7 stroops

export interface UssdResponse {
  message: string;
  end: boolean;
  session: UssdSession;
}

export function getInitialSession(phone: string): UssdSession {
  return { phone, state: "menu", data: {} };
}

export function handleInput(session: UssdSession, input: string): UssdResponse {
  switch (session.state) {
    case "menu":
      return handleMenu(session, input);
    case "send_recipient":
      return handleSendRecipient(session, input);
    case "send_amount":
      return handleSendAmount(session, input);
    case "send_confirm":
      return handleSendConfirm(session, input);
    case "balance":
      return handleBalance(session);
    case "wallet_info":
      return handleWalletInfo(session);
    default:
      return {
        message: "END Invalid state. Please dial again.",
        end: true,
        session: getInitialSession(session.phone),
      };
  }
}

function handleMenu(session: UssdSession, input: string): UssdResponse {
  // First-time entry or returning from another flow
  if (!input || input === "") {
    return {
      message: `CON Welcome to Nexus
1. Send Money
2. Check Balance
3. My Wallet`,
      end: false,
      session: { ...session, state: "menu" },
    };
  }

  switch (input) {
    case "1":
      return {
        message: "CON Enter recipient phone number:",
        end: false,
        session: { ...session, state: "send_recipient" },
      };
    case "2":
      return {
        message: `CON Enter your PIN to check balance:`,
        end: false,
        session: { ...session, state: "balance" },
      };
    case "3":
      return handleWalletInfo(session);
    default:
      return {
        message: "CON Invalid option. Choose:\n1. Send Money\n2. Check Balance\n3. My Wallet",
        end: false,
        session: { ...session, state: "menu" },
      };
  }
}

function handleSendRecipient(session: UssdSession, input: string): UssdResponse {
  // Basic phone validation (234xxxxxxxxx)
  if (!/^234\d{10}$/.test(input)) {
    return {
      message: "CON Invalid phone. Enter a valid phone (2348012345678):",
      end: false,
      session: { ...session, state: "send_recipient" },
    };
  }
  return {
    message: "CON Enter amount (in USDC):",
    end: false,
    session: {
      ...session,
      state: "send_amount",
      data: { ...session.data, recipient: input },
    },
  };
}

function handleSendAmount(session: UssdSession, input: string): UssdResponse {
  const amount = parseFloat(input);
  if (isNaN(amount) || amount <= 0 || amount > 1000) {
    return {
      message: "CON Invalid amount (max 1,000 USDC). Enter amount:",
      end: false,
      session: { ...session, state: "send_amount" },
    };
  }
  const amountStroops = Math.round(amount * (USDC_STROOPS / 1));
  return {
    message: `CON Send ${amount} USDC to ${session.data.recipient}?
1. Confirm
2. Cancel`,
    end: false,
    session: {
      ...session,
      state: "send_confirm",
      data: { ...session.data, amount: amount.toString(), amountStroops: amountStroops.toString() },
    },
  };
}

function handleSendConfirm(session: UssdSession, input: string): UssdResponse {
  if (input === "1") {
    // The actual send happens via the API route handler
    return {
      message: `END Your transaction is being processed. You will receive a confirmation shortly.`,
      end: true,
      session: getInitialSession(session.phone),
    };
  }
  return {
    message: "END Transaction cancelled.",
    end: true,
    session: getInitialSession(session.phone),
  };
}

function handleBalance(_session: UssdSession): UssdResponse {
  return {
    message: `END Your balance check is being processed. You will receive an SMS shortly.`,
    end: true,
    session: getInitialSession(_session.phone),
  };
}

function handleWalletInfo(session: UssdSession): UssdResponse {
  return {
    message: "END Your wallet info will be sent via SMS.",
    end: true,
    session: getInitialSession(session.phone),
  };
}

export function getContractErrorMessage(error: unknown): string {
  const msg = String(error);
  if (msg.includes("NotRegistered")) return "END Recipient not registered on Nexus.";
  if (msg.includes("AlreadyRegistered")) return "END Phone already registered.";
  if (msg.includes("Paused")) return "END Nexus is temporarily unavailable.";
  if (msg.includes("DailyLimitExceeded")) return "END Daily send limit exceeded (max 1,000 USDC).";
  if (msg.includes("InvalidAmount")) return "END Invalid amount.";
  return "END An error occurred. Please try again.";
}
