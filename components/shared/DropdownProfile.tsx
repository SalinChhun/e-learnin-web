"use client"

import { signOut } from "next-auth/react"
import { useState, useEffect, useRef } from "react"
import "@/styles/dropdown-profile.css"
import { useGetMyProfile } from "@/lib/hook/use-common"
import ImageAvater from "./ImageAvater"
import { usePopupStore } from "@/lib/store"
import { PopupTypeEnum } from "@/lib/enums/enums"

function DropdownProfile() {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const {data: profile} = useGetMyProfile();
    const {openPopup, } = usePopupStore();

    const handleLogout = () => {
        openPopup(PopupTypeEnum.LOG_OUT,)
        // if (confirm("Are you sure you want to log out?")) {
        //     signOut({
        //         callbackUrl: `${basePath}/login`,
        //         redirect: true,
        //     })
        // }
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const toggleDropdown = () => {
        setIsOpen(!isOpen)
    }

    return (
        <div className="wl-position-relative" ref={dropdownRef}>
            <div className="wl-cursor-pointer" onClick={toggleDropdown}>
                <div className=" wl-avatar-md wl-cursor-pointer">
                    <ImageAvater alt="profile avatar" src={profile?.data?.image} width={32} height={32} />
                </div>
            </div>

            {isOpen && (
                <div className="dropdown-menu wl-dropdown-menu show">
                    {/* User profile info */}
                    <div className="user-profile-section">
                        <div className="profile-info">
                            <div className="profile-image">
                                <ImageAvater alt="profile avatar" src={profile?.data?.image} width={38} height={38}/>
                            </div>
                            <div className="profile-details">
                                <h6 className="profile-name">{profile?.data?.full_name}</h6>
                                <p className="profile-number">{profile?.data?.email}</p>
                            </div>
                        </div>
                    </div>


                    {/* Menu options */}
                    <ul className="menu-options">
                        <li onClick={handleLogout}  className="menu-item">
                            <div className="menu-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15"
                                        stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"
                                        strokeLinejoin="round"/>
                                    <path d="M10 17L15 12L10 7" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"
                                          strokeLinejoin="round"/>
                                    <path d="M15 12H3" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"
                                          strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div className="menu-text">Log out</div>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    )
}

export default DropdownProfile