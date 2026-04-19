import Users from "../../src/models/Users.js";
import { createProduct } from "../../src/daos/products.dao.js";
import {
  addToWishlistDao,
  getWishlistProductsDao,
  removeFromWishlistDao,
  updateBuyerById,
} from "../../src/daos/users.dao.js";
import {
  connectMemoryDb,
  clearMemoryDb,
  disconnectMemoryDb,
} from "../helpers/mongoMemory.js";

function buildProductData(sellerId, overrides = {}) {
  return {
    name: "Wishlist Product",
    price: 5500,
    description: "wishlist test item",
    zipCode: "500001",
    category: "Mobiles",
    district: "Hyderabad",
    city: "Hyderabad",
    state: "Telangana",
    seller: sellerId,
    images: ["http://img.com/p.jpg"],
    ...overrides,
  };
}

describe("users dao (memory db)", () => {
  let seller;
  let buyer;
  let product;

  beforeAll(async () => {
    await connectMemoryDb();
  });

  beforeEach(async () => {
    await clearMemoryDb();

    seller = await Users.create({
      username: "seller",
      contact: "9999999999",
      email: "seller-wl@test.com",
      password: "pass",
    });

    buyer = await Users.create({
      username: "buyer",
      contact: "8888888888",
      email: "buyer-wl@test.com",
      password: "pass",
    });

    product = await createProduct(buildProductData(seller._id));
  });

  afterAll(async () => {
    await disconnectMemoryDb();
  });

  test("addToWishlistDao and getWishlistProductsDao work with real DB", async () => {
    const addResult = await addToWishlistDao(buyer._id, product._id);
    expect(addResult.success).toBe(true);

    const wishlist = await getWishlistProductsDao(buyer._id);
    expect(wishlist.success).toBe(true);
    expect(wishlist.products).toHaveLength(1);
    expect(String(wishlist.products[0]._id)).toBe(String(product._id));
  });

  test("removeFromWishlistDao removes existing product", async () => {
    await addToWishlistDao(buyer._id, product._id);

    const removeResult = await removeFromWishlistDao(buyer._id, String(product._id));
    expect(removeResult.success).toBe(true);

    const wishlist = await getWishlistProductsDao(buyer._id);
    expect(wishlist.products).toHaveLength(0);
  });

  test("updateBuyerById updates profile fields", async () => {
    const updated = await updateBuyerById(buyer._id, {
      username: "buyer-updated",
      contact: "7777777777",
    });

    expect(updated.username).toBe("buyer-updated");
    expect(updated.contact).toBe("7777777777");
  });
});
