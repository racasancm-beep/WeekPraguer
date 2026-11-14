import jsQR from "jsqr";
import { extractReferralCode } from "@/lib/referral-utils";

export async function scanQRCodeFromImageFile(file: File): Promise<string | null> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    if (!ctx) {
                        resolve(null);
                        return;
                    }

                    // Constrain max size for performance
                    const maxDim = 1200;
                    let width = img.width;
                    let height = img.height;
                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        } else {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    const imageData = ctx.getImageData(0, 0, width, height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: "dontInvert",
                    });

                    if (code && code.data) {
                        resolve(extractReferralCode(code.data));
                        return;
                    }

                    // Try with inversion attempt if first try didn't match
                    const codeInverted = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: "onlyInvert",
                    });

                    if (codeInverted && codeInverted.data) {
                        resolve(extractReferralCode(codeInverted.data));
                        return;
                    }

                    resolve(null);
                } catch (e) {
                    console.error("QR Code image decoding failed:", e);
                    resolve(null);
                }
            };
            img.onerror = () => resolve(null);
            img.src = reader.result as string;
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
    });
}
