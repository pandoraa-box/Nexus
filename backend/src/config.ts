import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  databaseUrl: process.env.DATABASE_URL || "postgres://nexus:nexus@localhost:5432/nexus",
  jwtSecret: process.env.JWT_SECRET || "nexus-dev-secret-change-in-production",
  adminUsername: process.env.ADMIN_USERNAME || "admin",
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || "",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  sorobanRpcUrl: process.env.SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org",
  nexusContractId: process.env.NEXUS_CONTRACT_ID || "",
  networkPassphrase: process.env.STELLAR_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015",
  horizonUrl: process.env.HORIZON_URL || "https://horizon-testnet.stellar.org",
  encryptionKey: process.env.ENCRYPTION_KEY || "",
  africastalking: {
    apiKey: process.env.AFRICASTALKING_API_KEY || "",
    username: process.env.AFRICASTALKING_USERNAME || "sandbox",
    sandbox: process.env.AFRICASTALKING_SANDBOX !== "false",
  },
};
