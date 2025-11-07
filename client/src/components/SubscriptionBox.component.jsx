import { Link } from "react-router-dom";
import React from "react";
import classes from "../styles/sellerSubscription.module.css";

const SubscriptionBox = ({ plan, currentPlan }) => {
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

      {/* ✅ Use React Router Link instead of <a> */}
      {canSubscribe && plan.link && (
        <Link to={plan.link}>
          <div className={classes["payment-btn"]}>
            {currentPlan === 1 && plan.id === 2 ? "Upgrade" : "Subscribe"}
          </div>
        </Link>
      )}
    </div>
  );
};

export default SubscriptionBox;
