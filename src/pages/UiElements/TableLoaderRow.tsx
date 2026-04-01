import React from 'react';
import { Loader2 } from 'lucide-react';

interface TableLoaderRowProps {
  colSpan: number;
  message?: string;
}

const TableLoaderRow: React.FC<TableLoaderRowProps> = ({
  colSpan,
  message,
}) => (
  <tr>
    <td colSpan={colSpan} className="text-center py-20">
      <Loader2 className="animate-spin mx-auto text-[#3E2723]" size={40} />
      {message ? (
        <p className="text-gray-400 text-xs mt-2 font-bold uppercase tracking-widest">
          {message}
        </p>
      ) : null}
    </td>
  </tr>
);

export default TableLoaderRow;
