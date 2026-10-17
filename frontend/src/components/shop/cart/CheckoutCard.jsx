import React from "react";
import { useSelector } from "react-redux";
import { crypto, stripe } from "../../../assets";
import { getCartTotal } from "../../../redux/slice/cartSlice";
import {
  formatCryptoCurrency,
  formatCurrency,
} from "../../../utils/FormatCurrency";
import { getINRvalue } from "../../../redux/slice/daiSlice";

const CheckoutCard = ({ handleCheckout, buttonName, buttonDisabled }) => {
  const total = useSelector(getCartTotal);
  const inrValue = useSelector(getINRvalue);

  const validRate =
    Number.isFinite(Number(inrValue)) &&
    inrValue !== null &&
    inrValue !== "" &&
    Number(inrValue) > 0;

  return (
    <div className="md:w-[420px] max-w-[350px] bg-greyLight sm:p-8 p-4 rounded-sm flex flex-col h-max">
      <div className="flex flex-col gap-4 border-b border-uiGrey pb-6">
        <div className="flex flex-row justify-between items-center">
          <span className="text-textDim text-sm">Subtotal</span>
          <span className="text-baseGreen font-medium">
            {formatCurrency(total)}
          </span>
        </div>

        <div className="flex flex-row justify-between items-center">
          <span className="text-textDim text-sm">Discount</span>
          <span className="text-baseGreen font-medium">
            {formatCurrency("0.00")}
          </span>
        </div>

        <div className="flex flex-row justify-between items-center">
          <span className="text-textDim text-sm">Shipping Costs</span>
          <span className="text-baseGreen font-medium">
            {formatCurrency("0.00")}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-6">
        <div className="flex flex-row justify-between items-center">
          <span className="text-uiBlack text-[20px] font-medium">Total</span>
          <span className="text-uiBlack text-[20px] font-medium">
            {formatCurrency(total)}{" "}
            <span className="text-textDim text-sm font-normal">
              (
              {validRate
                ? formatCryptoCurrency(Number(total) / Number(inrValue))
                : "DAI rate unavailable"}
              )
            </span>
          </span>
        </div>

        <div className="flex flex-row justify-between items-center">
          <span className="text-textDim text-sm">You save</span>
          <span className="text-textDim font-medium">
            {formatCurrency("0.00")}
          </span>
        </div>
      </div>

      <div className="pt-6 pb-8 border-b border-uiGrey">
        <button
          type="button"
          onClick={handleCheckout}
          className="primary-button flex justify-center items-center disabled:bg-baseGreen/60 disabled:border-baseGreen/30 w-full"
          disabled={buttonDisabled}
        >
          {buttonName}
        </button>
      </div>

      <div className="flex flex-col gap-4 pt-6">
        <p className="text-textDim uppercase text-sm">
          Secure payments provided by
        </p>

        <div className="flex flex-row gap-3">
          <img
            src={stripe}
            alt=""
            className="w-[56px] h-[32px] object-contain bg-white rounded-[4px]"
          />
          <img
            src={crypto}
            alt=""
            className="w-[56px] h-[32px] object-contain bg-white rounded-[4px]"
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutCard;