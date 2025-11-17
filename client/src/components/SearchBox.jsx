import React from "react";
import styles from "../styles/header.module.css";

const SearchBox = () => {
  return (
    <form className={styles["search-box"]} action="/search/noFilter" method="get">
      <div className={styles["search-input"]}>
        <i className={`bx bx-search-alt ${styles["magnifier"]}`}></i>
        <input
          id="search-products"         /* keep id as original CSS expects */
          name="searchValue"
          type="search"
          placeholder="Search"
        />
      </div>
      {/* optional search button: original had it commented — keep for accessibility */}
      <button id="search-btn" type="submit" style={{ display: "none" }}>
        Search
      </button>
    </form>
  );
};

export default SearchBox;
