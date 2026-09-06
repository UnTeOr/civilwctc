import { useState, useEffect, useCallback } from "react";

interface SolanaWallet {
  publicKey: string | null;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array | null>;
}

interface SolanaProvider {
  publicKey?: { toString(): string } | null;
  isConnected?: boolean;
  connect(): Promise<{ publicKey: { toString(): string } }>;
  disconnect(): Promise<void>;
  signMessage?(message: Uint8Array): Promise<{ signature: Uint8Array }>;
  on(event: string, handler: (...args: any[]) => void): void;
  off(event: string, handler: (...args: any[]) => void): void;
}

function getProvider(): SolanaProvider | null {
  if (typeof window === "undefined") return null;
  const anyWindow = window as any;
  const provider = anyWindow?.phantom?.solana || anyWindow?.solana;
  if (provider?.isPhantom || provider?.isSolflare) return provider;
  return null;
}

export function useSolanaWallet(): SolanaWallet {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const refresh = useCallback(() => {
    const provider = getProvider();
    if (provider?.publicKey) {
      setPublicKey(provider.publicKey.toString());
    } else {
      setPublicKey(null);
    }
  }, []);

  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;
    refresh();
    const onConnect = () => refresh();
    const onDisconnect = () => setPublicKey(null);
    provider.on("connect", onConnect);
    provider.on("disconnect", onDisconnect);
    return () => {
      provider.off("connect", onConnect);
      provider.off("disconnect", onDisconnect);
    };
  }, [refresh]);

  const connect = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      window.open("https://phantom.app", "_blank");
      return;
    }
    setConnecting(true);
    try {
      const resp = await provider.connect();
      setPublicKey(resp.publicKey.toString());
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    const provider = getProvider();
    if (!provider) return;
    await provider.disconnect();
    setPublicKey(null);
  }, []);

  const signMessage = useCallback(async (message: Uint8Array): Promise<Uint8Array | null> => {
    const provider = getProvider();
    if (!provider || !provider.signMessage) return null;
    try {
      const { signature } = await provider.signMessage(message);
      return signature;
    } catch {
      return null;
    }
  }, []);

  return {
    publicKey,
    connected: !!publicKey,
    connecting,
    connect,
    disconnect,
    signMessage,
  };
}
