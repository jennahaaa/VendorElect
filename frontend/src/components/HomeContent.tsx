"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useWalletClient } from "wagmi";
import { HeroSection } from "@/components/HeroSection";
import { ResultSection } from "@/components/ResultSection";
import { CONTRACT_ADDRESS } from "@/lib/wagmi";
import { VendorElectABI } from "@/lib/abi";
import { INDICATORS } from "@/lib/constants";
import { fheClient } from "@/lib/fheClient";

// Two-step flow: Submit → Decrypt
type FlowStep = "select" | "submitted" | "result";

export function HomeContent() {
  const [mounted, setMounted] = useState(false);
  const [flowStep, setFlowStep] = useState<FlowStep>("select");
  const [selections, setSelections] = useState<Record<string, number | null>>({});
  const [status, setStatus] = useState("");
  const [txHash, setTxHash] = useState("");
  const [currentAction, setCurrentAction] = useState<"submit" | "decrypt" | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [resultData, setResultData] = useState<{
    overallGrade: number;
    itemGrades: Record<string, number>;
    timestamp: number;
  } | null>(null);

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Mark as mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // For submit transaction
  const { writeContract, isPending: isWriting, data: writeData, reset: resetWrite, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  // Read if user has rating
  const { refetch: refetchHasRating } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VendorElectABI,
    functionName: "hasRating",
    account: address,
  });

  // Read timestamp
  const { refetch: refetchTimestamp } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VendorElectABI,
    functionName: "getRatingTimestamp",
    account: address,
  });

  // Read overall grade (encrypted handle)
  const { refetch: refetchOverallGrade } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VendorElectABI,
    functionName: "getOverallGrade",
    account: address,
    query: { enabled: false },
  });

  // Read item grades (encrypted handles)
  const { refetch: refetchItemGrades } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VendorElectABI,
    functionName: "getItemGrades",
    account: address,
    query: { enabled: false },
  });

  // Initialize FHE SDK on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      fheClient.init({ chainId: 11155111 }).catch(console.error);
    }
  }, []);

  // Scroll to indicators section
  const handleStart = useCallback(() => {
    setTimeout(() => {
      document.getElementById("indicators")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  // Select indicator
  const handleSelect = useCallback((indicatorId: string, value: number) => {
    setSelections((prev) => ({ ...prev, [indicatorId]: value }));
  }, []);

  // Step 1: Encrypt, Submit, and Calculate (single transaction)
  const handleSubmit = useCallback(async () => {
    if (!address || !isConnected) return;

    try {
      setCurrentAction("submit");
      setStatus("Initializing FHE encryption...");
      
      await fheClient.init({ chainId: 11155111 });
      
      const values = INDICATORS.map((ind) => selections[ind.id] ?? 0);
      console.log("Values to encrypt:", values);
      
      setStatus("Encrypting data with FHE...");
      const { handles, inputProof } = await fheClient.encryptValues(
        CONTRACT_ADDRESS,
        address,
        values
      );

      console.log("Encrypted handles:", handles);
      console.log("Input proof:", inputProof);

      setStatus("Submitting encrypted data to blockchain...");
      
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: VendorElectABI,
        functionName: "submitAndCalculate",
        args: [
          handles[0],
          handles[1],
          handles[2],
          handles[3],
          handles[4],
          handles[5],
          inputProof,
        ],
      });
    } catch (error: any) {
      console.error("Submit error:", error);
      setStatus(`Error: ${error?.message || "Encryption failed"}`);
      setCurrentAction(null);
    }
  }, [address, isConnected, selections, writeContract]);

  // Step 2: Decrypt result from chain using user signature
  const handleDecrypt = useCallback(async () => {
    if (!address || !walletClient) {
      setStatus("Error: Wallet not connected");
      return;
    }

    try {
      setCurrentAction("decrypt");
      setIsDecrypting(true);
      setStatus("Reading encrypted result from blockchain...");
      
      // Check if rating exists
      const { data: hasRating } = await refetchHasRating();
      if (!hasRating) {
        setStatus("Error: No rating found");
        setIsDecrypting(false);
        setCurrentAction(null);
        return;
      }

      // Get encrypted handles from chain
      setStatus("Fetching encrypted handles...");
      const { data: gradeHandle } = await refetchOverallGrade();
      const { data: itemHandles } = await refetchItemGrades();
      
      console.log("Overall grade handle:", gradeHandle);
      console.log("Item grade handles:", itemHandles);

      if (!gradeHandle || !itemHandles) {
        setStatus("Error: Failed to fetch encrypted data");
        setIsDecrypting(false);
        setCurrentAction(null);
        return;
      }

      // Convert handles to hex strings for SDK
      const gradeHandleHex = `0x${BigInt(gradeHandle).toString(16).padStart(64, '0')}` as `0x${string}`;
      const itemHandlesHex = ([...itemHandles] as bigint[]).map(
        h => `0x${BigInt(h).toString(16).padStart(64, '0')}` as `0x${string}`
      );

      console.log("Grade handle hex:", gradeHandleHex);
      console.log("Item handles hex:", itemHandlesHex);

      // Generate keypair for decryption
      setStatus("Generating decryption keypair...");
      const keypair = fheClient.generateKeypair();
      if (!keypair) {
        throw new Error("Failed to generate keypair");
      }
      console.log("Generated keypair, public key length:", keypair.publicKey.length);

      // Create EIP-712 signature data
      setStatus("Preparing decryption authorization...");
      const startTimestamp = Math.floor(Date.now() / 1000);
      const durationDays = 1;
      const eip712Data = fheClient.createEIP712ForDecrypt(
        keypair.publicKey,
        [CONTRACT_ADDRESS],
        startTimestamp,
        durationDays
      );
      
      if (!eip712Data) {
        throw new Error("Failed to create EIP-712 data");
      }
      console.log("EIP-712 data created:", eip712Data);

      // Request user signature
      setStatus("Please sign to authorize decryption...");
      const signature = await fheClient.signEIP712(walletClient, eip712Data);
      console.log("User signature obtained:", signature.slice(0, 20) + "...");

      // Prepare handles for userDecrypt
      setStatus("Decrypting with FHE (this may take a moment)...");
      const handlesWithContract = [
        { handle: gradeHandleHex, contractAddress: CONTRACT_ADDRESS },
        ...itemHandlesHex.map(h => ({ handle: h, contractAddress: CONTRACT_ADDRESS }))
      ];

      // Call userDecrypt
      const decrypted = await fheClient.userDecrypt(
        handlesWithContract,
        keypair.privateKey,
        keypair.publicKey,
        signature,
        [CONTRACT_ADDRESS],
        address,
        startTimestamp,
        durationDays
      );
      
      console.log("Decrypted values:", decrypted);

      // Parse decrypted results
      const overallGrade = Number(decrypted[gradeHandleHex] ?? 2);
      const itemGrades: Record<string, number> = {};
      
      INDICATORS.forEach((ind, idx) => {
        itemGrades[ind.id] = Number(decrypted[itemHandlesHex[idx]] ?? 0);
      });

      // Get timestamp
      const { data: ts } = await refetchTimestamp();
      
      setResultData({
        overallGrade,
        itemGrades,
        timestamp: Number(ts) || Math.floor(Date.now() / 1000),
      });
      
      setFlowStep("result");
      setStatus("");
      setCurrentAction(null);
      setIsDecrypting(false);
      
      setTimeout(() => {
        document.getElementById("result")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error: any) {
      console.error("Decrypt error:", error);
      const errorMsg = error?.message || "Decryption failed";
      const isUserRejection = errorMsg.toLowerCase().includes("user rejected") || 
                              errorMsg.toLowerCase().includes("user denied") ||
                              errorMsg.toLowerCase().includes("rejected");
      
      // If user rejected, reset to select step; otherwise stay on submitted step with error
      if (isUserRejection) {
        setFlowStep("select");
        setStatus("");
        setTxHash("");
      } else {
        setStatus(`Decrypt Error: ${errorMsg.slice(0, 100)}`);
      }
      setCurrentAction(null);
      setIsDecrypting(false);
    }
  }, [address, walletClient, refetchHasRating, refetchOverallGrade, refetchItemGrades, refetchTimestamp]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && writeData && currentAction === "submit") {
      setTxHash(writeData);
      setFlowStep("submitted");
      setStatus("✓ Rating submitted & calculated! Ready to decrypt.");
      setCurrentAction(null);
    }
  }, [isConfirmed, writeData, currentAction]);

  // Handle wallet rejection / transaction error - reset to initial state
  useEffect(() => {
    if (writeError || confirmError) {
      const errorMsg = writeError?.message || confirmError?.message || "";
      // Check if user rejected the transaction
      const isUserRejection = errorMsg.toLowerCase().includes("user rejected") || 
                              errorMsg.toLowerCase().includes("user denied") ||
                              errorMsg.toLowerCase().includes("rejected");
      
      console.log("Transaction error:", errorMsg);
      
      // Reset to initial state
      setFlowStep("select");
      setStatus(isUserRejection ? "" : `Error: ${errorMsg.slice(0, 100)}`);
      setCurrentAction(null);
      setIsDecrypting(false);
      resetWrite();
    }
  }, [writeError, confirmError, resetWrite]);

  // Reset
  const handleReset = useCallback(() => {
    setSelections({});
    setResultData(null);
    setTxHash("");
    setFlowStep("select");
    setStatus("");
    setCurrentAction(null);
    setIsDecrypting(false);
    resetWrite();
    setTimeout(() => {
      document.getElementById("indicators")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [resetWrite]);

  const isProcessing = isWriting || isConfirming || isDecrypting;
  const currentStatusText = isWriting
    ? "Waiting for wallet confirmation..."
    : isConfirming
    ? "Transaction confirming on-chain..."
    : status;

  return (
    <main className="min-h-screen">
      <HeroSection onStart={handleStart} />
      
      {/* Indicator Selection */}
      <section id="indicators" className="min-h-screen py-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-[var(--primary)] mb-4">
              Select Rating Indicators
            </h2>
            <p className="text-[var(--text-muted)] font-lora">
              Please select one tier for each of the 6 indicators below
            </p>
          </div>

          {/* Indicators Grid */}
          <div className="space-y-10">
            {INDICATORS.map((indicator, index) => (
              <div
                key={indicator.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm font-medium text-[var(--accent)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-xl font-semibold text-[var(--primary)]">
                    {indicator.name}
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-[var(--primary)]/20 to-transparent" />
                </div>

                <div className={`grid gap-4 ${indicator.options.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {indicator.options.map((option) => {
                    const isSelected = selections[indicator.id] === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleSelect(indicator.id, option.value)}
                        disabled={flowStep !== "select"}
                        className={`option-card relative p-6 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? "selected border-[var(--accent)]"
                            : "border-transparent hover:border-[var(--primary)]/30"
                        } ${flowStep !== "select" ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <div className={`grade-badge mb-3 ${
                          option.grade === "A" ? "grade-a" :
                          option.grade === "B" ? "grade-b" :
                          option.grade === "C" ? "grade-c" :
                          option.grade === "✓" ? "bg-emerald-500 text-white" :
                          "bg-red-500 text-white"
                        }`}>
                          {option.grade}
                        </div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {option.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-16">
            {/* Step 1: Encrypt & Submit (single transaction) */}
            {flowStep === "select" && (
              <div className="text-center">
                <button
                  onClick={handleSubmit}
                  disabled={!mounted || !isConnected || !INDICATORS.every(ind => selections[ind.id] !== null && selections[ind.id] !== undefined) || isProcessing}
                  className="btn-primary inline-flex items-center justify-center gap-3 px-10 py-4 rounded-xl text-white font-cinzel font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed min-w-[280px]"
                >
                  {isProcessing && currentAction === "submit" ? (
                    <>
                      <div className="loading-spinner" />
                      <span className="text-sm">{currentStatusText || "Processing..."}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Encrypt & Submit
                    </>
                  )}
                </button>
                {mounted && !isConnected && (
                  <p className="mt-4 text-sm text-[var(--text-muted)]">Connect wallet to submit</p>
                )}
                {/* Error display only */}
                {currentStatusText && currentAction === "submit" && currentStatusText.startsWith("Error") && (
                  <div className="mt-4 text-center p-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">
                    {currentStatusText}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Decrypt */}
            {flowStep === "submitted" && (
              <div className="text-center">
                {/* Success status */}
                {currentStatusText && currentStatusText.startsWith("✓") && (
                  <div className="mb-4 p-3 rounded-xl text-sm bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {currentStatusText}
                  </div>
                )}
                {txHash && (
                  <a 
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors mb-4"
                  >
                    <span>TX:</span>
                    <span className="text-[var(--accent)] font-mono">
                      {txHash.slice(0, 10)}...{txHash.slice(-8)}
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
                <div>
                  <button
                    onClick={handleDecrypt}
                    disabled={isProcessing}
                    className="btn-primary inline-flex items-center justify-center gap-3 px-10 py-4 rounded-xl text-white font-cinzel font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed min-w-[280px]"
                  >
                    {isDecrypting ? (
                      <>
                        <div className="loading-spinner" />
                        <span className="text-sm">{currentStatusText || "Decrypting..."}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                        </svg>
                        Decrypt Result
                      </>
                    )}
                  </button>
                </div>
                {/* Error display only */}
                {currentStatusText && currentAction === "decrypt" && (currentStatusText.startsWith("Error") || currentStatusText.startsWith("Decrypt Error")) && (
                  <div className="mt-4 p-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">
                    {currentStatusText}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Result Section */}
      {flowStep === "result" && resultData && (
        <ResultSection
          overallGrade={resultData.overallGrade}
          itemGrades={resultData.itemGrades}
          txHash={txHash}
          timestamp={resultData.timestamp}
          onReset={handleReset}
        />
      )}
    </main>
  );
}

