import SellerPayoutAccount from "../models/SellerPayoutAccount.js";
import SellerWithdrawal from "../models/SellerWithdrawal.js";
import PendingPayouts from "../models/PendingPayouts.js";

export const getActivePayoutAccountBySellerDao = async (sellerId) => {
    return SellerPayoutAccount.findOne({ sellerId, isActive: true });
};

export const createPayoutAccountDao = async (payload) => {
    return SellerPayoutAccount.create(payload);
};

export const getWithdrawablePayoutsDao = async (sellerId, sellerPayoutTypes, session = null) => {
    const query = {
        recipientId: sellerId,
        status: { $in: ["Pending", "Processed"] },
        payoutType: { $in: sellerPayoutTypes },
        withdrawalRequestId: null,
    };

    return PendingPayouts.find(query).session(session);
};

export const createSellerWithdrawalDao = async (payload, session = null) => {
    return SellerWithdrawal.create([payload], { session }).then((rows) => rows[0]);
};

export const updateSellerWithdrawalDao = async (withdrawalId, updateData) => {
    return SellerWithdrawal.findByIdAndUpdate(withdrawalId, { $set: updateData }, { new: true });
};

export const markPayoutsAsLinkedToWithdrawalDao = async ({ payoutIds, withdrawalId, idempotencyKey }, session = null) => {
    return PendingPayouts.updateMany(
        { _id: { $in: payoutIds } },
        {
            $set: {
                withdrawalRequestId: withdrawalId,
                idempotencyKey,
            },
        },
        { session }
    );
};

export const markWithdrawalPayoutExecutionDao = async ({ payoutIds, payoutId, transferMode, failureCode, failureReason }) => {
    const isFailure = Boolean(failureReason);
    return PendingPayouts.updateMany(
        { _id: { $in: payoutIds } },
        {
            $set: {
                status: isFailure ? "Pending" : "Processed",
                externalPayoutId: payoutId || null,
                payoutProcessedAt: isFailure ? null : new Date(),
                payoutFailureCode: failureCode || null,
                payoutFailureReason: failureReason || null,
                transferMode: transferMode || null,
            },
        }
    );
};

export const unlinkPayoutsFromWithdrawalDao = async (payoutIds, failureReason) => {
    return PendingPayouts.updateMany(
        { _id: { $in: payoutIds } },
        {
            $set: {
                withdrawalRequestId: null,
                payoutFailureReason: failureReason || "Withdrawal attempt failed",
            },
        }
    );
};

export const getSellerWithdrawalsDao = async (sellerId) => {
    return SellerWithdrawal.find({ sellerId })
        .populate("payoutAccountId", "accountType accountNumberMasked upiId holderName")
        .sort({ initiatedAt: -1 });
};

export const getLatestWithdrawalBySellerDao = async (sellerId) => {
    return SellerWithdrawal.findOne({ sellerId }).sort({ initiatedAt: -1 });
};

export const getProcessingWithdrawalBySellerDao = async (sellerId) => {
    return SellerWithdrawal.findOne({ sellerId, status: { $in: ["Initiated", "Processing"] } });
};
