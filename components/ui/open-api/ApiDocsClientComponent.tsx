// // components/ApiDocsClientComponent.tsx
// import { API_DEFINITION, ApiEndpoint } from '@/openapi/apiDefinition';
// import React, { useState, useEffect } from 'react';
// import '@/styles/api-docs-styles.css';
// import useApiDocsClient, { ApiClientConfig } from '@/openapi/apiDocsClient';
// import CollapsibleNestedParamsTable from './CollapsibleNestedParamsTableProps';
// import RequestBodySection from './RequestBodySection';

// // This component will only be rendered on the client side
// const ApiDocsClientComponent: React.FC = () => {
//   // API configuration state
//   const [apiConfig, setApiConfig] = useState<ApiClientConfig>({
//     baseUrl: process.env.NEXT_PUBLIC_OPEN_API_URL!,
//     authMethod: 'ApiKey',
//     authValue: '',
//     partnerCode: '', // Add partner code value
//   });

//   // Navigation state
//   const [activeCategory, setActiveCategory] = useState<string | null>(null);
//   const [openEndpoints, setOpenEndpoints] = useState<Record<string, boolean>>({});
//   const [openNavCategories, setOpenNavCategories] = useState<Record<string, boolean>>({});

//   // Initialize state when component mounts (client-side only)
//   useEffect(() => {
//     // Set base URL from environment variable
//     setApiConfig(prev => ({
//       ...prev,
//       baseUrl: process.env.NEXT_PUBLIC_OPEN_API_URL!
//     }));

//     // Set initial active category
//     if (API_DEFINITION.length > 0) {
//       setActiveCategory(API_DEFINITION[0].id);

//       // Initialize with only API Configuration open by default
//       const initialOpenNavs: Record<string, boolean> = {};
//       initialOpenNavs['apiConfig'] = true;
//       setOpenNavCategories(initialOpenNavs);
//     }
//   }, []);

//   // Find active category
//   const activeCategories = activeCategory
//     ? API_DEFINITION.find(cat => cat.id === activeCategory)
//     : null;

//   // Toggle a category in the navigation - with exclusive opening logic
//   const toggleNavCategory = (categoryId: string) => {
//     setOpenNavCategories(prev => {
//       // Create a new object with all categories closed
//       const newState: Record<string, boolean> = {};

//       // If the clicked category was already open, close it (toggle off)
//       // Otherwise, open only the clicked category (all others remain closed)
//       newState[categoryId] = !prev[categoryId];

//       return newState;
//     });
//   };

//   // Toggle an endpoint open/closed
//   const toggleEndpoint = (endpointId: string) => {
//     setOpenEndpoints(prev => ({
//       ...prev,
//       [endpointId]: !prev[endpointId]
//     }));
//   };

//   // Update API configuration
//   const handleApiConfigChange = (newConfig: Partial<ApiClientConfig>) => {
//     setApiConfig((prev: any) => ({
//       ...prev,
//       ...newConfig
//     }));
//   };

//   // Get HTTP method CSS class
//   const getMethodClass = (method: string): string => {
//     switch (method.toUpperCase()) {
//       case 'GET': return 'api-http-get';
//       case 'POST': return 'api-http-post';
//       case 'PUT': return 'api-http-put';
//       case 'DELETE': return 'api-http-delete';
//       case 'PATCH': return 'api-http-patch';
//       default: return 'api-http-get';
//     }
//   };

//   return (
//     <div className="api-docs container-fluid g-0 h-100">
//       <div className="api-header">
//         <h1 className='color-white'>
//           OBP API Documentation
//           <span className="api-version">v1.0.0</span>
//         </h1>
//         <div className="api-actions">
//           {/* <a href="/api-docs" className="api-btn api-btn-primary">Login</a> */}
//         </div>
//       </div>

//       <div className="api-container">
//         {/* Sidebar Navigation - Fixed position */}
//         <aside className="api-sidebar">
//           <div className="api-sidebar-inner">
//             {/* API Configuration Panel */}
//             <div className="api-sidebar-section">
//               <div
//                 className="api-sidebar-toggle"
//                 onClick={() => toggleNavCategory('apiConfig')}
//               >
//                 <span>API Configuration</span>
//                 <span className={`api-sidebar-arrow ${openNavCategories['apiConfig'] ? 'expanded' : ''}`}>▼</span>
//               </div>

//               {openNavCategories['apiConfig'] && (
//                 <div className="api-sidebar-content">
//                   <div className="api-auth-form">
//                     <div className="api-auth-form-group">
//                       <label htmlFor="baseUrl">Base URL</label>
//                       <input
//                         type="text"
//                         id="baseUrl"
//                         disabled={true}
//                         value={apiConfig.baseUrl}
//                         onChange={(e) => handleApiConfigChange({ baseUrl: e.target.value })}
//                         placeholder="https://api.example.com"
//                         className='api-input-disabled'
//                       />
//                     </div>

//                     <div className="api-auth-form-group">
//                       <label htmlFor="authMethod">Authentication Method</label>
//                       <select
//                         id="authMethod"
//                         value={apiConfig.authMethod}
//                         onChange={(e) => handleApiConfigChange({
//                           authMethod: e.target.value as ApiClientConfig['authMethod'],
//                           ...(e.target.value === 'None' ? { authValue: '' } : {})
//                         })}
//                       >
//                         {/* <option value="None">None</option> */}
//                         {/* <option value="Bearer">Bearer Token</option> */}
//                         <option value="ApiKey">API Key</option>
//                         {/* <option value="Basic">Basic Auth</option> */}
//                       </select>
//                     </div>

//                     {apiConfig.authMethod !== 'None' && (
//                       <>
//                         {apiConfig.authMethod === 'ApiKey' && (
//                           <>
//                             {/* First header:  X-OBP-PARTNERCODE */}

//                             <div className="api-auth-form-group">
//                               <label htmlFor="partnerCodeHeader">Header: {process.env.NEXT_PUBLIC_API_HEADER_CODE}</label>
//                               <input
//                                 type="text"
//                                 id="partnerCode"
//                                 value={apiConfig.partnerCode || ''}
//                                 onChange={(e) => handleApiConfigChange({ partnerCode: e.target.value })}
//                                 placeholder="Your Partner Code"
//                               />
//                             </div>

//                             {/* Second header: X-OBP-TRUST-SYSTEM */}
//                             <div className="api-auth-form-group">
//                               <label htmlFor="authHeaderName">Header: {process.env.NEXT_PUBLIC_API_HEADER_KEY}</label>
//                               <input
//                                 type="text"
//                                 id="authValue"
//                                 value={apiConfig.authValue || ''}
//                                 onChange={(e) => handleApiConfigChange({ authValue: e.target.value })}
//                                 placeholder="Your Trust Key"
//                               />
//                             </div>
//                           </>
//                         )}

//                         {apiConfig.authMethod === 'Bearer' && (
//                           <div className="api-auth-form-group">
//                             <label htmlFor="authValue">Token</label>
//                             <input
//                               type="text"
//                               id="authValue"
//                               value={apiConfig.authValue || ''}
//                               onChange={(e) => handleApiConfigChange({ authValue: e.target.value })}
//                               placeholder="Your JWT token"
//                             />
//                           </div>
//                         )}

//                         {apiConfig.authMethod === 'Basic' && (
//                           <div className="api-auth-form-group">
//                             <label htmlFor="authValue">Credentials</label>
//                             <input
//                               type="password"
//                               id="authValue"
//                               value={apiConfig.authValue || ''}
//                               onChange={(e) => handleApiConfigChange({ authValue: e.target.value })}
//                               placeholder="username:password"
//                             />
//                             <small className="api-auth-help">
//                               Enter as username:password. It will be automatically Base64 encoded.
//                             </small>
//                           </div>
//                         )}
//                       </>
//                     )}

//                     <div className="api-auth-status">
//                       {apiConfig.authMethod !== 'None' && apiConfig.authValue && apiConfig.partnerCode !== 'None' && apiConfig.partnerCode ? (
//                         <span className="api-auth-status-success">
//                           ✓ Authentication configured
//                         </span>
//                       ) : (
//                         <span className="api-auth-status-none">
//                           No authentication configured
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Navigation menu - each API category is a togglable section */}
//             {API_DEFINITION.map((category) => (
//               <div key={category.id} className="api-sidebar-section">
//                 <div
//                   className={`api-sidebar-toggle ${category.id === activeCategory ? 'active' : ''
//                     }`}
//                   onClick={() => {
//                     setActiveCategory(category.id);
//                     toggleNavCategory(category.id);
//                   }}
//                 >
//                   <span>{category.title}</span>
//                   <span className={`api-sidebar-arrow ${openNavCategories[category.id] ? 'expanded' : ''}`}>▼</span>
//                 </div>
//                 {openNavCategories[category.id] && (
//                   <div className="api-sidebar-content">
//                     <nav className="api-nav">
//                       {category.endpoints.map((endpoint) => (
//                         <div
//                           key={endpoint.id}
//                           className={`api-nav-item ${activeCategory === category.id && openEndpoints[endpoint.id] ? 'active' : ''
//                             }`}
//                           onClick={() => {
//                             setActiveCategory(category.id);
//                             toggleEndpoint(endpoint.id);

//                             // Scroll to endpoint
//                             const element = document.getElementById(endpoint.id);
//                             if (element) {
//                               element.scrollIntoView({ behavior: 'smooth' });
//                             }
//                           }}
//                         >
//                           {endpoint.title}
//                         </div>
//                       ))}
//                     </nav>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </aside>

//         {/* Main Content */}
//         <main className="api-content">
//           {activeCategories && (
//             <div className="api-section">
//               <div className="api-section-header">
//                 <h2 className="api-section-title">{activeCategories.title}</h2>
//                 <div className="api-section-path">{activeCategories.basePath}</div>
//               </div>

//               {activeCategories.description && <p>{activeCategories.description}</p>}

//               {activeCategories.endpoints.map((endpoint) => (
//                 <div
//                   key={endpoint.id}
//                   className="api-card"
//                   id={endpoint.id}
//                 >
//                   <div
//                     className="api-card-header"
//                     onClick={() => toggleEndpoint(endpoint.id)}
//                   >
//                     <div className={`api-endpoint-header api-endpoint-header-${endpoint.method.toLowerCase()}`}>
//                       <div>
//                         <span className={`api-http-method api-http-${endpoint.method.toLowerCase()}`}>
//                           {endpoint.method}
//                         </span>
//                         <span className="api-endpoint-path">
//                           {endpoint.path}
//                         </span>
//                       </div>
//                       <p className="api-endpoint-description">
//                         {endpoint.description}
//                       </p>
//                     </div>
//                   </div>

//                   <div className={`api-card-body ${openEndpoints[endpoint.id] ? 'open' : ''}`}>
//                     <EndpointTabsSection endpoint={endpoint} apiConfig={apiConfig} />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// };

// interface TabsSectionProps {
//   endpoint: ApiEndpoint;
//   apiConfig: ApiClientConfig;
// }

// // Tabs Section Component
// const EndpointTabsSection: React.FC<TabsSectionProps> = ({ endpoint, apiConfig }) => {
//   const [activeTab, setActiveTab] = useState<string>('request');

//   const tabs = [
//     // { id: 'overview', label: 'Overview' },
//     { id: 'request', label: 'Request' },
//     { id: 'response', label: 'Response' },
//     { id: 'error', label: 'Error Codes' },
//     { id: 'codeSamples', label: 'Code Samples' },
//     { id: 'test', label: 'Test' }
//   ];

//   // Check if any request body params are required
//   const hasRequiredRequestBody = endpoint.requestBodyParams?.some(param => param.required) || false;

//   // Test tab state
//   const [urlParams, setUrlParams] = useState<Record<string, string>>({});
//   const [queryParams, setQueryParams] = useState<Record<string, string>>({});
//   const [requestBody, setRequestBody] = useState<string>(
//     endpoint.requestBody ? JSON.stringify(endpoint.requestBody, null, 2) : '{}'
//   );
//   const [testResponse, setTestResponse] = useState<{data: any, status: number, statusText: string} | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);

//   // Initialize the API client
//   const apiClient = useApiDocsClient(apiConfig);

//   // Reset state
//   useEffect(() => {
//     // Initialize with default values when endpoint changes
//     if (endpoint.requestBody) {
//       setRequestBody(JSON.stringify(endpoint.requestBody, null, 2));
//     }

//     // Initialize urlParams with empty values
//     const initialUrlParams: Record<string, string> = {};
//     if (endpoint.urlParams) {
//       endpoint.urlParams.forEach(param => {
//         initialUrlParams[param.name] = '';
//       });
//     }
//     setUrlParams(initialUrlParams);

//     // Initialize queryParams with empty values
//     const initialQueryParams: Record<string, string> = {};
//     if (endpoint.queryParams) {
//       endpoint.queryParams.forEach(param => {
//         initialQueryParams[param.name] = '';
//       });
//     }
//     setQueryParams(initialQueryParams);

//     // Reset response and error
//     setTestResponse(null);
//     setErrorMsg(null);
//   }, [endpoint]);

//   // Process the path with URL parameters
//   const getProcessedPath = () => {
//     let processedPath = endpoint.path;

//     // Replace URL parameters in the path
//     if (endpoint.urlParams) {
//       endpoint.urlParams.forEach(param => {
//         const value = urlParams[param.name] || '';
//         processedPath = processedPath.replace(`{${param.name}}`, encodeURIComponent(value));
//       });
//     }

//     return processedPath;
//   };

//   // Parse request body from JSON
//   const parseBody = (): any => {
//     if (!requestBody.trim()) {
//       return {};
//     }

//     try {
//       return JSON.parse(requestBody);
//     } catch (error) {
//       setErrorMsg('Invalid JSON format in request body');
//       throw new Error('Invalid JSON format');
//     }
//   };

//   // Execute API request
//   const executeRequest = async () => {
//     if(apiConfig.authValue === "" || apiConfig.partnerCode === "" && endpoint.requiresAuth ){
//       setErrorMsg('Please provide authentication value in API Configuration');
//       return;
//     }
//     setErrorMsg(null);
//     setIsLoading(true);

//     try {
//       // Create a complete URL including the base URL (bypass the client's URL processing)
//       const fullPath = `${apiConfig.baseUrl}${getProcessedPath()}`;

//       // Create basic options object with the full URL
//       const options: {
//         url: string;
//         method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
//         queryParams?: Record<string, string>;
//         body?: any;
//       } = {
//         url: fullPath,
//         method: endpoint.method as any,
//       };

//       // Add query params if any
//       if (Object.keys(queryParams).length > 0) {
//         // Filter out empty query params
//         const filteredQueryParams: Record<string, string> = {};
//         Object.entries(queryParams).forEach(([key, value]) => {
//           if (value.trim() !== '') {
//             filteredQueryParams[key] = value;
//           }
//         });

//         if (Object.keys(filteredQueryParams).length > 0) {
//           options.queryParams = filteredQueryParams;
//         }
//       }

//       // Add body for methods that accept it
//       if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
//         options.body = parseBody();
//       }

//       // Execute the request
//       const response = await apiClient.executeRequest(options);

//       // Store the response
//       setTestResponse({
//         data: response.data,
//         status: response.status,
//         statusText: response.statusText
//       });

//     } catch (error) {
//       console.error('Test request failed:', error);
//       if (error instanceof Error) {
//         setErrorMsg(error.message);
//       } else {
//         setErrorMsg('Unknown error occurred');
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Reset form to default values
//   const resetForm = () => {
//     // Reset URL params
//     const resetUrlParams: Record<string, string> = {};
//     if (endpoint.urlParams) {
//       endpoint.urlParams.forEach(param => {
//         resetUrlParams[param.name] = '';
//       });
//     }
//     setUrlParams(resetUrlParams);

//     // Reset query params
//     const resetQueryParams: Record<string, string> = {};
//     if (endpoint.queryParams) {
//       endpoint.queryParams.forEach(param => {
//         resetQueryParams[param.name] = '';
//       });
//     }
//     setQueryParams(resetQueryParams);

//     // Reset request body to default
//     if (endpoint.requestBody) {
//       setRequestBody(JSON.stringify(endpoint.requestBody, null, 2));
//     } else {
//       setRequestBody('{}');
//     }

//     // Clear response and error
//     setTestResponse(null);
//     setErrorMsg(null);
//   };

//   // Handle input changes
//   const handleUrlParamChange = (name: string, value: string) => {
//     setUrlParams(prev => ({ ...prev, [name]: value }));
//   };

//   const handleQueryParamChange = (name: string, value: string) => {
//     setQueryParams(prev => ({ ...prev, [name]: value }));
//   };

//   const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setRequestBody(e.target.value);
//     setErrorMsg(null);
//   };

//   // Helper function to convert example to string
//   const getExampleAsString = (example: string | number | boolean | undefined): string => {
//     if (example === undefined || example === null) return '';
//     return String(example);
//   };

//   // Update your useEffect - this is the key fix
//   useEffect(() => {
//     // Initialize with default values when endpoint changes
//     if (endpoint.requestBody) {
//       setRequestBody(JSON.stringify(endpoint.requestBody, null, 2));
//     }

//     // Initialize urlParams with example values (THIS IS THE FIX)
//     const initialUrlParams: Record<string, string> = {};
//     if (endpoint.urlParams) {
//       endpoint.urlParams.forEach(param => {
//         initialUrlParams[param.name] = getExampleAsString(param.example);
//       });
//     }
//     setUrlParams(initialUrlParams);

//     // Initialize queryParams with example values
//     const initialQueryParams: Record<string, string> = {};
//     if (endpoint.queryParams) {
//       endpoint.queryParams.forEach(param => {
//         initialQueryParams[param.name] = getExampleAsString((param as any).example);
//       });
//     }
//     setQueryParams(initialQueryParams);

//     // Reset response and error
//     setTestResponse(null);
//     setErrorMsg(null);
//   }, [endpoint]);

//   return (
//     <div className="api-tabs-container">
//       <div className="api-tabs-header">
//         {tabs.map((tab) => (
//           <button
//             key={tab.id}
//             className={`api-tab ${activeTab === tab.id ? 'active' : ''}`}
//             onClick={() => setActiveTab(tab.id)}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       <div className="api-tabs-content">
//         {/* Overview Tab */}
//         {activeTab === 'overview' && (
//           <div className="api-tab-pane">
//             <div className="api-overview">
//               <p className="api-endpoint-desc">{endpoint.description}</p>

//               {endpoint.requiresAuth && (
//                 <div className="api-info-box">
//                   <span>🔒 This endpoint requires authentication</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Request Tab */}
//         {activeTab === 'request' && (
//           <div className="api-tab-pane">
//             <div className="api-section-block">
//               <h3 className="api-section-subtitle">Request Details</h3>

//               {/* URL Parameters */}
//               {endpoint.urlParams && endpoint.urlParams.length > 0 && (
//                 <div className="api-params-block">
//                   <h4 className="api-param-title">URL Parameters</h4>

//                   <div className="api-param-table-container">
//                     <table className="api-param-table">
//                       <thead>
//                         <tr>
//                           <th>Parameter</th>
//                           <th>Type</th>
//                           <th>Example</th>
//                           <th>Description</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {endpoint.urlParams.map((param) => (
//                           <tr key={param.name}>
//                             <td>
//                               <code>{param.name}</code>
//                               {param.required && <span className="api-param-required">*</span>}
//                             </td>
//                             <td><span className="api-param-type">{param.type}</span></td>
//                             <td><code>{param.example || '-'}</code></td>
//                             <td>{param.description}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}

//               {/* Query Parameters */}
//               {endpoint.queryParams && endpoint.queryParams.length > 0 && (
//                 <div className="api-params-block">
//                   <h4 className="api-param-title">Query Parameters</h4>

//                   <div className="api-param-table-container">
//                     <table className="api-param-table">
//                       <thead>
//                         <tr>
//                           <th>Parameter</th>
//                           <th>Type</th>
//                           <th>Example</th>
//                           <th>Description</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {endpoint.queryParams.map((param) => (
//                           <tr key={param.name}>
//                             <td>
//                               <code>{param.name}</code>
//                               {param.required && <span className="api-param-required">*</span>}
//                             </td>
//                             <td><span className="api-param-type">{param.type}</span></td>
//                             <td><code>{param.example || '-'}</code></td>
//                             <td>{param.description}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}

//               {/* Request Body */}
//               <RequestBodySection endpoint={endpoint} />
//             </div>
//           </div>
//         )}

//         {/* Response Tab */}
//         {activeTab === 'response' && (
//           <div className="api-tab-pane">
//             <div className="api-section-block">
//               <h3 className="api-section-subtitle">Response Details</h3>

//               {/* Always show parameters table if available */}
//               {endpoint.responseBodyParams && endpoint.responseBodyParams.length > 0 && (
//                 <div className="api-params-block">
//                   <h4 className="api-param-title">Response Parameters</h4>
//                   <CollapsibleNestedParamsTable parameters={endpoint.responseBodyParams} />
//                 </div>
//               )}

//               {/* Always show response body example */}
//               <div className="api-response-body-example">
//                 <h4 className="api-param-title">Response Body Example</h4>
//                 <div className="api-code-sample">
//                   <pre>{JSON.stringify(endpoint.responseBody, null, 2)}</pre>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Error Codes Tab */}
//         {activeTab === 'error' && (
//           <div className="api-tab-pane">
//             <div className="api-section-block">
//               <h3 className="api-section-subtitle">Error Codes</h3>

//               {endpoint.errorCodes && endpoint.errorCodes.length > 0 ? (
//                 <div className="api-param-table-container">
//                   <table className="api-param-table">
//                     <thead>
//                       <tr>
//                         <th>HTTP Status Code</th>
//                         <th>Code</th>
//                         <th>message</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {endpoint.errorCodes.map((error, index) => (
//                         <tr key={index}>
//                           <td><span className={`api-status-code status-${Math.floor(error.status / 100)}xx`}>{error.status}</span></td>
//                           <td><code>{error.code}</code></td>
//                           <td>{error.message}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               ) : (
//                 <p>No error codes specified for this endpoint.</p>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Code Samples Tab */}
//         {activeTab === 'codeSamples' && (
//           <div className="api-tab-pane">
//             <CodeSamplesTab endpoint={endpoint} apiConfig={apiConfig} />
//           </div>
//         )}

//         {/* Test Tab */}
//         {activeTab === 'test' && (
//           <div className="api-tab-pane">
//             <div className="api-test-section">
//               <p className="api-test-description">
//                 The response data may differ from the actual request response.
//               </p>

//               {errorMsg && (
//                 <div className="api-error-message">
//                   <span>Error: {errorMsg}</span>
//                 </div>
//               )}

//               <div className="api-test-container">
//                 <div className="api-test-request">
//                   <form className="api-test-form" onSubmit={(e) => { e.preventDefault(); executeRequest(); }}>
//                     {/* URL Parameters */}
//                     {endpoint.urlParams && endpoint.urlParams.length > 0 && (
//                       <div className="api-test-param-group">
//                         <label className="api-test-param-label">
//                           Path Parameters {endpoint.urlParams.some(p => p.required) && <span className="api-required-mark">*</span>}
//                         </label>

//                         {endpoint.urlParams.map(param => (
//                           <div key={param.name} className="api-test-param-field">
//                             <input
//                               type="text"
//                               className="api-test-param-input"
//                               placeholder={`${param.name}${param.required ? ' (required)' : ''}`}
//                               value={urlParams[param.name] || ''}
//                               onChange={(e) => handleUrlParamChange(param.name, e.target.value)}
//                               aria-label={param.name}
//                               required={param.required}
//                             />
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                     {/* Query Parameters */}
//                     {endpoint.queryParams && endpoint.queryParams.length > 0 && (
//                       <div className="api-test-param-group">
//                         <label className="api-test-param-label">
//                           Query Parameters {endpoint.queryParams.some(p => p.required) && <span className="api-required-mark">*</span>}
//                         </label>

//                         {endpoint.queryParams.map(param => (
//                           <div key={param.name} className="api-test-param-field">
//                             <input
//                               type="text"
//                               className="api-test-param-input"
//                               placeholder={`${param.name}${param.required ? ' (required)' : ''}`}
//                               value={queryParams[param.name] || ''}
//                               onChange={(e) => handleQueryParamChange(param.name, e.target.value)}
//                               aria-label={param.name}
//                             />
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                     {/* Request Body */}
//                     {['POST', 'PUT', 'PATCH'].includes(endpoint.method) && (
//                       <div className="api-test-param-group">
//                         <label className="api-test-param-label">
//                           Request Body {hasRequiredRequestBody && <span className="api-required-mark">*</span>}
//                         </label>
//                         <textarea
//                           className="api-test-textarea"
//                           value={requestBody}
//                           onChange={handleBodyChange}
//                         ></textarea>
//                       </div>
//                     )}

//                     <div className="api-test-actions">
//                       <button
//                         type="submit"
//                         className="api-test-button api-test-execute"
//                         disabled={isLoading}
//                       >
//                         {isLoading ? 'Executing...' : 'Execute'}
//                       </button>
//                       <button
//                         type="button"
//                         className="api-test-button api-test-reset"
//                         onClick={resetForm}
//                         disabled={isLoading}
//                       >
//                         Reset
//                       </button>
//                     </div>
//                   </form>
//                 </div>

//                 <div className="api-test-response">
//                   <label className="api-test-param-label">Response</label>
//                   <div className="api-response-display" style={{ maxHeight: '400px', overflowY: 'auto' }}>
//                     {testResponse ? (
//                       <pre className='api-response-display' >
//                         {formatTestResponse(testResponse)}
//                       </pre>
//                     ) : (
//                       <pre className='api-response-display'>
//                         <span className="api-line-number">1</span>{"{\n"}
//                         <span className="api-line-number">2</span>{"  // Execute a request to see the response\n"}
//                         <span className="api-line-number">3</span>{"}"}
//                       </pre>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Code Samples Tab Component
// interface CodeSamplesTabProps {
//   endpoint: ApiEndpoint;
//   apiConfig: ApiClientConfig;
// }

// const CodeSamplesTab: React.FC<CodeSamplesTabProps> = ({ endpoint, apiConfig }) => {
//   // const [codeFormat, setCodeFormat] = useState<'curl' | 'fetch' | 'axios'>('curl');
//   const [codeFormat, setCodeFormat] = useState<'curl'>('curl');
//   const apiClient = useApiDocsClient(apiConfig);

//   const generateSampleOptions = () => {
//     const options = {
//       url: endpoint.path,
//       method: endpoint.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
//       body: endpoint.requestBody,
//     };

//     return options;
//   };

//   const getCodeSamples = () => {
//     try {
//       return apiClient.generateCodeSamples(generateSampleOptions());
//     } catch (error) {
//       return {
//         curl: '# Error generating code sample',
//         fetch: '// Error generating code sample',
//         axios: '// Error generating code sample'
//       };
//     }
//   };

//   const samples = getCodeSamples();

//   return (
//     <div className="api-code-samples">
//       <div className="api-code-format-tabs">
//         <button
//           className={`api-code-format-tab ${codeFormat === 'curl' ? 'active' : ''}`}
//           onClick={() => setCodeFormat('curl')}
//         >
//           cURL
//         </button>
//         {/* <button
//           className={`api-code-format-tab ${codeFormat === 'fetch' ? 'active' : ''}`}
//           onClick={() => setCodeFormat('fetch')}
//         >
//           Fetch
//         </button>
//         <button
//           className={`api-code-format-tab ${codeFormat === 'axios' ? 'active' : ''}`}
//           onClick={() => setCodeFormat('axios')}
//         >
//           Axios
//         </button> */}
//       </div>

//       <div className="api-code-sample">
//         <pre>{samples[codeFormat]}</pre>
//       </div>
//     </div>
//   );
// };

// export default ApiDocsClientComponent;

// // Helper function to format the test response with line numbers
// const formatTestResponse = (response: {data: any, status: number, statusText: string}) => {
//   // Create a structured response object that matches your API format
//   const formattedResponse = {
//     ...response.data
//   };

//   const formattedJson = JSON.stringify(formattedResponse, null, 2);

//   const lines = formattedJson.split('\n');
//   return lines.map((line, index) => (
//     <React.Fragment key={index}>
//       <span className="api-line-number">{index + 1}</span>
//       {line}
//       {index < lines.length - 1 ? '\n' : ''}
//     </React.Fragment>
//   ));
// };
