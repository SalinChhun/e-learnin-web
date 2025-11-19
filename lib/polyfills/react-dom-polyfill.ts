// Polyfill for ReactDOM.findDOMNode (removed in React 19)
// This must be imported before react-quill

if (typeof window !== 'undefined') {
    try {
        const ReactDOM = require('react-dom')
        if (ReactDOM && !ReactDOM.findDOMNode) {
            // Simple polyfill that tries to extract DOM node from various sources
            ReactDOM.findDOMNode = function(instance: any): Element | Text | null {
                if (!instance) {
                    return null
                }
                
                // If it's already a DOM node, return it
                if (instance.nodeType === 1 || instance.nodeType === 3) {
                    return instance
                }
                
                // Try common patterns for getting DOM nodes
                if (instance && typeof instance === 'object') {
                    // Check for refs (most common pattern)
                    if (instance.ref?.current) {
                        return instance.ref.current
                    }
                    
                    // Check for _ref (alternative ref pattern)
                    if (instance._ref?.current) {
                        return instance._ref.current
                    }
                    
                    // Check for direct DOM reference
                    if (instance._domNode) {
                        return instance._domNode
                    }
                    
                    // For react-quill specifically, it might store the element
                    if (instance.quill?.root) {
                        return instance.quill.root
                    }
                }
                
                // Fallback: return null (react-quill will handle this)
                return null
            }
        }
    } catch (e) {
        // Silently fail - the component will handle the error
    }
}

