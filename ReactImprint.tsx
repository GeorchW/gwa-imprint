import React from 'react';
import { Language } from '../../i18n';
import "./Imprint.css"
import { createImprintElement } from './NativeImprint';

export default function Imprint(props: { language: Language }) {
    const { language } = props;
    const [oldLanguage, setOldLanguage] = React.useState<Language>();
    return <div ref={x => {
        if (!x) return;
        if (language !== oldLanguage) {
            x.innerHTML = "";
            setOldLanguage(language);
        }
        if (x.childElementCount === 0) {
            x.append(createImprintElement(props.language))
        }
    }} />;
}
