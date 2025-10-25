import type { JSX } from 'react';
import './fullPageLoader.css';

const FullPageLoader = (): JSX.Element => (
    <div className="full-page-loader">
        <div className="spinner"></div>
    </div>
);

export default FullPageLoader;
