// Global polyfill for ReactDOM.findDOMNode (removed in React 19)
// This file should be imported early in the app lifecycle

if (typeof window !== 'undefined') {
    try {
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
    } catch (e) {
        // Silently fail
    }
}

