import {useState} from "react";
import toast from "@/utils/toastService";

const UploadImage = ({
                         imageUrl,          // Image URL to display
                         register,          // From react-hook-form
                         name,              // Field name for form registration
                         errors,            // Form errors
                         setValue           // setValue function from react-hook-form
                     }: any) => {

    const [imagePreview, setImagePreview] = useState<string | null>(imageUrl);

    const [imageRemoved, setImageRemoved] = useState(false);

    //TODO: Register the file input with react-hook-form
    const fileInputRegister = register(name);
    const removedFlagRegister = register("image_removed");

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {

            //TODO: Validate file is an image
            if (!file.type.startsWith('image/')) {
                event.target.value = ''; // Clear input
                toast.error('Please upload an image file');
                return;
            }

            //TODO: Validate file size (max 2MB)
            const MAX_SIZE = 2 * 1024 * 1024; // 2MB in bytes
            if (file.size > MAX_SIZE) {
                event.target.value = ''; // Clear input
                toast.error('File size must be 2MB or smaller');
                return;
            }

            //TODO: Read the file and update state
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setImageRemoved(false);
                if (setValue) {
                    setValue("image_removed", false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setImageRemoved(true);

        // Update the hidden input that tracks image removal
        if (setValue) {
            setValue("image_removed", true);
        } else {
            // Fallback for when setValue is not available
            const hiddenInput = document.querySelector('input[name="image_removed"]') as HTMLInputElement;
            if (hiddenInput) {
                hiddenInput.value = "true";
            }
        }
    };


    const getFileExtension = (url: string): string => {
        const pathname = new URL(url).pathname;
        return pathname.split('.').pop() || 'png';
    };

    const handleDownloadImage = async (e:any) => {
        e.preventDefault();
        if (imagePreview) {
            try {
                // Create a new anchor element
                const link = document.createElement('a');

                // If the image is a URL from server (not a data URL)
                if (imagePreview.startsWith('http')) {
                    // Fetch the image first
                    const response = await fetch(imagePreview);
                    const blob = await response.blob();

                    // Create object URL from blob
                    const objectUrl = URL.createObjectURL(blob);

                    // Set download attributes
                    link.href = objectUrl;
                    link.download = 'profile-image.' + getFileExtension(imagePreview);

                    // Trigger download
                    document.body.appendChild(link);
                    link.click();

                    // Clean up
                    document.body.removeChild(link);
                    URL.revokeObjectURL(objectUrl);
                } else {
                    // For data URLs
                    link.href = imagePreview;
                    link.download = 'profile-image.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            } catch (error) {
                console.error("Error downloading image:", error);
                toast.error('Error downloading image');
            }
        }
    };

    return (
        <div
            className="d-flex flex-column gap-3 justify-content-center align-items-center"
        >
            {/* Hidden input to track if image was removed */}
            <input
                type="hidden"
                name={removedFlagRegister.name}
                ref={removedFlagRegister.ref}
                onChange={removedFlagRegister.onChange}
                onBlur={removedFlagRegister.onBlur}
                value={imageRemoved ? "true" : "false"}
            />

            <div className="wl-avatar-wrapper">
                <figure>
                    {imagePreview ? (
                        <img style={{objectFit: 'cover'}} src={imagePreview} alt="Profile Preview"
                             className="wl-avatar-image"/>
                    ) : (
                        <span className="wl-figure-placeholder"></span>
                    )}
                </figure>
            </div>

            <div
                className="d-flex flex-column justify-content-center align-items-center gap-2"
            >
                <div className="d-flex flex-column gap-1">
                    <span className="wl-button-md text-center">Profile Picture</span>
                    <span className="wl-caption wl-text-tertiary text-center">
                        PNG, JPG, Max. 2MB
                    </span>
                </div>

                {!imagePreview ? (
                    <div className="d-flex">
                        <button
                            type="button"
                            className="wl-position-relative wl-btn-primary-outline wl-btn-sm"
                        >
                            Upload
                            <input
                                name={fileInputRegister.name}
                                ref={fileInputRegister.ref}
                                onChange={(e) => {
                                    fileInputRegister.onChange(e); // For react-hook-form tracking
                                    handleImageChange(e);         // For preview
                                }}
                                onBlur={fileInputRegister.onBlur}
                                type="file"
                                accept="image/png, image/jpeg"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    opacity: 0,
                                    cursor: 'pointer'
                                }}
                            />
                        </button>
                    </div>
                ) : (
                    <div className="d-flex gap-2">
                        <button
                            type="button"
                            className="wl-position-relative wl-btn-primary-outline wl-btn-sm"
                            onClick={handleDownloadImage}
                        >
                            Download
                        </button>

                        <button
                            type="button"
                            className="wl-position-relative wl-btn-primary-outline wl-btn-sm"
                        >
                            Replace
                            <input
                                name={fileInputRegister.name}
                                ref={fileInputRegister.ref}
                                onChange={(e) => {
                                    fileInputRegister.onChange(e); // For react-hook-form tracking
                                    handleImageChange(e);         // For preview
                                }}
                                onBlur={fileInputRegister.onBlur}
                                type="file"
                                accept="image/png, image/jpeg"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    opacity: 0,
                                    cursor: 'pointer'
                                }}
                            />
                        </button>

                        <button
                            type="button"
                            className="wl-position-relative wl-btn-primary-outline wl-btn-sm upload-img-border-error"
                            onClick={handleRemoveImage}
                        >
                            Remove
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadImage;