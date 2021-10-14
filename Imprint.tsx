import React from 'react';
import { Link } from 'react-router-dom';
import { CaptchaProtectedData, solveCaptcha } from './emailCaptcha';
import "./Imprint.css"

export interface AddressInfo {
    address1: string;
    address2: string;
    tel: string;
    email: string;
}


const captcha: CaptchaProtectedData = { "question": "What is the second syllable of the name of the country directly north of the most populous state in the EU?", "cipherSalt": "780c87594b5f3eb98bdf4d278d225f38", "cipherIv": "e5a85c846d327a4082047004b09ad327", "cipherText": "01827c506fd5c8ac7cf12d648f3bc54e7fa3b822b98d424f459c880ba6bc7e9d292d0ce16f01678c9b85952c9b953fa42c7b6631abb571c5a5f1099b04a40c779e0e1609497b8914ad9779fc21e5b8bde880cb68b338a92d8b8681bf526f6ef89b53514783274b4618e1a27d29a5fd5ef2b643d88b49c7763fc8a54712e412e2baf766a986806b198636f2" };


const AddressContext = React.createContext<AddressInfo | null>(null);
const SetAddressContext = React.createContext<(data: AddressInfo) => void>(() => undefined);

export default function Imprint() {
    return <div className="imprint">
        <h1>Imprint</h1>

        <div className="imprint-address">
            <CaptchaContext>
                <p>
                    Verantwortlicher nach §5 TMG:
                    <br />
                    Georg Wicke-Arndt
                    <br />
                    <CensoredContent addressKey="address1" placeholder="Beispielstraße 123" />
                    <br />
                    <CensoredContent addressKey="address2" placeholder="12345 Neustadt" />
                    <br />
                    Tel.: <CensoredContent addressKey="tel" placeholder="0123 456789" />
                    <br />
                    E-Mail: <CensoredContent addressKey="email" placeholder="georg@example.com" />
                    <br />

                </p>
                <div className="imprint-captcha">
                    <h3>Are you a robot?</h3>
                    To prevent scraping, the adress data is encrypted.
                    Please answer the following question to reveal it.
                    <br />
                    <AddressCaptcha data={captcha} />
                </div>
            </CaptchaContext>
        </div>

        <button onClick={() => window.history.back()} className="fancy-button">
            Go Back
        </button>
    </div>;
}

function CaptchaContext({ children }: React.PropsWithChildren<{}>) {
    const [addressData, setAddressData] = React.useState<AddressInfo | null>(null);
    return <AddressContext.Provider value={addressData}>
        <SetAddressContext.Provider value={setAddressData}>
            {children}
        </SetAddressContext.Provider>
    </AddressContext.Provider>
}

function CensoredContent(props: { addressKey: keyof AddressInfo, placeholder: string }) {
    const { addressKey, placeholder } = props;
    const addressData = React.useContext(AddressContext);
    const data = addressData?.[addressKey];
    if (addressData === null)
        return <span className="imprint-censored">{placeholder}</span>
    else
        return <>{data}</>
}

function AddressCaptcha(props: { data: CaptchaProtectedData }) {
    const answerRef = React.useRef("");
    const activePromise = React.useRef<Promise<any> | null>(null);
    const setAddressData = React.useContext(SetAddressContext);
    const trySolve = (answer: string) => {
        answerRef.current = answer;
        if (!activePromise.current) {
            activePromise.current = solveCaptcha(props.data, answer).then(revealed => {
                activePromise.current = null;
                setAddressData(revealed !== null ? JSON.parse(revealed) : null);
                if (revealed === null && answerRef.current !== answer)
                    trySolve(answerRef.current);
            });
        }
    };
    return <>
        <i>{props.data.question}</i>
        <br />
        <input
            aria-hidden
            type="text"
            placeholder="Type answer here"
            onInput={e => trySolve(e.currentTarget.value)} />
    </>
}
