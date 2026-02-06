import React from "react";
import styles from "../../styles/searchpage.module.css";

const FilterPanel = ({ filters, onChange }) => {
  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    onChange({
      ...filters,
      [name]:
        type === "checkbox"
          ? checked
          : value === ""
          ? ""
          : parseFloat(value) || "",
    });
  };

  const handleApply = () => {
    onChange({ ...filters }); // just reapply
  };

  return (
    <div id={styles.filterContainer}>
      <div className={styles.filterSection}>
        <span id={styles.priceRange}>Price Range</span>
        <div id={styles.minAndMax}>
          <input
            type="number"
            name="min"
            placeholder="Min ₹"
            value={filters.min}
            onChange={handleInput}
          />
          <input
            type="number"
            name="max"
            placeholder="Max ₹"
            value={filters.max}
            onChange={handleInput}
          />
        </div>
        <button id={styles.filterApply} onClick={handleApply}>
          Apply Filters
        </button>
      </div>

      <div className={styles.filterDivider}></div>

      <label id={styles.verifiedWrapper}>
        <input
          type="checkbox"
          name="verifiedOnly"
          checked={filters.verifiedOnly}
          onChange={handleInput}
          id={styles.verifiedCheckbox}
        />
        <b>Verified Sellers Only</b>
      </label>

      <label id={styles.rentedwrapper}>
        <input
          type="checkbox"
          name="rentalOnly"
          checked={filters.rentalOnly}
          onChange={handleInput}
          id={styles.rentedCheckbox}
        />
        <b>Rental Products Only</b>
      </label>
    </div>
  );
};

export default FilterPanel;
