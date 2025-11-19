import { IconEnum } from "@/lib/enums/enums";
import { IconComponent } from "./IconComponent";

interface Props {
    message: string; // Required error message text
    icon?: IconEnum;
}

const ErrorMessage = ({ message, icon }: Props) => {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                backgroundColor: '#f8d7da', // Light red background
                color: '#721c24', // Dark red text
                border: '1px solid #f5c6cb', // Slightly darker red border
                borderRadius: '4px',
                fontFamily: 'inherit', // Use default font
                maxWidth: '100%',
                wordWrap: 'break-word',
            }}
        >
            {icon && <IconComponent icon={icon} />}
            <span>{message}</span>
        </div>
    );
};

export default ErrorMessage;