import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Layout from "../../components/common/Layout";
import ImageSection from "../../components/shop/product/ImageSection";
import ProductMain from "../../components/shop/product/ProductMain";
import ProductRelated from "../../components/shop/product/ProductRelated";
import ProductReviews from "../../components/shop/product/ProductReviews";
import {
  clearProductDetails,
  fetchProductDetails,
  getProductDetails,
  getProductError,
  getProductStatus,
} from "../../redux/slice/productSlice";
import BackButton from "../../components/common/BackButton";

const Product = () => {
  const id = useParams().id;
  const dispatch = useDispatch();
  const productData = useSelector(getProductDetails);
  const status = useSelector(getProductStatus);
  const error = useSelector(getProductError);

  useEffect(() => {
    dispatch(fetchProductDetails(id));
    localStorage.setItem("product", JSON.stringify(id));

    return () => {
      dispatch(clearProductDetails());
    };
  }, [id]);

  return (
    <Layout>
      <div className="container sm:pb-12 pt-6 pb-6">
        {status === "loading" ? <p>Loading...</p> : null}
        {status === "failed" ? <p>{error}</p> : null}
        {status === "success" ? (
          <div className="flex flex-col gap-[3rem]">
            <BackButton />
            <div className="flex sm:flex-row flex-col gap-8 justify-between">
              <ImageSection
                imageURL={productData.imageURL}
                imageURLHighRes={productData.imageURLHighRes}
                title={productData.title}
              />
              <ProductMain />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="heading3">Description</h3>
              <p className="text-bodyText text-sm">{productData.description}</p>
            </div>

            <ProductRelated />

            <ProductReviews />
          </div>
        ) : null}
      </div>
    </Layout>
  );
};

export default Product;
