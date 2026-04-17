import React from "react";
import classes from "../styles/sellerSubscription.module.css";

const SubscriptionBox = ({ plan, currentPlan, onSubscribe, isPaying }) => {
  const isCurrent = currentPlan === plan.id;

  const canSubscribe =
    (plan.id === 1 && currentPlan < 1) ||
    (plan.id === 2 && currentPlan < 2);

  return (
    <div className={classes.box}>
      <div className={classes.heading}>
        {plan.name} {isCurrent && "(Current Plan)"}
      </div>

      <div className={classes.benfits}>
        <div className={`${classes.yes} ${classes.benfit}`}>
          <ul>
            <li>{plan.price}</li>
          </ul>
        </div>

        <div className={`${classes.yes} ${classes.benfit}`}>
          <ul>
            <li>{plan.posts}</li>
          </ul>
        </div>

        {plan.features.map((feature, i) => {
          const isNegative = feature.toLowerCase().includes("no");
          return (
            <div
              key={i}
              className={`${isNegative ? classes.no : classes.yes} ${
                classes.benfit
              }`}
            >
              <ul>
                <li>{feature}</li>
              </ul>
            </div>
          );
        })}
      </div>
      {canSubscribe && (
        <button
          type="button"
          className={classes["payment-btn"]}
          onClick={() => onSubscribe?.(plan)}
          disabled={isPaying}
        >
          {isPaying
            ? "Processing..."
            : currentPlan === 1 && plan.id === 2
            ? "Upgrade"
            : "Subscribe"}
        </button>
      )}
    </div>
  );
};

export default SubscriptionBox;
