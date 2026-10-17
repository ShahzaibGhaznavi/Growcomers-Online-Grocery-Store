import React, { useState } from "react";
import { getProductImageSrc } from "../../../utils/productImage";

const ImageSection = ({ imageURL = [], imageURLHighRes = [], title = "Product" }) => {
  const [index, setIndex] = useState(0);
  const highResImages = imageURLHighRes.length ? imageURLHighRes : imageURL;
  const thumbnailImages = imageURL.length ? imageURL : highResImages;
  const selectedIndex = Math.min(index, Math.max(highResImages.length - 1, 0));

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-greyLight/60 border border-greyLight rounded-sm p-5 sm:w-[500px]">
        <img
          src={getProductImageSrc(highResImages[selectedIndex], title)}
          alt={title}
          className="h-[400px] max-w-auto object-contain m-auto"
        />
      </div>

      <div className="flex flex-row gap-4 flex-wrap">
        {thumbnailImages.map((entry, key) => (
          <button
            type="button"
            onClick={() => setIndex(key)}
            key={key}
            aria-label={`View ${title} image ${key + 1}`}
            className={`h-[50px] w-[50px] bg-greyLight border ${
              key === selectedIndex ? "border-baseGreen" : "border-greyLight"
            } rounded-sm p-2`}
          >
            <img
              src={getProductImageSrc(entry, title)}
              alt=""
              className="object-contain max-h-[50px] m-auto"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageSection;
