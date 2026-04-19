const sanitizePhone = (value) => String(value || "").replace(/\D/g, "").slice(-10);

const getRazorpayAuthHeader = () => {
    const keyId = process.env.RAZORPAYKEYID;
    const keySecret = process.env.RAZORPAYKEYSECRET;
    if (!keyId || !keySecret) {
        throw new Error("RAZORPAYKEYID and RAZORPAYKEYSECRET are required");
    }
    return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
};

const getPayoutAccountNumber = () => {
    const accountNumber = String(process.env.RAZORPAY_X_ACCOUNT_NUMBER || "").trim();
    if (!accountNumber) {
        throw new Error("RazorpayX source account number is missing. Set RAZORPAY_X_ACCOUNT_NUMBER");
    }
    return accountNumber;
};

const razorpayApiRequest = async (path, payload) => {
    const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: getRazorpayAuthHeader(),
        },
        body: JSON.stringify(payload),
    });

    const responseBody = await response.json();
    if (!response.ok) {
        const errorDescription = responseBody?.error?.description || responseBody?.error?.reason || "Razorpay API request failed";
        const error = new Error(errorDescription);
        error.error = responseBody?.error || { description: errorDescription };
        throw error;
    }

    return responseBody;
};

export const createSellerFundAccount = async ({ seller, accountType, holderName, accountNumber, ifsc, upiId }) => {
    const contactPayload = {
        name: holderName || seller.username || "Seller",
        email: seller.email,
        contact: sanitizePhone(seller.contact),
        type: "vendor",
        reference_id: `seller_${seller._id}`,
    };

    const contact = await razorpayApiRequest("contacts", contactPayload);

    const fundAccountPayload = {
        contact_id: contact.id,
        account_type: accountType === "upi" ? "vpa" : "bank_account",
    };

    if (accountType === "upi") {
        fundAccountPayload.vpa = { address: upiId };
    } else {
        fundAccountPayload.bank_account = {
            name: holderName,
            ifsc,
            account_number: accountNumber,
        };
    }

    const fundAccount = await razorpayApiRequest("fund_accounts", fundAccountPayload);

    return {
        contactId: contact.id,
        fundAccountId: fundAccount.id,
    };
};

export const createImmediateSellerPayout = async ({
    fundAccountId,
    amount,
    mode,
    idempotencyKey,
    narration,
}) => {
    const accountNumber = getPayoutAccountNumber();

    const payoutPayload = {
        account_number: accountNumber,
        fund_account_id: fundAccountId,
        amount: Math.round(Number(amount || 0) * 100),
        currency: "INR",
        mode: mode || "IMPS",
        purpose: "payout",
        queue_if_low_balance: true,
        reference_id: idempotencyKey,
        narration: narration || "Seller finalized balance withdrawal",
    };

    const payout = await razorpayApiRequest("payouts", payoutPayload);
    return payout;
};
