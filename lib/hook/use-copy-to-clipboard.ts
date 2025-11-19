'use client';

import { useState, useEffect } from "react";

type CopiedValue = string | null;
type CopyFn = (text: string) => Promise<boolean>;

function useCopyToClipboard(): [CopiedValue, CopyFn] {
    const [copiedText, setCopiedText] = useState<CopiedValue>(null);
    const [isClipboardAvailable, setIsClipboardAvailable] = useState<boolean>(false);

    useEffect(() => {
        setIsClipboardAvailable(
            typeof navigator !== "undefined" &&
            typeof navigator.clipboard !== "undefined"
        );
    }, []);

    const copy: CopyFn = async (text) => {
        const textToCopy = String(text || '').trim();
        
        if (!textToCopy) {
            console.warn("No text to copy");
            return false;
        }

        if (isClipboardAvailable) {
            try {
                await navigator.clipboard.writeText(textToCopy);
                setCopiedText(textToCopy);
                return true;
            } catch (error) {
                console.warn("Primary clipboard method failed", error);
            }
        }

        try {
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            
            if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(textArea);
                
                if (selection) {
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
                textArea.setSelectionRange(0, 999999);
            } else {
                textArea.select();
            }
            
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                setCopiedText(textToCopy);
                return true;
            }
        } catch (fallbackError) {
            console.error("Fallback copy method failed", fallbackError);
        }
        
        setCopiedText(null);
        return false;
    };

    return [copiedText, copy];
}

export default useCopyToClipboard;