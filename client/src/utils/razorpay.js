const RAZORPAY_CHECKOUT_URL = "https://checkout.razorpay.com/v1/checkout.js";

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(`script[src="${RAZORPAY_CHECKOUT_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const startRazorpayPayment = async ({
  backendURL,
  createOrderPayload,
  displayName,
  description,
}) => {
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

  if (!keyId) {
    throw new Error("Missing VITE_RAZORPAY_KEY_ID in client environment");
  }

  const sdkLoaded = await loadRazorpayScript();
  if (!sdkLoaded) {
    throw new Error("Unable to load Razorpay checkout SDK");
  }

  const createOrderResponse = await fetch(`${backendURL}/user/create-order`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(createOrderPayload),
  });

  const createOrderData = await createOrderResponse.json();

  if (!createOrderResponse.ok || !createOrderData.success || !createOrderData.order) {
    throw new Error(createOrderData.message || "Failed to create payment order");
  }

  const order = createOrderData.order;

  const paymentPayload = await new Promise((resolve, reject) => {
    const razorpay = new window.Razorpay({
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      name: displayName || "AdVantage",
      description: description || "Payment",
      order_id: order.id,
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error("Payment popup closed")),
      },
      theme: {
        color: "#1f7a8c",
      },
    });

    razorpay.on("payment.failed", (response) => {
      const failureMessage =
        response?.error?.description ||
        response?.error?.reason ||
        "Payment failed";
      reject(new Error(failureMessage));
    });

    razorpay.open();
  });

  const verifyResponse = await fetch(`${backendURL}/user/verify-payment`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paymentPayload),
  });

  const verifyData = await verifyResponse.json();

  if (!verifyResponse.ok || !verifyData.success) {
    throw new Error(verifyData.message || "Payment verification failed");
  }

  return verifyData;
};
