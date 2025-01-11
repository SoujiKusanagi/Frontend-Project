import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useReactTable, getCoreRowModel, getPaginationRowModel, ColumnDef, flexRender, getFilteredRowModel } from '@tanstack/react-table';

interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    image: string;
}

const fetchProducts = async (): Promise<Product[]> => {
    try {
      const response = await axios.get('https://dummyjson.com/products');
      return response.data.products;
    } catch (error) {
      throw new Error('Failed to fetch products. Please try again later.');
    }
};

const ProductList: React.FC = () => {
    const { data, error, isLoading } = useQuery<Product[], Error>({
      queryKey: ['products'],
      queryFn: fetchProducts,
      retry: 2,
    });

    const [globalFilter, setGlobalFilter] = useState('');
    const [priceFilter, setPriceFilter] = useState<number | null>(null);

    const columns = React.useMemo<ColumnDef<Product>[]>(
      () => [
        {
          header: 'ID',
          accessorKey: 'id',
        },
        {
          header: 'Title',
          accessorKey: 'title',
        },
        {
          header: 'Price',
          accessorKey: 'price',
          cell: (info) => `$${info.getValue()}`,
        },
        {
          header: 'Description',
          accessorKey: 'description',
        },
        {
          header: 'Image',
          accessorKey: 'image',
          cell: (info) => (
            <img src={info.getValue() as string} alt="Product" style={{ width: '50px' }} />
          ),
        },
      ],
      []
    );

    const filteredData = React.useMemo(() => {
        if (!data) return [];
        let filtered = data;

        if (priceFilter) {
          filtered = filtered.filter((product) => product.price <= priceFilter);
        }

        if (globalFilter) {
          filtered = filtered.filter((product) =>
            product.title.toLowerCase().includes(globalFilter.toLowerCase())
          );
        }

      return filtered;
    }, [data, priceFilter, globalFilter]);

    const table = useReactTable({
        data: filteredData, columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
    });

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <div>Loading...</div>
                <div>Please wait while we fetch the data.</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                <div>An error occurred: {error.message}</div>
                <div>Please try again later.</div>
            </div>
        );
    }

    return (
        <div>
            <h1>Product List</h1>

            <div>
                <input
                    type="text"
                    placeholder="Search by title..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                />
            </div>

            <div>
                <label>
                    Filter by Price (Max):
                        <input
                            type="text"
                            placeholder="Enter max price..."
                            value={priceFilter || ''}
                            onChange={(e) => setPriceFilter(Number(e.target.value))}
                        />
                </label>
            </div>

            <table>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map ((header) => (
                                <th key={header.id}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div>
                <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                    Previous
                </button>
                <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                    Next
                </button>
                <span>
                    Page{' '}
                    <strong>
                        {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </strong>
                </span>
            </div>
        </div>
    )
}

export default ProductList;