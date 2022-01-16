import React from 'react';
import "./Imprint.css"
import { createImprintElement } from './NativeImprint';

export default function Imprint() {
    const captchaRef = React.useRef(null);
    return <div ref={x => x?.childElementCount === 0 && x.append(createImprintElement())} />;
}
