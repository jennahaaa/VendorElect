"use client";

// Polyfill global for browser environment (required by @zama-fhe/relayer-sdk)
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).global = window;
}

import type { WalletClient } from "viem";

// Types from the SDK
type FhevmInstance = {
  createEncryptedInput: (contractAddress: string, userAddress: string) => RelayerEncryptedInput;
  generateKeypair: () => { publicKey: string; privateKey: string };
  createEIP712: (publicKey: string, contractAddresses: string[], startTimestamp: string | number, durationDays: string | number) => EIP712;
  publicDecrypt: (handles: (string | Uint8Array)[]) => Promise<Record<string, bigint | boolean | string>>;
  userDecrypt: (handles: HandleContractPair[], privateKey: string, publicKey: string, signature: string, contractAddresses: string[], userAddress: string, startTimestamp: string | number, durationDays: string | number) => Promise<Record<string, bigint | boolean | string>>;
  getPublicKey: () => { publicKeyId: string; publicKey: Uint8Array } | null;
};

type RelayerEncryptedInput = {
  addBool: (value: boolean | number | bigint) => RelayerEncryptedInput;
  add8: (value: number | bigint) => RelayerEncryptedInput;
  add16: (value: number | bigint) => RelayerEncryptedInput;
  add32: (value: number | bigint) => RelayerEncryptedInput;
  add64: (value: number | bigint) => RelayerEncryptedInput;
  encrypt: () => Promise<{ handles: Uint8Array[]; inputProof: Uint8Array }>;
};

type EIP712 = {
  domain: {
    chainId: number;
    name: string;
    verifyingContract: string;
    version: string;
  };
  message: any;
  primaryType: string;
  types: { [key: string]: { name: string; type: string }[] };
};

type HandleContractPair = {
  handle: Uint8Array | string;
  contractAddress: string;
};

// Singleton instance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let instance: any = null;
let initialized = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let initPromise: Promise<any> | null = null;

export interface FheClientConfig {
  chainId?: number;
  rpcUrl?: string;
}

export interface EncryptedData {
  handles: `0x${string}`[];
  inputProof: `0x${string}`;
}

/**
 * FHE Client - Wrapper for @zama-fhe/relayer-sdk
 * Simplifies encryption/decryption operations
 */
export const fheClient = {
  /**
   * Initialize the FHE SDK (client-side only)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async init(config?: FheClientConfig): Promise<any> {
    // Return existing instance if already initialized
    if (instance && initialized) {
      return instance;
    }

    // Return existing promise if initialization is in progress
    if (initPromise) {
      return initPromise;
    }

    // Only run on client
    if (typeof window === "undefined") {
      throw new Error("FHE SDK can only be initialized on the client side");
    }

    initPromise = (async () => {
      try {
        // Dynamic import to avoid SSR issues
        const { initSDK, createInstance, SepoliaConfig } = await import(
          "@zama-fhe/relayer-sdk/web"
        );

        // Initialize TFHE WASM
        await initSDK();

        // Create instance with Sepolia config
        // Use Alchemy RPC for Sepolia
        const rpcUrl = config?.rpcUrl || "https://eth-sepolia.g.alchemy.com/v2/xeMfJRSGpIGq5WiFz-bEiHoG6DGrZnAr";
        
        instance = await createInstance({
          ...SepoliaConfig,
          chainId: config?.chainId || 11155111,
          network: rpcUrl,
        });

        initialized = true;
        return instance!;
      } catch (error) {
        initPromise = null;
        throw error;
      }
    })();

    return initPromise;
  },

  /**
   * Get the current instance
   */
  getInstance(): FhevmInstance | null {
    return instance;
  },

  /**
   * Check if SDK is initialized
   */
  isInitialized(): boolean {
    return initialized && instance !== null;
  },

  /**
   * Convert Uint8Array to hex string
   */
  uint8ArrayToHex(arr: Uint8Array): `0x${string}` {
    return `0x${Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')}` as `0x${string}`;
  },

  /**
   * Convert Uint8Array to bytes32 hex (pad to 32 bytes)
   */
  uint8ArrayToBytes32(arr: Uint8Array): `0x${string}` {
    // Pad to 32 bytes if needed
    const padded = new Uint8Array(32);
    padded.set(arr.slice(0, 32), 32 - Math.min(arr.length, 32));
    return this.uint8ArrayToHex(padded);
  },

  /**
   * Encrypt multiple uint8 values
   */
  async encryptValues(
    contractAddress: `0x${string}`,
    userAddress: `0x${string}`,
    values: number[]
  ): Promise<EncryptedData> {
    const inst = await this.init();
    
    const input = inst.createEncryptedInput(contractAddress, userAddress);
    
    // Add each value as uint8
    values.forEach((value) => {
      input.add8(value);
    });

    const encrypted = await input.encrypt();

    console.log("Encrypted handles count:", encrypted.handles.length);
    console.log("First handle length:", encrypted.handles[0]?.length);
    console.log("Input proof length:", encrypted.inputProof.length);

    // Convert Uint8Array to hex strings
    // Handles are already bytes32, just convert to hex
    return {
      handles: encrypted.handles.map((h) => this.uint8ArrayToHex(h)),
      inputProof: this.uint8ArrayToHex(encrypted.inputProof),
    };
  },

  /**
   * Create EIP712 signature data for user decryption
   */
  createEIP712ForDecrypt(
    publicKey: string,
    contractAddresses: string[],
    startTimestamp: number = Math.floor(Date.now() / 1000),
    durationDays: number = 1
  ): EIP712 | null {
    if (!instance) return null;
    return instance.createEIP712(
      publicKey,
      contractAddresses,
      startTimestamp,
      durationDays
    );
  },

  /**
   * Generate a keypair for user decryption
   */
  generateKeypair(): { publicKey: string; privateKey: string } | null {
    if (!instance) return null;
    return instance.generateKeypair();
  },

  /**
   * Public decryption (no signature required)
   */
  async publicDecrypt(handles: `0x${string}`[]): Promise<Record<string, bigint | boolean | string>> {
    const inst = await this.init();
    return inst.publicDecrypt(handles);
  },

  /**
   * User decryption with EIP712 signature
   */
  async userDecrypt(
    handles: Array<{ handle: `0x${string}`; contractAddress: `0x${string}` }>,
    privateKey: string,
    publicKey: string,
    signature: string,
    contractAddresses: string[],
    userAddress: string,
    startTimestamp: number = Math.floor(Date.now() / 1000),
    durationDays: number = 1
  ): Promise<Record<string, bigint | boolean | string>> {
    const inst = await this.init();
    return inst.userDecrypt(
      handles,
      privateKey,
      publicKey,
      signature,
      contractAddresses,
      userAddress,
      startTimestamp,
      durationDays
    );
  },

  /**
   * Sign EIP712 data using wallet client
   */
  async signEIP712(
    walletClient: WalletClient,
    eip712Data: EIP712
  ): Promise<string> {
    const signature = await walletClient.signTypedData({
      domain: eip712Data.domain as any,
      types: eip712Data.types,
      primaryType: eip712Data.primaryType,
      message: eip712Data.message,
    });
    return signature;
  },
};

export default fheClient;
