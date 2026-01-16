import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderHeader from "../components/OrderHeader.component";
import PendingTransactionCard from "../components/PendingTransactionCard";
import API_CONFIG from "../config/api.config";
import styles from "../styles/pendingtxs.module.css";

const PendingTxsPage = () => {
	const backendURL = API_CONFIG.BACKEND_URL;
	const [pending, setPending] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const navigate = useNavigate();

	/*
		UseEffect to load pending transactions from backend for the logged in user
		Endpoint : /user/pendingRequests
	*/
	useEffect(() => {
		const fetchPending = async () => {
			try {
				setLoading(true);
				setError("");
				const res = await fetch(`${backendURL}/user/pendingRequests`, {
					method: "GET",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
				});

				const data = await res.json();
				if (!res.ok || data.success === false) {
					setPending([]);
					setError(data.message || "Failed to load pending requests");
					return;
				}
				// Expecting data.requests or data.products — normalize
				const items = data.requests || data.products || [];
				setPending(items);
			} catch (e) {
				console.error("Error fetching pending requests", e);
				setError("Something went wrong while fetching pending requests");
				setPending([]);
			} finally {
				setLoading(false); // Ensure loading stops regardless of success/fail
			}
		};

		fetchPending();
	}, [backendURL]);

	// Placeholder for the handlePay logic (this was missing in your snippet)
	const handlePay = async (item) => {
		console.log("Pay clicked for:", item);
		let response=await fetch(`http://localhost:3000/user/paymentDone/${item._id}`,{
			method:"POST",
			credentials:"include",
			headers: { "Content-Type": "application/json" },	
		});
		let data=await response.json();
		if(data.success){
			alert("Payment Successful");
			navigate('/yourProducts'); // working
		}else {
			alert("Payment Failed");
		}
	};

	const handleNotInterested = async (item) => {
		console.log("Not Interested clicked for:", item);
		let response=await fetch(`http://localhost:3000/user/notInterested/${item._id}`,{
			method:"POST",
			credentials:"include",
			headers: { "Content-Type": "application/json" },
		});
		let data=await response.json();

		if(data.success){
			alert("Marked as Not Interested");
			setPending(prevPending => prevPending.filter(p => p._id !== item._id));
		}else {
			alert("Failed to mark as Not Interested");
		}
	};

	return (
		<div className={styles.window}>
			{/* <OrderHeader /> */}
			<div className={styles["main-container"]}>
				<div style={{ padding: "0.5rem 1rem" }}>
					<h2>Pending Transactions</h2>
				</div>

				{loading && <div className={styles.status}>Loading pending transactions...</div>}
				
				{!loading && error && (
					<div style={{ color: "red", padding: "0.5rem 1rem" }}>{error}</div>
				)}

				{!loading && !error && (
					<div className={styles["product_list"]}>
						{pending.length === 0 ? (
							<div className={styles.status}>No pending transactions.</div>
						) : (
							pending.map((item) => (
								<PendingTransactionCard
									key={item._id}
									item={item}
									backendURL={backendURL}
									onPay={handlePay}
									onNotInterested={handleNotInterested}
								/>
							))
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default PendingTxsPage;