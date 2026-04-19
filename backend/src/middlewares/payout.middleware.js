const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const ACCOUNT_NUMBER_REGEX = /^\d{9,18}$/;
const UPI_REGEX = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/;

export const validatePayoutAccountPayload = (req, res, next) => {
    const { accountType, holderName, accountNumber, ifsc, upiId } = req.body || {};

    if (!["bank", "upi"].includes(accountType)) {
        return res.status(400).json({ success: false, message: "accountType must be either bank or upi" });
    }

    if (!holderName || String(holderName).trim().length < 2) {
        return res.status(400).json({ success: false, message: "Valid holderName is required" });
    }

    if (accountType === "bank") {
        if (!ACCOUNT_NUMBER_REGEX.test(String(accountNumber || ""))) {
            return res.status(400).json({ success: false, message: "accountNumber must be 9 to 18 digits" });
        }
        if (!IFSC_REGEX.test(String(ifsc || "").toUpperCase())) {
            return res.status(400).json({ success: false, message: "Invalid IFSC format" });
        }
    }

    if (accountType === "upi" && !UPI_REGEX.test(String(upiId || ""))) {
        return res.status(400).json({ success: false, message: "Invalid UPI ID format" });
    }

    next();
};

export const validateWithdrawPayload = (req, res, next) => {
    const { transferMode } = req.body || {};
    if (transferMode && !["IMPS", "NEFT", "RTGS", "UPI"].includes(transferMode)) {
        return res.status(400).json({ success: false, message: "Invalid transferMode" });
    }
    next();
};
