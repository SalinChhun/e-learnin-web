"use client"

import {PathRoute} from "@/lib/enums/enums"
import "@/styles/sidebar.css"
import {signOut} from "next-auth/react"
import Link from "next/link"
import {usePathname} from "next/navigation"
import {useEffect, useMemo, useState} from "react"
import usePermissions from "@/lib/hook/usePermissions"

interface NavItem {
    name: string
    href: string
    icon?: string,
    count: number,
    subItems?: NavItem[]
}

export default function Sidebar() {

    const pathname = usePathname()
    const { isAdmin } = usePermissions()
    const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())

    // Check if Admin Management should be expanded (if any sub-menu or create/edit page is active)
    useEffect(() => {
        if (isAdmin && (
            pathname.includes('/admin-management/all-course') ||
            pathname.includes('/admin-management/all-quiz') ||
            pathname.includes('/admin-management/certificate-templates') ||
            pathname.includes('/admin-management/approval') ||
            pathname.includes('/admin-management/create-course') ||
            pathname.includes('/admin-management/edit-course') ||
            pathname.includes('/admin-management/create-quiz') ||
            pathname.includes('/admin-management/edit-quiz')
        )) {
            setExpandedMenus(new Set(['admin-management']))
        }
    }, [pathname, isAdmin])

    const navigation: NavItem[] = useMemo(() => {
        const baseNavigation: NavItem[] = [
            {name: "Public Courses", icon: "wl-users-menu", href: PathRoute.MY_COURSE, count: 0},
            {name: "My Courses", icon: "wl-partners-menu", href: "/my-courses", count: 0},
        ]

        // Only show Admin Management and User Management if user is admin
        if (isAdmin) {
            baseNavigation.push({
                name: "Admin Management", 
                icon: "wl-apis-menu", 
                href: "/admin-management/all-course", 
                count: 0,
                subItems: [
                    {name: "All Course", href: "/admin-management/all-course", count: 0},
                    {name: "Quiz/Exam", href: "/admin-management/all-quiz", count: 0},
                    {name: "Certificate Templates", href: "/admin-management/certificate-templates", count: 0},
                    {name: "Approval", href: "/admin-management/approval", count: 0}
                ]
            })
            baseNavigation.push(
                {name: "User Management", icon: "api-icon", href: "/users", count: 0}
            )
        }

        return baseNavigation
    }, [isAdmin]);

    const toggleMenu = (menuName: string) => {
        setExpandedMenus(prev => {
            const newSet = new Set(prev)
            if (newSet.has(menuName)) {
                newSet.delete(menuName)
            } else {
                newSet.add(menuName)
            }
            return newSet
        })
    }

    return (
        <>
            <aside className="wl-sidebar wl-sidebar-bg-color border-end wl-px-12">
                <div className="d-flex flex-column wl-gap-20">
                    <div className="d-flex align-items-center wl-gap-10">
                        <div style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#003D7A',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg width="24" height="24" viewBox="0 0 80 80" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M58.8401 37.844C59.1981 37.6861 59.502 37.4266 59.7139 37.0976C59.9259 36.7687 60.0368 36.3848 60.0327 35.9935C60.0287 35.6022 59.9099 35.2207 59.6912 34.8962C59.4724 34.5717 59.1633 34.3185 58.8021 34.168L41.6601 26.36C41.139 26.1223 40.5729 25.9993 40.0001 25.9993C39.4273 25.9993 38.8612 26.1223 38.3401 26.36L21.2001 34.16C20.844 34.316 20.5411 34.5723 20.3284 34.8976C20.1157 35.223 20.0024 35.6033 20.0024 35.992C20.0024 36.3807 20.1157 36.761 20.3284 37.0864C20.5411 37.4117 20.844 37.6681 21.2001 37.824L38.3401 45.64C38.8612 45.8777 39.4273 46.0007 40.0001 46.0007C40.5729 46.0007 41.139 45.8777 41.6601 45.64L58.8401 37.844Z"
                                    stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M60 36V48" stroke="white" strokeWidth="4" strokeLinecap="round"
                                      strokeLinejoin="round"/>
                                <path
                                    d="M28 41V48C28 49.5913 29.2643 51.1174 31.5147 52.2426C33.7652 53.3679 36.8174 54 40 54C43.1826 54 46.2348 53.3679 48.4853 52.2426C50.7357 51.1174 52 49.5913 52 48V41"
                                    stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>

                        <div className="d-flex flex-column">
                            <span style={{fontSize: '16px', fontWeight: '600', color: '#003D7A'}}>PPCBank</span>
                            <span style={{fontSize: '12px', color: '#6B7280'}}>E-Learning</span>
                        </div>

                    </div>
                </div>
                <div className="wl-sidebar-collapse-wrapper accordion" id="SidebarMenuWrapperId">
                    <ul className="wl-sidebar-menu-container">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || (pathname.includes(item.href) && !item.subItems);
                            const hasSubItems = item.subItems && item.subItems.length > 0
                            const isExpanded = expandedMenus.has(item.name.toLowerCase().replace(/\s+/g, '-'))
                            
                            return (
                                <li key={item.name} style={{ listStyle: 'none' }}>
                                    {hasSubItems ? (
                                        <>
                                            <div 
                                                onClick={() => toggleMenu(item.name.toLowerCase().replace(/\s+/g, '-'))}
                                                className={`wl-sidebar-menu ${item.icon}`}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <label className="wl-sidebar-menu-title">{item.name}</label>
                                                {item.count > 0 && <span className="wl-sidebar-menu-badge">{item.count}</span>}
                                                <svg 
                                                    width="16" 
                                                    height="16" 
                                                    viewBox="0 0 16 16" 
                                                    fill="none"
                                                    style={{
                                                        marginLeft: 'auto',
                                                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                        transition: 'transform 0.2s'
                                                    }}
                                                >
                                                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </div>
                                            {isExpanded && (
                                                <ul style={{ paddingLeft: '24px', marginTop: '4px', listStyle: 'none' }}>
                                                    {item.subItems?.map((subItem) => {
                                                        // Check if sub-item is active, including create/edit pages
                                                        let isSubActive = pathname.includes(subItem.href)
                                                        
                                                        // For "All Course" sub-item, also check create-course and edit-course
                                                        if (subItem.href === '/admin-management/all-course') {
                                                            isSubActive = isSubActive || 
                                                                pathname.includes('/admin-management/create-course') ||
                                                                pathname.includes('/admin-management/edit-course')
                                                        }
                                                        
                                                        // For "Quiz/Exam" sub-item, also check create-quiz and edit-quiz
                                                        if (subItem.href === '/admin-management/all-quiz') {
                                                            isSubActive = isSubActive || 
                                                                pathname.includes('/admin-management/create-quiz') ||
                                                                pathname.includes('/admin-management/edit-quiz')
                                                        }
                                                        
                                                        return (
                                                            <li key={subItem.name} style={{ listStyle: 'none' }}>
                                                                <Link href={subItem.href} className="wl-sidebar-menu-title" style={{ textDecoration: 'none' }}>
                                                                    <div 
                                                                        className={`wl-sidebar-menu ${isSubActive ? "wl-active" : ""}`}
                                                                        style={{
                                                                            backgroundColor: isSubActive ? '#003D7A' : 'transparent',
                                                                            color: isSubActive ? 'white' : '#6B7280',
                                                                            padding: '8px 12px',
                                                                            borderRadius: '8px',
                                                                            marginBottom: '4px',
                                                                            fontSize: '14px',
                                                                            fontWeight: isSubActive ? '500' : '400'
                                                                        }}
                                                                    >
                                                                        <label className="wl-sidebar-menu-title" style={{ margin: 0, cursor: 'pointer' }}>
                                                                            {subItem.name}
                                                                        </label>
                                                                    </div>
                                                                </Link>
                                                            </li>
                                                        )
                                                    })}
                                                </ul>
                                            )}
                                        </>
                                    ) : (
                                        <Link href={item.href} className="wl-sidebar-menu-title" style={{ textDecoration: 'none' }}>
                                            <div className={`wl-sidebar-menu ${item.icon} ${isActive ? "wl-active" : ""}`}>
                                                <label className="wl-sidebar-menu-title">{item.name}</label>
                                                {item.count > 0 &&
                                                    <span className="wl-sidebar-menu-badge">{item.count}</span>}
                                            </div>
                                        </Link>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                </div>
                <div className="mt-auto d-flex flex-column wl-gap-20">

                    <div
                        onClick={() => signOut({callbackUrl: '/'})}
                        className="d-flex align-items-center wl-gap-10 wl-px-10 wl-height-36"
                        style={{cursor: 'pointer', color: '#6B7280'}}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.66675 11.3333L10.0001 8L6.66675 4.66666" stroke="currentColor"
                                  strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 8H2" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round"
                                  strokeLinejoin="round"/>
                        </svg>
                        <label style={{cursor: 'pointer', fontSize: '14px', color: '#6B7280', margin: 0}}>Logout</label>
                    </div>

                </div>
            </aside>
        </>
    )
}

