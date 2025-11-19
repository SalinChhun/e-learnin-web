'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

// Set up polyfill before importing react-quill
if (typeof window !== 'undefined') {
    const ReactDOM = require('react-dom')
    if (ReactDOM && !ReactDOM.findDOMNode) {
        ReactDOM.findDOMNode = function(instance: any) {
            if (!instance) return null
            if (instance.nodeType === 1 || instance.nodeType === 3) return instance
            if (instance.ref?.current) return instance.ref.current
            if (instance._ref?.current) return instance._ref.current
            if (instance._domNode) return instance._domNode
            if (instance.quill?.root) return instance.quill.root
            return null
        }
    }
}

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder = 'Start writing your course content here...' }: RichTextEditorProps) {
    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'size': [] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['blockquote', 'code-block'],
            ['clean']
        ],
        clipboard: {
            matchVisual: false
        }
    }), [])

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'script',
        'list', 'bullet', 'indent',
        'direction', 'align',
        'link', 'image', 'video',
        'blockquote', 'code-block'
    ]

    return (
        <div style={{
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #D1D5DB'
        }}>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                style={{
                    backgroundColor: 'white',
                    borderRadius: '8px'
                }}
            />
            <style jsx global>{`
                .quill {
                    border: none;
                }
                .quill .ql-container {
                    border: none;
                    border-top: 1px solid #D1D5DB;
                    font-size: 14px;
                    min-height: 300px;
                }
                .quill .ql-editor {
                    min-height: 300px;
                    padding: 16px;
                }
                .quill .ql-editor.ql-blank::before {
                    color: #9CA3AF;
                    font-style: normal;
                }
                .quill .ql-toolbar {
                    border: none;
                    border-bottom: 1px solid #D1D5DB;
                    background-color: #F9FAFB;
                    padding: 8px 12px;
                }
                .quill .ql-toolbar .ql-stroke {
                    stroke: #374151;
                }
                .quill .ql-toolbar .ql-fill {
                    fill: #374151;
                }
                .quill .ql-toolbar button:hover,
                .quill .ql-toolbar button.ql-active {
                    color: #003D7A;
                }
                .quill .ql-toolbar button:hover .ql-stroke,
                .quill .ql-toolbar button.ql-active .ql-stroke {
                    stroke: #003D7A;
                }
                .quill .ql-toolbar button:hover .ql-fill,
                .quill .ql-toolbar button.ql-active .ql-fill {
                    fill: #003D7A;
                }
                .quill .ql-toolbar .ql-picker-label {
                    color: #374151;
                }
                .quill .ql-toolbar .ql-picker-label:hover {
                    color: #003D7A;
                }
                .quill .ql-editor a {
                    color: #003D7A;
                    text-decoration: underline;
                }
                .quill .ql-editor img {
                    max-width: 100%;
                    height: auto;
                }
            `}</style>
        </div>
    )
}
