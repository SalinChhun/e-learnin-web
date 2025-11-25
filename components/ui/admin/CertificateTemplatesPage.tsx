'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Spinner } from 'react-bootstrap'
import PageHeader from '@/components/ui/bar/PageHeader'
import { useFetchCertificateTemplates, useFetchCertificateTemplatesInfinite, useDeleteCertificateTemplate } from '@/lib/hook/use-course'
import CreateCertificateTemplateModal from '@/components/ui/admin/CreateCertificateTemplateModal'
import EditCertificateTemplateModal from '@/components/ui/admin/EditCertificateTemplateModal'
import CertificatePreviewModal from '@/components/ui/admin/CertificatePreviewModal'
import dayjs from 'dayjs'

type FilterStatus = 'all' | 'active' | 'draft'

export default function CertificateTemplatesPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const { mutation: deleteTemplateMutation, isPending: isDeleting } = useDeleteCertificateTemplate()
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search_value') || '')
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchParams.get('search_value') || '')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [editTemplateId, setEditTemplateId] = useState<number | null>(null)
    const [previewTemplate, setPreviewTemplate] = useState<{
        id: number
        name: string
        description: string
        template_image_url: string
    } | null>(null)
    
    // Map filter to API status: 1=DRAFT, 2=ACTIVE, undefined=all
    const apiStatus = filterStatus === 'active' ? 2 : filterStatus === 'draft' ? 1 : undefined
    
    // Always fetch all templates for summary (first page only for summary)
    const { summary: allSummary } = useFetchCertificateTemplates(undefined)
    
    // Use infinite scroll for filtered templates
    const { 
        templates, 
        summary, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage, 
        isLoading, 
        error 
    } = useFetchCertificateTemplatesInfinite(apiStatus, 10, debouncedSearchQuery || undefined)

    // Debounce search query
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }
        
        searchTimeoutRef.current = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery)
        }, 500)
        
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [searchQuery])

    // Update URL params when search changes
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())
        
        if (debouncedSearchQuery) {
            params.set('search_value', debouncedSearchQuery)
        } else {
            params.delete('search_value')
        }
        
        router.push(`?${params.toString()}`, { scroll: false })
    }, [debouncedSearchQuery, router, searchParams])

    // Use all summary for display (it has the complete stats)
    const displaySummary = allSummary

    // Infinite scroll handler - using container scroll
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
        
        // Load more when user scrolls to 80% of the container
        if (
            scrollHeight - scrollTop <= clientHeight * 1.2 &&
            hasNextPage &&
            !isFetchingNextPage &&
            !isLoading
        ) {
            fetchNextPage()
        }
    }, [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage])

    const handleCreateTemplate = () => {
        setIsCreateModalOpen(true)
    }

    const handlePreview = (templateId: number) => {
        // Find the template from the current templates list
        const template = templates.find(t => t.id === templateId)
        if (template) {
            setPreviewTemplate({
                id: template.id,
                name: template.name,
                description: template.description,
                template_image_url: template.template_image_url
            })
        }
    }

    const handleEdit = (templateId: number) => {
        setEditTemplateId(templateId)
    }

    const handleDelete = (templateId: number) => {
        if (confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
            deleteTemplateMutation(templateId, {
                onSuccess: () => {
                    // Template list will refresh automatically via query invalidation
                },
            })
        }
    }

    const getStatusBadgeColor = (status: string) => {
        if (status.toLowerCase() === 'active') {
            return { backgroundColor: '#10B981', color: 'white' }
        } else if (status.toLowerCase() === 'draft') {
            return { backgroundColor: '#F59E0B', color: 'white' }
        }
        return { backgroundColor: '#6B7280', color: 'white' }
    }

    const getTemplateCardColor = (index: number) => {
        const colors = ['#003D7A', '#3B82F6', '#F59E0B', '#8B5CF6', '#10B981']
        return colors[index % colors.length]
    }

    if (isLoading && !displaySummary) {
        return (
            <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spinner animation="border" />
            </div>
        )
    }

    if (error) {
        return (
            <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
                <div style={{ marginTop: '32px', textAlign: 'center', color: '#EF4444' }}>
                    <p>Error loading certificate templates. Please try again.</p>
                </div>
            </div>
        )
    }

    return (
        <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <PageHeader 
                        title="Certificate Templates"
                        subtitle="Design and manage digital certificates for course completion"
                    />
                </div>
                
                {/* Search Bar and Create Button */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <div style={{ position: 'relative', maxWidth: '400px', flex: 1 }}>
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                zIndex: 1
                            }}
                        >
                            <path
                                d="M8.25 14.25C11.5637 14.25 14.25 11.5637 14.25 8.25C14.25 4.93629 11.5637 2.25 8.25 2.25C4.93629 2.25 2.25 4.93629 2.25 8.25C2.25 11.5637 4.93629 14.25 8.25 14.25Z"
                                stroke="#9CA3AF"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M15.75 15.75L12.4875 12.4875"
                                stroke="#9CA3AF"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                height: '30px',
                                padding: '10px 16px 10px 44px',
                                backgroundColor: '#F3F4F6',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                                e.target.style.backgroundColor = '#FFFFFF'
                                e.target.style.boxShadow = '0 0 0 3px rgba(0, 61, 122, 0.1)'
                            }}
                            onBlur={(e) => {
                                e.target.style.backgroundColor = '#F3F4F6'
                                e.target.style.boxShadow = 'none'
                            }}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleCreateTemplate}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#003D7A',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'background-color 0.2s',
                            height: '40px',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#002855'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#003D7A'
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Create Template
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            {displaySummary && (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(4, 1fr)', 
                    gap: '24px', 
                    marginBottom: '32px' 
                }}>
                    {/* Total Templates */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: '#8B5CF6',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div>
                            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                                Total Templates
                            </p>
                            <p style={{ fontSize: '24px', fontWeight: '600', color: '#1F2937', margin: '4px 0 0 0' }}>
                                {displaySummary.totalTemplates || 0}
                            </p>
                        </div>
                    </div>

                    {/* Active */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: '#10B981',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M9 12l2 2 4-4M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div>
                            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                                Active
                            </p>
                            <p style={{ fontSize: '24px', fontWeight: '600', color: '#1F2937', margin: '4px 0 0 0' }}>
                                {displaySummary.activeTemplates || 0}
                            </p>
                        </div>
                    </div>

                    {/* Drafts */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: '#F59E0B',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M7 21a4 4 0 0 1-4-4V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12a4 4 0 0 1-4 4zm0 0h12a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 0 1 2.828 0l2.829 2.829a2 2 0 0 1 0 2.828l-8.486 8.485M7 17h.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div>
                            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                                Drafts
                            </p>
                            <p style={{ fontSize: '24px', fontWeight: '600', color: '#1F2937', margin: '4px 0 0 0' }}>
                                {displaySummary.draftTemplates || 0}
                            </p>
                        </div>
                    </div>

                    {/* Courses Using */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: '#8B5CF6',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div>
                            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                                Courses Using
                            </p>
                            <p style={{ fontSize: '24px', fontWeight: '600', color: '#1F2937', margin: '4px 0 0 0' }}>
                                {displaySummary.coursesUsing || 0}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginBottom: '24px',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '0'
            }}>
                <button
                    type="button"
                    onClick={() => setFilterStatus('all')}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: 'transparent',
                        color: filterStatus === 'all' ? '#003D7A' : '#6B7280',
                        border: 'none',
                        borderBottom: filterStatus === 'all' ? '2px solid #003D7A' : '2px solid transparent',
                        borderRadius: '0',
                        fontSize: '14px',
                        fontWeight: filterStatus === 'all' ? '600' : '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        marginBottom: '-1px'
                    }}
                >
                    All Templates
                    {displaySummary && (
                        <span style={{
                            backgroundColor: filterStatus === 'all' ? '#003D7A' : '#9CA3AF',
                            color: 'white',
                            borderRadius: '12px',
                            padding: '2px 8px',
                            fontSize: '12px',
                            fontWeight: '500'
                        }}>
                            {displaySummary.totalTemplates || 0}
                        </span>
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => setFilterStatus('active')}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: 'transparent',
                        color: filterStatus === 'active' ? '#003D7A' : '#6B7280',
                        border: 'none',
                        borderBottom: filterStatus === 'active' ? '2px solid #003D7A' : '2px solid transparent',
                        borderRadius: '0',
                        fontSize: '14px',
                        fontWeight: filterStatus === 'active' ? '600' : '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        marginBottom: '-1px'
                    }}
                >
                    Active
                    {displaySummary && (
                        <span style={{
                            backgroundColor: '#10B981',
                            color: 'white',
                            borderRadius: '12px',
                            padding: '2px 8px',
                            fontSize: '12px',
                            fontWeight: '500'
                        }}>
                            {displaySummary.activeTemplates || 0}
                        </span>
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => setFilterStatus('draft')}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: 'transparent',
                        color: filterStatus === 'draft' ? '#003D7A' : '#6B7280',
                        border: 'none',
                        borderBottom: filterStatus === 'draft' ? '2px solid #003D7A' : '2px solid transparent',
                        borderRadius: '0',
                        fontSize: '14px',
                        fontWeight: filterStatus === 'draft' ? '600' : '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        marginBottom: '-1px'
                    }}
                >
                    Drafts
                    {displaySummary && (
                        <span style={{
                            backgroundColor: '#F59E0B',
                            color: 'white',
                            borderRadius: '12px',
                            padding: '2px 8px',
                            fontSize: '12px',
                            fontWeight: '500'
                        }}>
                            {displaySummary.draftTemplates || 0}
                        </span>
                    )}
                </button>
            </div>

            {/* Template Cards */}
            <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                style={{
                    maxHeight: 'calc(100vh - 400px)',
                    overflowY: 'auto',
                    paddingRight: '8px'
                }}
            >
                {isLoading && templates.length === 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                        <Spinner animation="border" />
                    </div>
                ) : templates.length === 0 ? (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '48px',
                        textAlign: 'center',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}>
                        <p style={{ fontSize: '16px', color: '#6B7280', margin: 0 }}>
                            No certificate templates found.
                        </p>
                    </div>
                ) : (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                        gap: '24px' 
                    }}>
                    {templates.map((template, index) => (
                        <div
                            key={template.id}
                            style={{
                                padding: '20px',
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            {/* Blue Header Bar */}
                            <div style={{
                                borderRadius: '10px',
                                width: '100%',
                                height: '130px',
                                backgroundColor: getTemplateCardColor(index),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {template.template_image_url ? (
                                    <img 
                                        src={template.template_image_url} 
                                        alt={template.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                ) : (
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                )}
                            </div>

                            {/* Content Area */}
                            <div style={{ paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, minHeight: 0 }}>
                                {/* Title and Status Badge */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                                    <h3 style={{ 
                                        fontSize: '18px', 
                                        fontWeight: '600', 
                                        color: '#1F2937', 
                                        margin: 0,
                                        flex: 1
                                    }}>
                                        {template.name}
                                    </h3>
                                    <span style={{
                                        ...getStatusBadgeColor(template.status),
                                        padding: '1px 10px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        textTransform: 'lowercase',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {template.status.toLowerCase()}
                                    </span>
                                </div>

                                {/* Description with 2-line limit and tooltip */}
                                <div
                                    title={template.description}
                                    style={{
                                        position: 'relative',
                                        cursor: 'help'
                                    }}
                                >
                                    <p style={{ 
                                        fontSize: '14px', 
                                        color: '#6B7280', 
                                        margin: 0,
                                        lineHeight: '1.5',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        wordBreak: 'break-word'
                                    }}>
                                        {template.description}
                                    </p>
                                </div>

                                {/* Date and Courses Count */}
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px',
                                    fontSize: '14px',
                                    color: '#6B7280'
                                }}>
                                    <span>{dayjs(template.created_at).format('MMM D, YYYY')}</span>
                                    <span style={{ fontSize: '8px' }}>•</span>
                                    <span>{template.courses_using_count} {template.courses_using_count === 1 ? 'course' : 'courses'}</span>
                                </div>

                                {/* Action Buttons - Always at bottom */}
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '8px', 
                                    marginTop: 'auto',
                                    paddingTop: '8px'
                                }}>
                                    <button
                                        type="button"
                                        onClick={() => handlePreview(template.id)}
                                        style={{
                                            flex: 1,
                                            padding: '10px 16px',
                                            backgroundColor: 'white',
                                            color: '#374151',
                                            border: '1px solid #D1D5DB',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#F9FAFB'
                                            e.currentTarget.style.borderColor = '#9CA3AF'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'white'
                                            e.currentTarget.style.borderColor = '#D1D5DB'
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                                        </svg>
                                        Preview
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(template.id)}
                                        disabled={isDeleting}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            padding: '0',
                                            backgroundColor: '#F3F4F6',
                                            color: '#6B7280',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: isDeleting ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s',
                                            opacity: isDeleting ? 0.6 : 1
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isDeleting) {
                                                e.currentTarget.style.backgroundColor = '#E5E7EB'
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isDeleting) {
                                                e.currentTarget.style.backgroundColor = '#F3F4F6'
                                            }
                                        }}
                                        title="Edit template"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(template.id)}
                                        disabled={isDeleting}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            padding: '0',
                                            backgroundColor: '#F3F4F6',
                                            color: '#6B7280',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: isDeleting ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s',
                                            opacity: isDeleting ? 0.6 : 1
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isDeleting) {
                                                e.currentTarget.style.backgroundColor = '#E5E7EB'
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isDeleting) {
                                                e.currentTarget.style.backgroundColor = '#F3F4F6'
                                            }
                                        }}
                                        title="Delete template"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
                )}
                
                {/* Loading indicator for infinite scroll */}
                {isFetchingNextPage && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
                        <Spinner animation="border" size="sm" />
                    </div>
                )}
            </div>

            {/* Create Certificate Template Modal */}
            <CreateCertificateTemplateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            {/* Edit Certificate Template Modal */}
            <EditCertificateTemplateModal
                isOpen={!!editTemplateId}
                onClose={() => setEditTemplateId(null)}
                templateId={editTemplateId}
            />

            {/* Certificate Preview Modal */}
            <CertificatePreviewModal
                isOpen={!!previewTemplate}
                onClose={() => setPreviewTemplate(null)}
                template={previewTemplate}
            />
        </div>
    )
}

