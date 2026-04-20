import mongoose from "mongoose";

import Users from "../../src/models/Users.js";
import {
  createProduct,
  getProductById,
  findProducts,
  addProductRequestDao,
  acceptProductRequestDao,
} from "../../src/daos/products.dao.js";
import {
  connectMemoryDb,
  clearMemoryDb,
  disconnectMemoryDb,
} from "../helpers/mongoMemory.js";

function buildProductData(sellerId, overrides = {}) {
  return {
    name: "Test Phone",
    price: 12345,
    description: "good device",
    zipCode: "500001",
    category: "Mobiles",
    district: "Hyderabad",
    city: "Hyderabad",
    state: "Telangana",
    seller: sellerId,
    images: ["http://img.com/a.jpg"],
    ...overrides,
  };
}

describe("products dao (memory db)", () => {
  let seller;
  let buyer;

  beforeAll(async () => {
    await connectMemoryDb();
  });

  beforeEach(async () => {
    await clearMemoryDb();
    seller = await Users.create({
      username: "seller",
      contact: "9999999999",
      email: "seller@test.com",
      password: "pass",
    });
    buyer = await Users.create({
      username: "buyer",
      contact: "8888888888",
      email: "buyer@test.com",
      password: "pass",
    });
  });

  afterAll(async () => {
    await disconnectMemoryDb();
  });

  test("createProduct + findProducts returns inserted product", async () => {
    await createProduct(buildProductData(seller._id));

    const products = await findProducts({ soldTo: null });

    expect(products).toHaveLength(1);
    expect(products[0].name).toBe("Test Phone");
    expect(String(products[0].seller)).toBe(String(seller._id));
  });

  test("getProductById returns populated seller", async () => {
    const created = await createProduct(buildProductData(seller._id));

    const fetched = await getProductById(created._id);

    expect(fetched).toBeTruthy();
    expect(fetched.seller.username).toBe("seller");
  });

  test("add request then accept request updates sellerAcceptedTo", async () => {
    const created = await createProduct(buildProductData(seller._id));

    const requestRes = await addProductRequestDao(created._id, buyer._id, 12000, {
      street: "Main St",
      city: "Hyderabad",
      state: "Telangana",
      pinCode: "500001",
      country: "India"
    });
    expect(requestRes.success).toBe(true);

    const acceptRes = await acceptProductRequestDao(created._id, buyer._id);
    expect(acceptRes.success).toBe(true);

    const updated = await getProductById(created._id);
    expect(String(updated.sellerAcceptedTo)).toBe(String(buyer._id));
    expect(updated.requests).toHaveLength(1);
    expect(updated.requests[0].biddingPrice).toBe(12000);
  });

  test("cannot request own product", async () => {
    const created = await createProduct(buildProductData(seller._id));

    const result = await addProductRequestDao(created._id, seller._id, 10000, {
      street: "Main St",
      city: "Hyderabad",
      state: "Telangana",
      pinCode: "500001",
      country: "India"
    });

    expect(result.success).toBe(false);
    expect(result.reason).toBe("self_request");
  });
});
