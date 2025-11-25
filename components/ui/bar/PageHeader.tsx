'use client'

import DropdownProfile from "@/components/shared/DropdownProfile";
import { usePathname } from "next/navigation";

interface PageHeaderProps {
    title?: string
    subtitle?: string
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
    const pathname = usePathname()
    
    // Default values based on pathname if not provided
    const getDefaultTitle = () => {
        if (title) return title
        if (pathname.includes('/admin-management')) return 'Admin Management'
        if (pathname.includes('/courses')) return 'Public Courses'
        if (pathname.includes('/my-courses')) return 'My Courses'
        if (pathname.includes('/users')) return 'User Management'
        return 'Page'
    }
    
    const getDefaultSubtitle = () => {
        if (subtitle) return subtitle
        if (pathname.includes('/admin-management')) return 'Create and manage courses, quizzes, and certificates'
        if (pathname.includes('/courses')) return 'Manage all published courses and monitor learner progress'
        if (pathname.includes('/my-courses')) return 'View and manage your enrolled courses'
        if (pathname.includes('/users')) return 'Manage user accounts and permissions'
        return ''
    }
    
    const pageTitle = getDefaultTitle()
    const pageSubtitle = getDefaultSubtitle()

    return (
        <>
            {/*<div className="wl-page-header">*/}
                <div className="wl-header-content">
                    <div className="d-flex justify-content-between align-items-start" style={{marginBottom: '8px'}}>
                        <div className="d-flex flex-column gap-2">
                            <h1 style={{
                                fontSize: '24px',
                                fontWeight: '700',
                                color: '#003D7A',
                                margin: 0,
                                lineHeight: '1.2'
                            }}>
                                {pageTitle}
                            </h1>
                            {pageSubtitle && (
                            <p style={{fontSize: '14px', color: '#9CA3AF', margin: 0, fontWeight: '400px'}}>
                                    {pageSubtitle}
                            </p>
                            )}
                        </div>
                        {/*{*/}
                        {/*    pathname.includes('/courses') &&*/}
                            <div className="d-flex align-items-center gap-4">
                                <div className="position-relative" style={{cursor: 'pointer', marginTop: '5px'}}>
                                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M6.84529 14C6.96232 14.2027 7.13064 14.371 7.33332 14.488C7.53601 14.605 7.76592 14.6666 7.99996 14.6666C8.234 14.6666 8.46391 14.605 8.6666 14.488C8.86928 14.371 9.0376 14.2027 9.15463 14"
                                            stroke="#364153" strokeWidth="1.33333" strokeLinecap="round"
                                            strokeLinejoin="round"/>
                                        <path
                                            d="M2.17467 10.2173C2.08758 10.3128 2.0301 10.4315 2.00924 10.559C1.98837 10.6865 2.00501 10.8173 2.05714 10.9356C2.10926 11.0538 2.19462 11.1544 2.30284 11.225C2.41105 11.2956 2.53745 11.3332 2.66667 11.3333H13.3333C13.4625 11.3334 13.589 11.2959 13.6972 11.2254C13.8055 11.1549 13.891 11.0545 13.9433 10.9363C13.9955 10.8182 14.0123 10.6874 13.9916 10.5598C13.9709 10.4323 13.9136 10.3135 13.8267 10.218C12.94 9.30398 12 8.33265 12 5.33331C12 4.27245 11.5786 3.25503 10.8284 2.50489C10.0783 1.75474 9.06087 1.33331 8 1.33331C6.93914 1.33331 5.92172 1.75474 5.17157 2.50489C4.42143 3.25503 4 4.27245 4 5.33331C4 8.33265 3.05933 9.30398 2.17467 10.2173Z"
                                            stroke="#364153" strokeWidth="1.33333" strokeLinecap="round"
                                            strokeLinejoin="round"/>
                                    </svg>
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '-4px',
                                            right: '-6px',
                                            minWidth: '18px',
                                            height: '16px',
                                            backgroundColor: '#EF4444',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '0 6px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            color: 'white',
                                            border: 'none',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        2
                                    </div>
                                </div>
                                <DropdownProfile/>
                            </div>
                        {/*}*/}
                    </div>
                </div>
            {/*</div>*/}
        </>
    );
}
