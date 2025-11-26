'use client'

interface CourseVideoPlayerProps {
    videoUrl?: string | null
    className?: string
    style?: React.CSSProperties
}

export default function CourseVideoPlayer({ 
    videoUrl, 
    className,
    style 
}: CourseVideoPlayerProps) {
    if (videoUrl) {
        return (
            <div
                style={{
                    backgroundColor: '#000000',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    overflow: 'hidden',
                    ...style
                }}
                className={className}
            >
                <video
                    src={videoUrl}
                    controls
                    style={{
                        width: '100%',
                        display: 'block',
                        maxHeight: '600px',
                        backgroundColor: '#000'
                    }}
                    preload="metadata"
                >
                    Your browser does not support the video tag.
                </video>
            </div>
        )
    }

    return (
        <div
            style={{
                backgroundColor: '#F3F4F6',
                borderRadius: '12px',
                marginBottom: '24px',
                padding: '60px 24px',
                textAlign: 'center',
                color: '#9CA3AF',
                ...style
            }}
            className={className}
        >
            <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ margin: '0 auto 16px', display: 'block' }}
            >
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            <p style={{ margin: 0, fontSize: '14px' }}>No video available for this course</p>
        </div>
    )
}

