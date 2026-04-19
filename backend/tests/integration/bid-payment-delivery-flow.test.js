import Users from "../../src/models/Users.js";
import Order from "../../src/models/Orders.js";
import PendingPayouts from "../../src/models/PendingPayouts.js";
import {
  createProduct,
  addProductRequestDao,
  createStakeOrderDao,
  verifyStakeDao,
  acceptProductRequestDao,
} from "../../src/daos/products.dao.js";
import {
  shipOrderDao,
  markOrderDeliveredDao,
  getBuyerOrdersDao,
} from "../../src/daos/orders.dao.js";
import {
  connectMemoryDb,
  clearMemoryDb,
  disconnectMemoryDb,
} from "../helpers/mongoMemory.js";

describe("bid-payment-delivery lifecycle (integration)", () => {
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
      email: "seller.flow@test.com",
      password: "pass",
    });
    buyer = await Users.create({
      username: "buyer",
      contact: "8888888888",
      email: "buyer.flow@test.com",
      password: "pass",
    });
  });

  afterAll(async () => {
    await disconnectMemoryDb();
  });

  test("completes delivered order after 48h and creates seller 120% payout", async () => {
    const product = await createProduct({
      name: "Flow Phone",
      price: 1200,
      description: "test product",
      zipCode: "500001",
      category: "Mobiles",
      district: "Hyderabad",
      city: "Hyderabad",
      state: "Telangana",
      seller: seller._id,
      images: ["http://example.com/p1.jpg"],
    });

    const requestRes = await addProductRequestDao(product._id, buyer._id, 1000, {
      addressLine: "Line 1",
      city: "Hyderabad",
      state: "Telangana",
      pinCode: "500001",
    });
    expect(requestRes.success).toBe(true);

    const stakeRes = await createStakeOrderDao(product._id, buyer._id, 200, "stake_order_1");
    expect(stakeRes.success).toBe(true);

    const verifyStakeRes = await verifyStakeDao(product._id, buyer._id, "stake_payment_1");
    expect(verifyStakeRes.success).toBe(true);

    const acceptRes = await acceptProductRequestDao(product._id, buyer._id);
    expect(acceptRes.success).toBe(true);

    const order = await Order.create({
      buyerId: buyer._id,
      productId: product._id,
      subscription: 0,
      id: "order_flow_1",
      amount: 100000,
      currency: "INR",
      receipt: "receipt_flow_1",
      status: "paid",
      paymentId: "pay_flow_1",
      paymentProcessed: true,
      notes: { productId: product._id.toString(), buyerId: buyer._id.toString() },
      deliveryStatus: "Pending",
    });

    const shipRes = await shipOrderDao(order._id, seller._id, "AWB123", "DTDC");
    expect(shipRes.success).toBe(true);

    const markDeliveredRes = await markOrderDeliveredDao(order._id);
    expect(markDeliveredRes.success).toBe(true);

    const freshOrder = await Order.findById(order._id);
    freshOrder.deliveredAt = new Date(Date.now() - (49 * 60 * 60 * 1000));
    await freshOrder.save();

    const buyerOrders = await getBuyerOrdersDao(buyer._id);
    const updatedOrder = buyerOrders.find((o) => String(o._id) === String(order._id));

    expect(updatedOrder.deliveryStatus).toBe("Completed");
    expect(updatedOrder.timerTriggered48Hour).toBe(true);

    const payouts = await PendingPayouts.find({ orderId: order._id, payoutType: "Seller_120_Percent" });
    expect(payouts).toHaveLength(1);
    expect(payouts[0].amount).toBe(1200);
  });
});
