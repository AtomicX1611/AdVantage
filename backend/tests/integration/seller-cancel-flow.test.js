import Users from "../../src/models/Users.js";
import Order from "../../src/models/Orders.js";
import Products from "../../src/models/Products.js";
import PendingPayouts from "../../src/models/PendingPayouts.js";
import {
  createProduct,
  addProductRequestDao,
  createStakeOrderDao,
  verifyStakeDao,
  acceptProductRequestDao,
} from "../../src/daos/products.dao.js";
import { sellerCancelPaidOrderDao } from "../../src/daos/orders.dao.js";
import {
  connectMemoryDb,
  clearMemoryDb,
  disconnectMemoryDb,
} from "../helpers/mongoMemory.js";

describe("seller cancel paid order (integration)", () => {
  let seller;
  let buyer;

  beforeAll(async () => {
    await connectMemoryDb();
  });

  beforeEach(async () => {
    await clearMemoryDb();
    seller = await Users.create({
      username: "seller2",
      contact: "7777777777",
      email: "seller.cancel@test.com",
      password: "pass",
    });
    buyer = await Users.create({
      username: "buyer2",
      contact: "6666666666",
      email: "buyer.cancel@test.com",
      password: "pass",
    });
  });

  afterAll(async () => {
    await disconnectMemoryDb();
  });

  test("refunds both parties and resets product availability", async () => {
    const product = await createProduct({
      name: "Cancel Phone",
      price: 1300,
      description: "test product",
      zipCode: "500001",
      category: "Mobiles",
      district: "Hyderabad",
      city: "Hyderabad",
      state: "Telangana",
      seller: seller._id,
      images: ["http://example.com/p2.jpg"],
      isRental: false,
    });

    await addProductRequestDao(product._id, buyer._id, 1000, {
      addressLine: "Line 1",
      city: "Hyderabad",
      state: "Telangana",
      pinCode: "500001",
    });
    await createStakeOrderDao(product._id, buyer._id, 200, "stake_order_2");
    await verifyStakeDao(product._id, buyer._id, "stake_payment_2");
    await acceptProductRequestDao(product._id, buyer._id);

    product.soldTo = buyer._id;
    product.sellerAcceptedTo = buyer._id;
    await product.save();

    const order = await Order.create({
      buyerId: buyer._id,
      productId: product._id,
      subscription: 0,
      id: "order_cancel_1",
      amount: 100000,
      currency: "INR",
      receipt: "receipt_cancel_1",
      status: "paid",
      paymentId: "pay_cancel_1",
      paymentProcessed: true,
      notes: { productId: product._id.toString(), buyerId: buyer._id.toString() },
      deliveryStatus: "Pending",
    });

    const cancelRes = await sellerCancelPaidOrderDao(order._id, seller._id);
    expect(cancelRes.success).toBe(true);

    const payouts = await PendingPayouts.find({ orderId: order._id });
    expect(payouts).toHaveLength(2);

    const buyerRefund = payouts.find((p) => p.payoutType === "Buyer_100_Refund");
    const sellerRefund = payouts.find((p) => p.payoutType === "Seller_20_Refund");

    expect(buyerRefund.amount).toBe(1000);
    expect(sellerRefund.amount).toBe(200);

    const updatedProduct = await Products.findById(product._id);
    const updatedOrder = await Order.findById(order._id);

    expect(updatedProduct.soldTo).toBeNull();
    expect(updatedProduct.sellerAcceptedTo).toBeNull();
    expect(updatedOrder.status).toBe("cancelled");
    expect(updatedOrder.deliveryStatus).toBe("Cancelled");
  });
});
