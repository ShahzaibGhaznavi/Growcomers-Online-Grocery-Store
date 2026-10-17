
import React, { useState } from "react";
import { metamask } from "../../../../assets";
import getContractProcessor from "../../../../utils/SmartContractProcessors";

const CryptoPayment = ({
  setPaymentProcessor,
  setDaiProcessor,
  paymentValidated,
  setPaymentValidated,
  inrValue,
}) => {
  const [error, setError] = useState("");

  const validRate = Number.isFinite(Number(inrValue)) && Number(inrValue) > 0;

  const handleConnectToMetamask = async () => {
    try {
      setError("");

      if (!validRate) {
        setError(
          "The live DAI/INR exchange rate is unavailable. Please try again later."
        );
        return;
      }

      const { paymentProcessor, daiProcessor } =
        await getContractProcessor();

      setPaymentProcessor(paymentProcessor);
      setDaiProcessor(daiProcessor);
      setPaymentValidated(true);
    } catch (err) {
      setError(err.message || "Unable to connect to MetaMask.");
      console.error("MetaMask connection failed:", err);
    }
  };

  return (
    <div className="w-full p-6 flex flex-col gap-3">
      {error && (
        <div>
          <p className="text-red-500 font-medium">ERROR: {error}</p>
          <p className="text-sm text-textDim">
            Check MetaMask and your network, then try again.
          </p>
        </div>
      )}

      {!validRate && (
        <p className="text-red-500 text-sm">
          Live DAI/INR rate is unavailable. Crypto checkout is temporarily
          disabled. Card checkout remains available.
        </p>
      )}

      <button
        type="button"
        className="w-full border border-uiGrey text-uiBlack flex flex-row gap-3 items-center py-2 justify-center font-medium bg-white hover:text-uiOrange transition-all duration-150 hover:border-uiOrange rounded-sm disabled:text-baseGreen disabled:bg-greyLight disabled:border-greyLight input-shadow"
        disabled={paymentValidated || !validRate}
        onClick={handleConnectToMetamask}
      >
        <span>
          {paymentValidated ? "Connected to MetaMask" : "Connect to MetaMask"}
        </span>
        <img src={metamask} alt="" className="h-[32px]" />
      </button>

      <p className="text-textDim text-sm">
        Please connect your MetaMask wallet to proceed.
      </p>

      <p className="text-textDim text-sm italic">
        {validRate
          ? `Note: 1 DAI = INR ${Number(inrValue).toFixed(2)}`
          : "Exchange rate currently unavailable"}
      </p>
    </div>
  );
};

export default CryptoPayment;
