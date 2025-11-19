export function getImageName(image: string | undefined): string {
    return image?.split("/")?.pop() || '';
}