import { createCapcha, solveCaptcha } from './captchaLogic.ts';
import { captchaData } from './captchaData.ts';

// A simple Deno script to update the captcha.

console.log("To update the data, please decrypt the old data first:")
console.log(captchaData.question);
let decrypted: string | null = null;
let answer: string | null = null;
do {
    answer = prompt("> ");
    if (!answer) continue;
    decrypted = await solveCaptcha(captchaData, answer);
    if (!decrypted) {
        console.log("Try again.");
    }
} while (!decrypted);

console.log("Opening an editor...");

const tmpFile = `/tmp/captcha_decrypted_${performance.now()}.json`;
await Deno.writeTextFile(tmpFile, decrypted);
const editor = Deno.run({ cmd: [Deno.env.get("EDITOR") ?? "nano", tmpFile] });
await editor.status();

const newCaptcha = await createCapcha(captchaData.question, answer, await Deno.readTextFile(tmpFile));

await Deno.writeTextFile("./captchaData.ts", `import { CaptchaProtectedData } from "./captchaLogic.ts";

export const captchaData: CaptchaProtectedData = ${JSON.stringify(newCaptcha)};`)
