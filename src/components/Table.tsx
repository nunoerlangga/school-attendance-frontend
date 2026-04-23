import React from 'react';

interface Column {
  header: string;
  accessor: string | ((row: any) => React.ReactNode);
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps {
  columns: Column[];
  data: any[];
  keyField: string;
  rowStyle?: (row: any) => React.CSSProperties | undefined;
}

export const Table: React.FC<TableProps> = ({ columns, data, keyField, rowStyle }) => {
  return (
    <div className="table-container" style={{ margin: 0, boxShadow: 'none', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
      <table className="data-table" style={{ width: '100%' }}>
        <thead style={{ backgroundColor: '#f9fafb' }}>
          <tr>
            {columns.map((col, i) => (
              <th key={i} style={{ width: col.width, textAlign: col.align || 'left', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                Tidak ada data
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row[keyField]} style={rowStyle ? rowStyle(row) : undefined} className="hover-row">
                {columns.map((col, i) => (
                  <td key={i} style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', textAlign: col.align || 'left', borderBottom: '1px solid #f1f5f9' }}>
                    {typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
