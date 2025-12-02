import React from "react";
import styles from "../styles/pendingtxs.module.css";

const PendingTransactionCard = ({ item, backendURL, onPay }) => {
	const imageSrc = item?.images?.[0]
		? `${backendURL}/${item.images[0]}`
		: "/Assets/placeholder.png";

	const sellerName = item?.seller?.username || "Unknown Seller";
	const isRental = item?.isRental ?? false;
	const category = item?.category || "N/A";
	const location = [item?.city, item?.district, item?.state]
		.filter(Boolean)
		.join(", ") || "N/A";
	

	const buyerRequest = item?.requests?.find(request => request.buyer?._id === item?.sellerAcceptedTo);
    // console.log(buyerRequest);
	const biddingPrice = buyerRequest?.biddingPrice;

	return (
		<div className={styles.card}>
			<div className={styles.imageContainer}>
				<img 
					className={styles.image} 
					src={imageSrc} 
					alt={item?.name || "Product"} 
				/>
				{isRental && (
					<span className={styles.rentalBadge}>Rental</span>
				)}
			</div>
			
			<div className={styles.cardContent}>
				<h4 className={styles.name}>{item?.name}</h4>
				<p className={styles.description}>
					{item?.description?.substring(0, 80)}
					{item?.description?.length > 80 ? "..." : ""}
				</p>
				
				<div className={styles.details}>
					<div className={styles.detailRow}>
						<span className={styles.label}>Seller:</span>
						<span className={styles.value}>{sellerName}</span>
					</div>
					<div className={styles.detailRow}>
						<span className={styles.label}>Category:</span>
						<span className={styles.value}>{category}</span>
					</div>
					<div className={styles.detailRow}>
						<span className={styles.label}>Location:</span>
						<span className={styles.value}>{location}</span>
					</div>
					{biddingPrice && (
						<div className={styles.detailRow}>
							<span className={styles.label}>Your Bid:</span>
							<span className={styles.value}>Rs. {biddingPrice}/-</span>
						</div>
					)}
				</div>

				<div className={styles.priceSection}>
					<h3 className={styles.price}>Rs. {item?.price}/-</h3>
					<span className={styles.priceLabel}>
						{isRental ? "Rental Price" : "Sale Price"}
					</span>
				</div>
			</div>

			<div className={styles.actions}>
				<button 
					className={styles.payBtn} 
					onClick={() => onPay(item)}
				>
					Pay Now
				</button>
			</div>
		</div>
	);
};

export default PendingTransactionCard;
