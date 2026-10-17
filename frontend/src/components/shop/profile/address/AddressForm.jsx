import React from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { ImSpinner2 } from "react-icons/im";

const country = ["India", "Nepal"];

const states = {
  India: [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu and Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttarakhand",
    "Uttar Pradesh",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli",
    "Daman and Diu",
    "Delhi",
    "Lakshadweep",
    "Puducherry",
  ],
  Nepal: [
    "Bagmati",
    "Gandaki",
    "Karnali",
    "Koshi",
    "Lumbini",
    "Madhesh",
    "Sudurpashchim",
  ],
};

const addressSchema = Yup.object().shape({
  title: Yup.string().min(4, "Too Short!").required("Required"),
  street: Yup.string().min(4, "Too Short!").required("Required"),
  city: Yup.string().min(4, "Too Short!").required("Required"),
  state: Yup.string().required("Required"),
  country: Yup.string().required("Required"),
  zipCode: Yup.string()
    .matches(/^\d{5}$/, "Enter valid zip code")
    .required("Required"),
  mobileNumber: Yup.string()
    .matches(/^(03\d{9}|923\d{9}|\+923\d{9})$/, "Enter valid Pakistani mobile number (03XXXXXXXXX)")
    .required("Required"),
});

const AddressForm = ({
  initialValues,
  buttonName,
  handleSubmit,
  handleCancel,
  status,
}) => {
  return (
    <Formik
      onSubmit={handleSubmit}
      validationSchema={addressSchema}
      initialValues={initialValues}
      className=""
    >
      {({ values, errors, touched }) => (
        <Form className="flex flex-col gap-4">
          <div className="input-row-container">
            <div className="input-container gap-1">
              <label className="input-label" htmlFor="title">
                Address Title
              </label>
              <Field
                name="title"
                className="input-box h-[36px] text-sm"
                placeholder="Eg. Home Address"
              />
              {errors.title && touched.title ? (
                <span className="input-error">{errors.title}</span>
              ) : null}
            </div>
            <div className="input-container gap-1">
              <label className="input-label" htmlFor="mobileNumber">
                Mobile Number
              </label>
              <Field
                name="mobileNumber"
                className="input-box h-[36px] text-sm"
                placeholder="Eg. 870000000"
              />
              {errors.mobileNumber && touched.mobileNumber ? (
                <span className="input-error">{errors.mobileNumber}</span>
              ) : null}
            </div>

            <div className="input-container gap-1">
              <label className="input-label" htmlFor="city">
                City
              </label>
              <Field
                name="city"
                className="input-box h-[36px] text-sm"
                placeholder="Eg. Vellore"
              />
              {errors.city && touched.city ? (
                <span className="input-error">{errors.city}</span>
              ) : null}
            </div>
          </div>
          <div className="input-row-container">
            <div className="input-container gap-1">
              <label className="input-label" htmlFor="country">
                Country
              </label>
              <Field
                name="country"
                as="select"
                className="input-box h-[36px] text-sm"
              >
                {country.map((countryName) => (
                  <option value={countryName} key={countryName}>
                    {countryName}
                  </option>
                ))}
              </Field>
              {errors.country && touched.country ? (
                <span className="input-error">{errors.country}</span>
              ) : null}
            </div>
            <div className="input-container gap-1">
              <label className="input-label" htmlFor="state">
                State
              </label>
              <Field
                name="state"
                as="select"
                className="input-box h-[36px] text-sm"
              >
                <option value="">Select state</option>
                {states[values.country].map((stateName) => (
                  <option value={stateName} key={stateName}>
                    {stateName}
                  </option>
                ))}
              </Field>
              {errors.state && touched.state ? (
                <span className="input-error">{errors.state}</span>
              ) : null}
            </div>
            <div className="input-container gap-1">
              <label className="input-label" htmlFor="zipCode">
                ZipCode
              </label>
              <Field
                name="zipCode"
                className="input-box h-[36px] text-sm"
                placeholder="Eg. 632014"
              />
              {errors.zipCode && touched.zipCode ? (
                <span className="input-error">{errors.zipCode}</span>
              ) : null}
            </div>
          </div>
          <div className="input-container gap-1">
            <label className="input-label" htmlFor="street">
              Street
            </label>
            <Field
              name="street"
              className="input-box h-[36px] text-sm"
              placeholder="Eg. Katpadi Road"
            />
            {errors.street && touched.street ? (
              <span className="input-error">{errors.street}</span>
            ) : null}
          </div>

          <div className="self-end flex flex-row gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="border border-uiGrey text-bodyText h-[34px] px-6 font-normal min-w-[100px]"
              disabled={status === "loading"}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button h-[34px] px-8 font-normal min-w-[100px]"
              disabled={status === "loading"}
            >
              {status == "loading" ? (
                <ImSpinner2 className="animate-spin" />
              ) : (
                buttonName
              )}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AddressForm;
