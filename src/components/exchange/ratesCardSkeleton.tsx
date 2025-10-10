import type { JSX } from "react";
import "./ratesCardSkeleton.css"; // Import the styles

const RatesCardSkeleton = (): JSX.Element => (
    <div className="rates-skeleton-container">
        {/* Skeleton for the Header */}
        <div className="rates-header">
            <div className="skeleton skeleton-avatar"></div>
            <div className="exchange-info" style={{ flex: 1, marginLeft: '12px' }}>
                <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '40%', marginTop: '8px' }}></div>
            </div>
        </div>
        
        {/* Skeleton for the Table Rows */}
        <div className="rates-table" style={{ marginTop: '24px' }}>
            {/* Create a few placeholder rows */}
            {[...Array(4)].map((_, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <div className="skeleton skeleton-text" style={{ flex: 2 }}></div>
                    <div className="skeleton skeleton-text" style={{ flex: 1 }}></div>
                    <div className="skeleton skeleton-text" style={{ flex: 1 }}></div>
                </div>
            ))}
        </div>
    </div>
);

export default RatesCardSkeleton;