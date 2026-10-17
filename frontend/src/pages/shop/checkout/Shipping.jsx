import React, { useEffect, useState } from "react";
import CheckoutCard from "../../../components/shop/cart/CheckoutCard";
import { useDispatch, useSelector } from "react-redux";
import {
  addAddress,
  fetchAddress,
  getAddAddressError,
  getAddAddressStatus,
  getAllAddress,
  getFetchAddressStatus,
  removeAddErrorMessage,
} from "../../../redux/slice/addressSlice";
import ShippingCard from "../../../components/shop/checkout/shipping/ShippingCard";
import { getAddressId, setAddressId } from "../../../redux/slice/orderSlice";
import AddressForm from "../../../components/shop/profile/address/AddressForm";
import { initialAddressValues } from "../../../utils/DefaultValues";
import AlertBox from "../../../components/common/AlertBox";

const Shipping = ({ onNextStep }) => {
  const dispatch = useDispatch();

  const addressId = useSelector(getAddressId);
  const addressData = useSelector(getAllAddress);
  const status = useSelector(getFetchAddressStatus);

  const addStatus = useSelector(getAddAddressStatus);
  const error = useSelector(getAddAddressError);

  const [addAddressActive, setAddAddressActive] = useState(false);

  const handleAddAddress = async (values) => {
    try {
      const response = await dispatch(addAddress(values)).unwrap();

      // Newly added address ko automatically select karo
      if (response?.data?._id) {
        dispatch(setAddressId(response.data._id));
      }

      setAddAddressActive(false);
    } catch (err) {
      console.log("Add Address Error:", err);
    }
  };

  useEffect(() => {
    if (addressData.length === 0) {
      dispatch(fetchAddress());
    }
  }, [dispatch, addressData.length]);

  return (
    <div className="sm:container py-[2rem] sm:px-[4rem]">
      {addStatus === "failed" ? (
        <AlertBox
          type={addStatus}
          message={error}
          toDispatch={removeAddErrorMessage}
        />
      ) : null}

      <div className="flex md:flex-row flex-col justify-between gap-16">
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex flex-row justify-between items-center border-b border-textDim py-4">
            <h2 className="heading2">Shipping Info</h2>
          </div>

          {addAddressActive ? (
            <AddressForm
              initialValues={initialAddressValues}
              buttonName="Add"
              handleSubmit={handleAddAddress}
              handleCancel={() => setAddAddressActive(false)}
              status={addAddress}
            />
          ) : (
            <div className="grid-list-3">
              {status === "success"
                ? addressData.map((entry) => (
                    <ShippingCard
                      key={entry._id}
                      data={entry}
                      active={entry._id === addressId}
                      setAddressId={setAddressId}
                    />
                  ))
                : null}

              <div className="flex items-center justify-center border border-greyLight">
                <button
                  type="button"
                  onClick={() => setAddAddressActive(true)}
                  className="primary-button font-normal mt-2"
                >
                  Add New Address
                </button>
              </div>
            </div>
          )}
        </div>

        <CheckoutCard
          handleCheckout={onNextStep}
          buttonName="Proceed to Payments"
          buttonDisabled={!addressId}
        />
      </div>
    </div>
  );
};

export default Shipping;
