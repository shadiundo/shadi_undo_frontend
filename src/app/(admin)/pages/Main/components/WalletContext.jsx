import React, { createContext, useContext, useEffect, useState } from "react";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchWallet() {
    const token = localStorage.getItem("token");
    if (!token) {
      setWallet(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        import.meta.env.VITE_API_URL + "/api/profile/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();
      if (json?.success) {
        setWallet(json.data.wallet || null);
      }
    } catch (err) {
      console.error("Wallet fetch failed", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWallet();
  }, []);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        loading,
        refreshWallet: fetchWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
