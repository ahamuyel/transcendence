const Table = ({
  columns,
  renderRow,
  data
}: {
  columns: { header: string; accessor: string; className?: string }[];
  renderRow: (item: any) => React.ReactNode;
  data: any[];
}) => {
    return (
        <table className="w-full mt-2 sm:mt-4 border-separate border-spacing-0">
            <thead>
                <tr className="text-left text-zinc-400 dark:text-zinc-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                    {columns.map((col) => (
                        <th
                            key={col.accessor}
                            className={`pb-2 sm:pb-4 px-1.5 sm:px-2 ${col.className ?? ""}`}
                        >
                            {col.header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {data.map((item) => renderRow(item))}
            </tbody>
        </table>
    )
}

export default Table
