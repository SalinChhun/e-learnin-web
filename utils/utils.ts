import {BusinessType} from "@/lib/enums/enums";

export const formatPhoneNumber = (phoneNumber: any, countryCode: any, formatPattern = 'default') => {
    if (!phoneNumber) {
        return null;
    }

    // Remove any existing non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Remove country code if it's at the start
    const localNumber = cleaned.startsWith(countryCode)
        ? cleaned.slice(countryCode.length)
        : cleaned;

    if (localNumber == ""){
            return null;
        }

    // Determine formatting based on different patterns
    switch(formatPattern) {
        case 'default':
            // Format for Cambodian numbers: +CC AA-AAA-AAAA
            return `+${countryCode} ${localNumber.slice(0, 2)}-${localNumber.slice(2, 5)}-${localNumber.slice(5)}`;

        case 'grouped3':
            // Format: +CC AAA-AAA-AAA
            return `+${countryCode} ${localNumber.slice(0, 3)}-${localNumber.slice(3, 6)}-${localNumber.slice(6)}`;

        case 'spaced':
            // Format: +CC AA AA AA AA
            return `+${countryCode} ${localNumber.slice(0, 2)} ${localNumber.slice(2, 4)} ${localNumber.slice(4, 6)} ${localNumber.slice(6, 8)} ${localNumber.slice(8)}`;

        case 'parenthesis':
            // Format: +CC (AA) AAA-AAAA
            return `+${countryCode} (${localNumber.slice(0, 2)}) ${localNumber.slice(2, 5)}-${localNumber.slice(5)}`;

        default:
            // If no specific pattern, use default
            return `+${countryCode} ${localNumber.slice(0, 2)}-${localNumber.slice(2, 5)}-${localNumber.slice(5)}`;
    }
};

export const formatPhoneNumberForSave = (phoneNumber: string, countryCode: string = '855') => {

    if (!phoneNumber){
        return null;
    }
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // If the number already starts with the country code, return as is
    if (cleaned.startsWith(countryCode)) {
        return cleaned;
    }

    // Combine country code with the rest of the number
    return `${countryCode}${cleaned}`;
};

export const formatPhoneNumberReplaceCountryCode = (
    phoneNumber?: string | null,
    countryCode: string = '855'
): string | undefined => {
    // Handle null, undefined, or empty string
    if (!phoneNumber) return undefined;

    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // If the cleaned result is empty, return undefined
    if (!cleaned) return undefined;

    // Handle country code with or without + prefix
    if (cleaned.startsWith(countryCode)) {
        return cleaned.slice(countryCode.length);
    }

    // For international format with + symbol (e.g., +855...)
    if (cleaned.startsWith('00' + countryCode)) {
        return cleaned.slice(countryCode.length + 2); // Skip '00' + country code
    }

    // If the number starts with '0', remove the leading '0'
    if (cleaned.startsWith('0')) {
        return cleaned.slice(1);
    }

    // Return the local number as is
    return cleaned;
};

export const extractBusinessType = (businessType: any) => {
    switch (businessType) {
        case BusinessType.RETAILER:
            return 'Retailer';
        case BusinessType.BUYER:
            return 'Buyer';
        default:
            return 'Unknown';
    }
}