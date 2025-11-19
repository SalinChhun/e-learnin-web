// 'use client'

// import React, { useState } from 'react';
// import { ApiParameter } from '@/openapi/apiDefinition';
// import { getTypeClass, getVisibleColumns } from '@/utils/tableHelpers';

// interface ColorCodedNestedParamsTableProps {
//     parameters: ApiParameter[];
//     isNested?: boolean;
//     parentPath?: string;
// }

// const ColorCodedNestedParamsTable: React.FC<ColorCodedNestedParamsTableProps> = ({
//     parameters,
//     isNested = false,
//     parentPath = ''
// }) => {
//     // Default to expanded for top-level parameters, collapsed for nested
//     const [expandedParams, setExpandedParams] = useState<Record<string, boolean>>(() => {
//         const initialState: Record<string, boolean> = {};
//         if (parameters) {
//             parameters.forEach(param => {
//                 initialState[param.name] = !isNested; // Top level expanded, nested collapsed
//             });
//         }
//         return initialState;
//     });

//     if (!parameters || parameters.length === 0) {
//         return null;
//     }

//     // Get dynamic columns based on available data
//     const visibleColumns = getVisibleColumns(parameters);

//     const toggleExpand = (paramName: string, e: React.MouseEvent): void => {
//         e.stopPropagation(); // Prevent event from bubbling up
//         setExpandedParams(prev => ({
//             ...prev,
//             [paramName]: !prev[paramName]
//         }));
//     };

//     // Check if a parameter is expanded
//     const isExpanded = (paramName: string): boolean => {
//         return !!expandedParams[paramName];
//     };

//     // Generate the full path for a parameter
//     const getFullPath = (paramName: string): string => {
//         if (!parentPath) return paramName;
//         return `${parentPath}.${paramName}`;
//     };

//     const renderCellContent = (param: ApiParameter, columnKey: string): React.ReactNode => {
//         switch (columnKey) {
//             case 'name':
//                 return (
//                     <div className="param-name-container">
//                         <code className="param-name">{param.name}</code>
//                         {param.required && <span className="api-param-required">*</span>}
//                         {param.children && param.children.length > 0 && (
//                             <button
//                                 className={`expand-toggle-btn ${isExpanded(param.name) ? 'expanded' : 'collapsed'}`}
//                                 onClick={(e) => toggleExpand(param.name, e)}
//                                 aria-label={isExpanded(param.name) ? 'Collapse' : 'Expand'}
//                                 type="button"
//                             >
//                                 {isExpanded(param.name) ? '−' : '+'}
//                             </button>
//                         )}
//                     </div>
//                 );
//             case 'type':
//                 return (
//                     <span className={`api-param-type ${getTypeClass(param.type)}`}>
//                         {param.type}
//                     </span>
//                 );
//             case 'size':
//               return  <span className={`api-param-type ${getTypeClass(param.type)}`}> {  param.size || '-'} </span>

//             case 'example':
//                 return (
//                     <code className="param-example">
//                         {param.example !== undefined
//                             ? typeof param.example === 'string'
//                                 ? param.example
//                                 : String(param.example)
//                             : '-'}
//                     </code>
//                 );
//             case 'description':
//                 return <span className="param-description" style={{ whiteSpace: 'pre-line' }}>{param.description}</span>;
//             default:
//                 return '-';
//         }
//     };

//     return (
//         <div className={`api-param-table-container ${isNested ? 'nested-params-container' : ''}`}>
//             <table className="api-param-table">
//                 <thead>
//                     <tr>
//                         {visibleColumns.map((column) => (
//                             <th key={column.key}>{column.label}</th>
//                         ))}
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {parameters.map((param) => {
//                         const fullPath = getFullPath(param.name);
//                         const hasChildren = param.children && param.children.length > 0;

//                         return (
//                             <React.Fragment key={param.name}>
//                                 <tr
//                                     className={`param-row ${hasChildren ? 'has-children' : ''}`}
//                                     onClick={hasChildren ? (e) => toggleExpand(param.name, e) : undefined}
//                                     style={hasChildren ? { cursor: 'pointer' } : undefined}
//                                 >
//                                     {visibleColumns.map((column) => (
//                                         <td key={column.key}>
//                                             {renderCellContent(param, column.key)}
//                                         </td>
//                                     ))}
//                                 </tr>
//                                 {hasChildren && isExpanded(param.name) && (
//                                     <tr className="nested-param-row">
//                                         <td colSpan={visibleColumns.length} className="nested-params-container">
//                                             <ColorCodedNestedParamsTable
//                                                 parameters={param.children || []}
//                                                 isNested={true}
//                                                 parentPath={fullPath}
//                                             />
//                                         </td>
//                                     </tr>
//                                 )}
//                             </React.Fragment>
//                         );
//                     })}
//                 </tbody>
//             </table>
//         </div>
//     );
// };

// export default ColorCodedNestedParamsTable;
