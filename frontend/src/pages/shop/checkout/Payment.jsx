
import React, { useState } from "react";
import CheckoutCard from "../../../components/shop/cart/CheckoutCard";
import CardCheckoutForm from "../../../components/shop/checkout/payment/CardCheckoutForm";
import { getCartId, getCartTotal } from "../../../redux/slice/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { PRIVATE_API } from "../../../api/apiIndex";
import PaymentLoading from "../../../components/common/loaders/PaymentLoading";
import {
  getAddressId,
  getOrderError,
  getOrderMessage,
  getOrderStatus,
  placeOrder,
  removeOrderStatus,
  setOrderStatus,
} from "../../../redux/slice/orderSlice";
import AlertBox from "../../../components/common/AlertBox";
import CryptoPayment from "../../../components/shop/checkout/payment/CryptoPayment";
import { ethers } from "ethers";
import { getINRvalue } from "../../../redux/slice/daiSlice";

const Payment = ({ onNextStep }) => {
  const dispatch = useDispatch();

  const addressId = useSelector(getAddressId);
  const cartId = useSelector(getCartId);

  const orderStatus = useSelector(getOrderStatus);
  const orderMessage = useSelector(getOrderMessage);
  const orderError = useSelector(getOrderError);

  const [paymentValidated, setPaymentValidated] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentProcessor, setPaymentProcessor] = useState(null);
  const [daiProcessor, setDaiProcessor] = useState(null);

  const totalAmount = useSelector(getCartTotal);
  const inrValue = useSelector(getINRvalue);

  // Development/test card payment. This does not process a real card payment.
  const handleCardSubmit = async () => {
    try {
      dispatch(
        setOrderStatus({
          status: "loading",
          message: "Processing your test payment. Please wait",
        })
      );

      const { data } = await PRIVATE_API.post("/payment/test", {
        totalAmount,
      });

      const orderData = {
        paymentMethod: "Card",
        paymentId: data.paymentId,
        addressId,
        cartId,
      };

      await dispatch(placeOrder(orderData)).unwrap();
      onNextStep();
    } catch (err) {
      dispatch(
        setOrderStatus({
          status: "failed",
          message: "",
          error:
            err.response?.data?.message ||
            err.message ||
            "Payment failed. Please try again.",
        })
      );

      setPaymentValidated(false);
    }
  };

  const handleCryptoSubmit = async () => {
    if (
      inrValue == null ||
      !Number.isFinite(Number(inrValue)) ||
      Number(inrValue) <= 0
    ) {
      dispatch(
        setOrderStatus({
          status: "failed",
          message: "",
          error:
            "The live DAI/INR exchange rate is unavailable. Please try again later or use card payment.",
        })
      );

      setPaymentValidated(false);
      return;
    }

    if (!paymentProcessor || !daiProcessor) {
      dispatch(
        setOrderStatus({
          status: "failed",
          message: "",
          error: "Please connect MetaMask before making a crypto payment.",
        })
      );

      setPaymentValidated(false);
      return;
    }

    try {
      dispatch(
        setOrderStatus({
          status: "loading",
          message: "Please approve transaction in MetaMask wallet.",
        })
      );

      const { data } = await PRIVATE_API.post("/payment/crypto", {
        totalAmount,
      });

      const convertedAmount = (totalAmount / Number(inrValue)).toString();
      const price = ethers.parseEther(convertedAmount);
      const clientAddress = await paymentProcessor.getAddress();

      const approveTransaction = await daiProcessor.approve(
        clientAddress,
        price
      );

      await approveTransaction.wait();

      dispatch(
        setOrderStatus({
          status: "loading",
          message:
            "Successfully approved transaction. Please confirm transaction in MetaMask wallet",
        })
      );

      const paymentTransaction = await paymentProcessor.pay(
        price,
        data.paymentId
      );

      await paymentTransaction.wait();

      dispatch(
        setOrderStatus({
          status: "loading",
          message: "Successfully processed payment. Please wait",
        })
      );

      const sendData = {
        paymentMethod: "Cryptocurrency",
        paymentId: data.paymentId,
        addressId,
        cartId,
      };

      await dispatch(placeOrder(sendData)).unwrap();
      onNextStep();
    } catch (err) {
      dispatch(
        setOrderStatus({
          status: "failed",
          message: "",
          error:
            err.code === "ACTION_REJECTED"
              ? "Transaction rejected by user"
              : err.response?.data?.message ||
                err.message ||
                "Crypto payment failed. Please try again.",
        })
      );

      setPaymentValidated(false);
    }
  };

  return (
    <div className="sm:container py-[2rem] sm:px-[4rem]">
      {orderStatus === "failed" ? (
        <AlertBox
          type={orderStatus}
          message={orderError}
          toDispatch={removeOrderStatus}
        />
      ) : null}

      {orderStatus === "loading" ? (
        <PaymentLoading message={orderMessage} />
      ) : null}

      <div className="flex md:flex-row flex-col justify-between gap-16">
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex flex-row justify-between items-center border-b border-textDim py-4">
            <h2 className="heading2">Payment Details</h2>
          </div>

          <div className="border border-greyLight bg-formBackground">
            <div className="p-6 flex flex-col sm:w-[500px] w-full mx-auto">
              <div className="flex flex-row gap-4 justify-between border-b border-b-greyLight pb-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`m-2 py-2 w-full rounded-sm bg-white input-shadow ${
                    paymentMethod === "card"
                      ? "border border-baseGreen text-baseGreen font-medium"
                      : "border border-greyLight text-uiBlack disabled:text-textDim disabled:bg-greyLight"
                  } hover:text-baseGreen`}
                  disabled={paymentValidated}
                >
                  Pay using card
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("crypto")}
                  className={`m-2 py-2 w-full rounded-sm bg-white input-shadow ${
                    paymentMethod === "crypto"
                      ? "border border-baseGreen text-baseGreen font-medium"
                      : "border border-greyLight text-uiBlack disabled:text-textDim disabled:bg-greyLight"
                  } hover:text-baseGreen transition-colors duration-150`}
                  disabled={paymentValidated}
                >
                  Pay using crypto
                </button>
              </div>

              {paymentMethod === "card" ? (
                <CardCheckoutForm
                  validated={paymentValidated}
                  setValidated={setPaymentValidated}
                />
              ) : (
                <CryptoPayment
                  setPaymentProcessor={setPaymentProcessor}
                  setDaiProcessor={setDaiProcessor}
                  paymentValidated={paymentValidated}
                  inrValue={inrValue}
                  setPaymentValidated={setPaymentValidated}
                />
              )}
            </div>
          </div>
        </div>

        <CheckoutCard
          handleCheckout={
            paymentMethod === "card"
              ? handleCardSubmit
              : handleCryptoSubmit
          }
          buttonName="Place Order"
          buttonDisabled={!paymentValidated}
        />
      </div>
    </div>
  );
};

export default Payment;
