import { captchaData } from './captchaData';
import { solveCaptcha } from './captchaLogic';
import { AddressInfo } from './AddressInfo';
import "./Imprint.css"

// some simple helpers for creating elements
const br = () => document.createElement("br");
const div = (className: string) => {
    const div = document.createElement("div");
    div.className = className;
    return div;
}

/**
 * Creates an imprint element.
 * 
 * @returns A HTML element that can be appended to the document.
 */
export function createImprintElement(language: "deDe" | "enUs" = "enUs"): HTMLDivElement {
    let decryptedData: AddressInfo | null = null;
    const onDataUpdate: (() => void)[] = [];

    function censoredElement(key: keyof AddressInfo, placeholder: string) {
        const censoredElement = document.createElement("span");
        const updateElement = () => {
            if (decryptedData === null) {
                censoredElement.className = "imprint-censored";
                censoredElement.innerText = placeholder;
            }
            if (decryptedData !== null) {
                censoredElement.className = "";
                censoredElement.innerText = decryptedData[key];
            }
        };
        updateElement();
        onDataUpdate.push(updateElement)
        return censoredElement;
    }

    const wrapper = div("imprint-columns");

    const address = div("imprint-address");
    wrapper.appendChild(address);

    address.append(
        "Verantwortlicher nach §5 TMG:", br(),
        "Georg Wicke-Arndt", br(),
        censoredElement("address1", "Beispielstraße 123"), br(),
        censoredElement("address2", "12345 Neustadt"), br(),
        "Tel.: ", censoredElement("tel", "0123 456789"), br(),
        "E-Mail: ", censoredElement("email", "georg@example.com"), br(),
    );

    const captchaElement = div("imprint-captcha");
    wrapper.appendChild(captchaElement);

    captchaElement.innerHTML = {
        enUs: "<h3>Are you a robot?</h3>"
            + "To prevent scraping, the address data is encrypted. "
            + "Please answer the following question to reveal it.",
        deDe: "<h3>Bist du ein Roboter?</h3>"
            + "Um Scraping zu verhindern sind die Adressdaten verschlüsselt."
            + "Bitte beantworte die folgende Frage, um sie aufzudecken."
    }[language];
    captchaElement.append(br());

    const question = document.createElement("i")
    question.innerText = captchaData.question[language];
    captchaElement.append(question, br());

    const answer = document.createElement("input");
    answer.type = "text";
    answer.placeholder = "Type answer here";
    answer.oninput = e => trySolve(answer.value);
    captchaElement.append(answer);

    let currentAnswer = "";
    let activePromise: Promise<any> | null = null;

    const trySolve = (answer: string) => {
        currentAnswer = answer;
        if (!activePromise) {
            activePromise = solveCaptcha(captchaData, answer).then(revealed => {
                activePromise = null;
                decryptedData = revealed !== null ? JSON.parse(revealed) : null;
                if (revealed === null && currentAnswer !== answer)
                    trySolve(currentAnswer);
                else
                    onDataUpdate.forEach(x => x());
            });
        }
    };

    return wrapper;
}
