import React from "react";
import styles from "../styles/pendingtxs.module.css";

const PendingTransactionCard = ({ item, backendURL, onPay, onNotInterested }) => {
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
					<span className={styles.rentalBadge}>For Rent</span>
				)}
				<span className={styles.pendingBadge}>⏳ Pending</span>
			</div>
			
			<div className={styles.cardContent}>
				<h4 className={styles.name}>{item?.name}</h4>
				{item?.description && (
					<p className={styles.description}>{item.description}</p>
				)}
				
				<div className={styles.details}>
					<div className={styles.detailRow}>
						<span className={styles.label}>Seller</span>
						<span className={styles.value}>{sellerName}</span>
					</div>
					<div className={styles.detailRow}>
						<span className={styles.label}>Category</span>
						<span className={styles.value}>{category}</span>
					</div>
					<div className={styles.detailRow}>
						<span className={styles.label}>Location</span>
						<span className={styles.value}>{location}</span>
					</div>
				</div>

				<div className={styles.priceSection}>
					<div className={styles.priceInfo}>
						<h3 className={styles.price}>₹{item?.price?.toLocaleString()}</h3>
						<span className={styles.priceLabel}>
							{isRental ? "Per Day" : "Sale Price"}
						</span>
					</div>
					{biddingPrice && (
						<div className={styles.bidPrice}>
							<span className={styles.bidAmount}>₹{biddingPrice?.toLocaleString()}</span>
							<span className={styles.bidLabel}>Your Bid</span>
						</div>
					)}
				</div>
			</div>

			<div className={styles.actions}>
				<button 
					className={styles.payBtn} 
					onClick={() => onPay(item)}
				>
					Pay Now
				</button>
				<button 
					className={styles.notInterestedBtn} 
					onClick={() => onNotInterested(item)}
				>
					Not Interested
				</button>
			</div>
		</div>
	);
};

export default PendingTransactionCard;
