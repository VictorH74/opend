import React from "react";

export default function PriceLabel({sellPrice}) {
    return (
        <div className="disButtonBase-root disChip-root makeStyles-price-23 disChip-outlined">
            <span className="disChip-label">{sellPrice} VITCOIN</span>
        </div>
    );
}