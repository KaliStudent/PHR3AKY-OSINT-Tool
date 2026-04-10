import { parsePhoneNumberFromString } from "libphonenumber-js";

export function normalizeNumber(input) {
  try {
    const phone = parsePhoneNumberFromString(input, "US");

    if (!phone || !phone.isValid()) {
      return null;
    }

    return phone.number; // E.164 format
  } catch {
    return null;
  }
}
