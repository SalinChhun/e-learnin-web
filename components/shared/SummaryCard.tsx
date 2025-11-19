interface Props {
    title: string;
    value: any;
}

export default function SummaryCard({ title, value }: Props) {

    return (
        <div className="w-100 wl-card">
            <div className="d-flex flex-column gap-2">
                <span className="wl-card-title">{title}</span>
                <span className="wl-card-description">{value}</span>
            </div>
        </div>
    );
}