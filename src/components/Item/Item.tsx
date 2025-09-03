export interface Product {
  id: number;
  image: string;
  name: string;
  category: string;
  sku: string;
  variant: string;
  price: string;
  status: "Active" | "Out of Stock";
}

export const products: Product[] = [
  {
    id: 1,
    image: "/solid-lapel-neck-blouse-orange.png",
    name: "Solid Lapel Neck Blouse",
    category: "CLOTHING",
    sku: "TS38790",
    variant: "11\nVaries on: Size, Color",
    price: "$24",
    status: "Active",
  },
  {
    id: 2,
    image: "/point-toe-heeled-pumps-gray.png",
    name: "Point Toe Heeled Pumps",
    category: "SHOES",
    sku: "TS38843",
    variant: "4\nVaries on: Size",
    price: "$56",
    status: "Out of Stock",
  },
  {
    id: 3,
    image: "/solid-rib-knit-crop-cami-top-red.png",
    name: "Solid Rib-knit Crop Cami Top",
    category: "CLOTHING",
    sku: "TS12334",
    variant: "8\nVaries on: Size, Color",
    price: "$19",
    status: "Out of Stock",
  },
  {
    id: 4,
    image: "/crop-tank-top-pink.png",
    name: "Crop Tank Top",
    category: "CLOTHING",
    sku: "TS77845",
    variant: "6\nVaries on: Size, Material",
    price: "$19",
    status: "Active",
  },
  {
    id: 5,
    image: "/v-neck-rib-knit-top-green.png",
    name: "V-Neck Rib-knit Top",
    category: "CLOTHING",
    sku: "TS64358",
    variant: "7\nVaries on: Color, Material",
    price: "$13",
    status: "Active",
  },
  {
    id: 6,
    image: "/minimalist-flap-chain-bag-black.png",
    name: "Minimalist Flap Chain Bag",
    category: "BAG",
    sku: "TS00213",
    variant: "2\nVaries on: Color",
    price: "$32",
    status: "Active",
  },
  {
    id: 7,
    image: "/front-crop-top-blue.png",
    name: "Front Crop Top",
    category: "CLOTHING",
    sku: "TS36940",
    variant: "2\nVaries on: Color",
    price: "$17",
    status: "Active",
  },
  {
    id: 8,
    image: "/scallop-drawstring-crop-top-beige.png",
    name: "Scallop Drawstring Crop Top",
    category: "CLOTHING",
    sku: "TS13346",
    variant: "5\nVaries on: Size, Color",
    price: "$21",
    status: "Active",
  },
  {
    id: 9,
    image: "/pineapple-earrings-gold.png",
    name: "Pineapple Earrings",
    category: "JEWELRY",
    sku: "TS84223",
    variant: "1\nVaries on: Color",
    price: "$8",
    status: "Out of Stock",
  },
  {
    id: 10,
    image: "/floral-shirred-top-burgundy.png",
    name: "Floral Shirred Top",
    category: "CLOTHING",
    sku: "TS84422",
    variant: "6\nVaries on: Size, Color",
    price: "$19",
    status: "Active",
  },
]