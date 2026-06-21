import { Country } from "country-state-city";

// All distinct country calling codes, longest first so prefix matching is greedy
// (e.g. a number starting with "1340" matches that before the shorter "1").
const DIAL_CODES = Array.from(
    new Set(
        Country.getAllCountries()
            .map(c => (c.phonecode || "").replace(/\D/g, ""))
            .filter(Boolean)
    )
).sort((a, b) => b.length - a.length);

function detectDialCode(digits: string): string {
    for (const code of DIAL_CODES) {
        if (digits.startsWith(code)) return code;
    }
    return "";
}

/**
 * Builds the stored/display form "+<code> <rest>" from the digits value that
 * react-phone-input-2 emits (country code + number, no "+"). The dial code from the
 * widget is preferred; if absent (e.g. a value loaded from the profile) it's detected.
 */
export function formatPhoneForStore(value: string | null | undefined, dialCode?: string): string {
    const digits = (value || "").replace(/\D/g, "");
    if (!digits) return "";
    let code = (dialCode || "").replace(/\D/g, "");
    if (!code) code = detectDialCode(digits);
    if (code && digits.startsWith(code) && digits.length > code.length) {
        return `+${code} ${digits.slice(code.length)}`;
    }
    return `+${digits}`;
}

/**
 * Parses a stored phone back into the digits value PhoneInput expects plus its dial code.
 * Accepts both the "+<code> <rest>" form and a bare digit string (legacy/profile values).
 */
export function parseStoredPhone(stored: string | null | undefined): { value: string; dialCode: string } {
    if (!stored) return { value: "", dialCode: "" };
    const m = stored.trim().match(/^\+?(\d+)\s+(.+)$/);
    if (m) {
        const code = m[1];
        const rest = m[2].replace(/\D/g, "");
        return { value: code + rest, dialCode: code };
    }
    const digits = stored.replace(/\D/g, "");
    return { value: digits, dialCode: detectDialCode(digits) };
}
