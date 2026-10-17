const localProductImages = [
  {
    match: ["nestle kitkat 4 finger", "kitkat"],
    image: "/products/nestle-kitkat-4-finger.jpg",
  },
  {
    match: ["coca cola", "coca-cola"],
    image: "/products/coca-cola-1-5l.jpg",
  },
  {
    match: ["dawn bran bread", "dawn bran"],
    image: "/products/dawn-bran-bread.jpg",
  },
  {
    match: ["nestle milk pack 1l", "nestle milkpak 1l", "milkpak 1l"],
    image: "/products/nestle-milkpak-1l.webp",
  },
  {
    match: ["fresh apples", "apples 1kg"],
    image: "/products/fresh-apples.jpg",
  },
  {
    match: ["fresh bananas", "bananas 1 dozen"],
    image: "/products/fresh-bananas.jpg",
  },
  {
    match: ["lays classic"],
    image: "/products/lays-classic.jpg",
  },
  {
    match: ["pepsi"],
    image: "/products/pepsi.jpg",
  },
];

export const getProductImageSrc = (url, title = "Product") => {
  const imageUrl = Array.isArray(url) ? url[0] : url;

  if (imageUrl && !imageUrl.toLowerCase().includes("placehold.co")) {
    return imageUrl;
  }

  const label = String(title || "Product").trim() || "Product";
  const normalized = label.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

  const localImage = localProductImages.find(({ match }) =>
    match.some((name) => normalized.includes(name))
  );

  if (localImage) return localImage.image;

  const escapeXml = (value) =>
    String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
    })[char]);

  const words = label.split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > 23 && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);

  const text = lines.slice(0, 3).map((value, index) =>
    `<text x="300" y="${430 + index * 42}" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" font-weight="bold" fill="#166534">${escapeXml(value)}</text>`
  ).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="#f3f4f6"/><rect x="170" y="100" width="260" height="260" rx="30" fill="#dcfce7" stroke="#15803d" stroke-width="5"/><path d="M240 190 Q300 115 360 190 L360 285 Q300 325 240 285 Z" fill="#86efac" stroke="#15803d" stroke-width="5"/><path d="M300 155 L300 295" stroke="#15803d" stroke-width="4"/><text x="300" y="400" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" fill="#166534">GROWCOMERS</text>${text}</svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};
