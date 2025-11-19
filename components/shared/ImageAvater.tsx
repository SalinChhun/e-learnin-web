import { NextPage } from "next";
import Image from "next/image";
import { useState, useEffect } from "react";
import styles from "@/styles/ImageAvatar.module.css"
import Avatar from "@/public/icon/avatar.svg"

interface Props {
    width?: number;
    height?: number;
    className?: string;
    src: string | null | undefined;
    alt?: string;
    placeholderSrc?: string;
}

const ImageAvatar: NextPage<Props> = ({
    width = 32,
    height = 32,
    className = "",
    src,
    alt = "Avatar",
    placeholderSrc = Avatar
}) => {
    const [imageSrc, setImageSrc] = useState<string>(placeholderSrc);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (src) {
            setImageSrc(src);
            setIsLoading(true);
        } else {
            setImageSrc(placeholderSrc);
            setIsLoading(false);
        }
    }, [src, placeholderSrc]);

    return (
        <div
            className={`${styles.container} ${className}`}
            style={{ width: `${width}px`, height: `${height}px` }}
        >
            <Image
                src={imageSrc}
                alt={alt}
                width={width}
                height={height}
                className={`${styles.image} ${isLoading ? styles.loading : styles.loaded}`}
                onLoad ={() => setIsLoading(false)}
                onError={() => {
                    setImageSrc(placeholderSrc);
                    setIsLoading(false);
                }}
                priority
            />

            {isLoading && (
                <Image
                    src={placeholderSrc}
                    alt={alt}
                    width={width}
                    height={height}
                    className={`${styles.image} ${isLoading ? styles.loading : styles.loaded}`}
                />
            )}
        </div>
    );
};

export default ImageAvatar;