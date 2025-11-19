import { NextPage } from 'next';

interface TableSkeletonProps {
    columnCount?: number;
    rowCount?: number;
    includeCheckbox?: boolean;
}

const TableSkeleton: NextPage<TableSkeletonProps> = ({
    columnCount = 6,
    rowCount = 3,
    includeCheckbox = true
}) => {
    // Generate column array
    const columns = Array.from({ length: columnCount }, (_, index) => index);
    
    // Generate row array
    const rows = Array.from({ length: rowCount }, (_, index) => index);
    
    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        {includeCheckbox && (
                            <td className="checkbox-cell">
                                <div className="skeleton-checkbox"></div>
                            </td>
                        )}
                        {columns.map((colIndex) => (
                            <td key={`header-col-${colIndex}`}>
                                <div className="skeleton-text"></div>
                            </td>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((rowIndex) => (
                        <tr key={`row-${rowIndex}`}>
                            {includeCheckbox && (
                                <td className="checkbox-cell">
                                    <div className="skeleton-checkbox"></div>
                                </td>
                            )}
                            {columns.map((colIndex) => (
                                <td key={`cell-${rowIndex}-${colIndex}`}>
                                    <div className="skeleton-text"></div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TableSkeleton;