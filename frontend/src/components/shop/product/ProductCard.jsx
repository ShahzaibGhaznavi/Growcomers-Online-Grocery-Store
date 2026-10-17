import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StarRating from "../../common/starRating/StarRating";
import { FiShoppingCart } from "react-icons/fi";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  addToCartNOUSER,
  getCartItems,
} from "../../../redux/slice/cartSlice";
import { getUser } from "../../../redux/slice/authSlice";
import { ImSpinner2 } from "react-icons/im";
import {
  addWishlistItem,
  getWishlist,
} from "../../../redux/slice/wishlistSlice";
import { formatCurrency } from "../../../utils/FormatCurrency";
import { getProductImageSrc } from "../../../utils/productImage";

const ProductCard = ({ data }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(getUser);
  const cartItems = useSelector(getCartItems);
  const wishlistItems = useSelector(getWishlist);

  const [existsInCart, setExistsInCart] = useState(false);
  const [existsInWishlist, setExistsInWishlist] = useState(false);
  const [addStatus, setAddStatus] = useState("idle");

  useEffect(() => {
    const exists = cartItems.find((item) => item.id === data._id);
    setExistsInCart(!!exists);
  }, [cartItems]);

  useEffect(() => {
    const exists = wishlistItems.find((item) => item.productId === data._id);
    setExistsInWishlist(!!exists);
  }, [wishlistItems]);

  const handleAddtoCart = async () => {
    const quantity = 1;

    if (user) {
      setAddStatus("loading");
      const _data = { id: data._id, quantity };
      await dispatch(addToCart({ productData: [_data] })).unwrap();
      setAddStatus("success");
    } else {
      const _total = data.price * quantity;
      const total = _total.toFixed(2);

      const _data = {
        id: data._id,
        title: data.title,
        price: data.price,
        imageUrl: data.imageUrl,
        quantity,
        total,
        stock: data.quantity,
      };
      dispatch(addToCartNOUSER(_data));
    }
  };

  const handleWishlist = () => {
    if (user) {
      const _data = { userId: user.id, productId: data._id };
      dispatch(addWishlistItem(_data));
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="m-auto sm:min-h-[300px] h-full max-w-[300px] w-full">
      <div className="group outline outline-1 outline-greyLight rounded-sm h-full">
        <div className="h-[250px] w-full overflow-hidden relative bg-greyLight">
          <Link to={`/product/${data._id}`}>
            <img
              className="object-contain h-full w-full"
              src={getProductImageSrc(data.imageUrl || data.imageURL || data.imageURLHighRes, data.title)}
              alt=""
            />
          </Link>
        </div>
        <div className="p-4 flex flex-col gap-2 relative">
          <div className="z-10 h-[44px] w-[44px] absolute -top-5 right-6 bg-white rounded-full border border-uiGrey">
            <button
              onClick={handleWishlist}
              className="flex items-center justify-center h-full w-full text-[20px]"
              disabled={existsInWishlist}
            >
              {existsInWishlist ? (
                <AiFillHeart className="text-uiRed" />
              ) : (
                <AiOutlineHeart />
              )}
            </button>
          </div>
          <p className="text-textDim text-sm">{data.category}</p>

          <p className="text-uiBlack font-medium ">
            <Link
              to={`/product/${data._id}`}
              className="hover:text-uiOrange transition-all duration-150"
              dangerouslySetInnerHTML={{
                __html:
                  data.title.length > 100
                    ? data.title.substring(0, 100) + "..."
                    : data.title,
              }}
            />
          </p>
          <div>
            <StarRating rating={data.rating} />
            <p className="text-sm">
              <span className="text-textDim">By</span>&nbsp;
              <span className="text-baseGreen">{data.brand}</span>
            </p>
          </div>
          <div className="flex flex-col gap-3 mt-auto">
            <p className="">
              <span className="text-baseGreen text-[22px] font-semibold">
                {formatCurrency(data.price)}
              </span>
              &nbsp;
              <span className="text-textDim text-sm line-through">
                {formatCurrency(data.MRP)}
              </span>
            </p>
            <button
              type="button"
              onClick={handleAddtoCart}
              className="flex flex-row gap-2 py-3 w-full rounded-sm text-baseGreen bg-lightGreen items-center justify-center hover:bg-baseGreen hover:text-uiWhite transition-all duration-150 disabled:bg-greyLight disabled:text-uiGrey"
              disabled={existsInCart || addStatus !== "idle"}
            >
              {addStatus === "loading" ? (
                <ImSpinner2 className="animate-spin text-[18px]" />
              ) : (
                <>
                  <FiShoppingCart />
                  <span>{existsInCart ? "Added" : "Add"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
