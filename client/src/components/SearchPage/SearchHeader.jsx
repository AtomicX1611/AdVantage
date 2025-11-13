import React from "react";

export default function SearchHeader() {
  return (
    <header>
      <nav style={{ display: "flex", justifyContent: "space-between", padding: "10px" }}>
        <h2>Advantage</h2>
        <div>
          <input
            id="search-products"
            type="text"
            placeholder="Search products..."
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
          />
        </div>
      </nav>
    </header>
  );
}
