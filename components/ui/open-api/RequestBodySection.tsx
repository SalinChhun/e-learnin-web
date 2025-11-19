// 'use client'

// import { ApiEndpoint } from '@/openapi/apiDefinition';
// import React from 'react';
// import ColorCodedNestedParamsTable from './CollapsibleNestedParamsTableProps';

// interface RequestBodySectionProps {
//     endpoint: ApiEndpoint;
// }

// const RequestBodySection: React.FC<RequestBodySectionProps> = ({ endpoint }) => {
//     const methodsWithBody: string[] = ['POST', 'PUT', 'PATCH'];

//     if (!methodsWithBody.includes(endpoint.method)) {
//         return null;
//     }

//     const hasParams = endpoint.requestBodyParams && endpoint.requestBodyParams.length > 0;

//     if (!hasParams && !endpoint.requestBody) {
//         return null;
//     }

//     return (
//         <div className="api-params-block">
//             <h4 className="api-param-title">Request Body</h4>

//             {hasParams ? (
//                 <div className="api-param-table-container">
//                     <ColorCodedNestedParamsTable
//                         parameters={endpoint.requestBodyParams!}
//                         isNested={false}
//                     />
//                 </div>
//             ) : (
//                 endpoint.requestBody && (
//                     <div className="api-request-body-example">
//                         <h5 className="api-example-title">Request Body Example</h5>
//                         <div className="api-code-sample">
//                             <pre>{JSON.stringify(endpoint.requestBody, null, 2)}</pre>
//                         </div>
//                     </div>
//                 )
//             )}
//         </div>
//     );
// };

// export default RequestBodySection;
