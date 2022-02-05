/**
 * @jest-environment node
 */
import { createCapcha, solveCaptcha } from "./captchaLogic";

describe("emailCaptcha.ts", () => {
    beforeAll(() => {
        const { TextEncoder, TextDecoder } = require('util');
        global.TextEncoder = TextEncoder;
        global.TextDecoder = TextDecoder;
        global.crypto = require("crypto").webcrypto;
    })

    it("can create captchas and returns the answer again when solved correctly", async () => {
        const secret = "You've revealed the secret!";

        const captcha = await createCapcha({ enUs: "What's 2*9?", deDe: "Was ist 2*9?" }, "18", secret);
        const retrievedSecret = await solveCaptcha(captcha, "18");

        expect(retrievedSecret).toBe(secret);
    });

    it("fails to decrypt without the right answer", async () => {
        const secret = "You've revealed the secret!";

        const captcha = await createCapcha({ enUs: "What's 2*9?", deDe: "Was ist 2*9?" }, "18", secret);
        const retrievedSecret = await solveCaptcha(captcha, "Keine Ahnung");

        expect(retrievedSecret).toBeNull();
    });
});
