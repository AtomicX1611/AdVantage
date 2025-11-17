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
      <b id={styles.priceRange}>Price Range</b>
      <div id={styles.minAndMax}>
        <input
          type="number"
          name="min"
          placeholder="min"
          value={filters.min}
          onChange={handleInput}
        />
        <input
          type="number"
          name="max"
          placeholder="max"
          value={filters.max}
          onChange={handleInput}
        />
        <button id={styles.filterApply} onClick={handleApply}>
          <b>Apply</b>
        </button>
      </div>

      <div id={styles.verifiedWrapper}>
        <input
          type="checkbox"
          name="verifiedOnly"
          checked={filters.verifiedOnly}
          onChange={handleInput}
          id={styles.verifiedCheckbox}
        />
        <b>Only verified</b>
      </div>

      <div id={styles.rentedwrapper}>
        <input
          type="checkbox"
          name="rentalOnly"
          checked={filters.rentalOnly}
          onChange={handleInput}
          id={styles.rentedCheckbox}
        />
        <b>Only Rental</b>
      </div>
    </div>
  );
};

export default FilterPanel;
