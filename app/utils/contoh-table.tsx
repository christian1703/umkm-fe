"use client"

import { CustomFilter, DataTable, Field } from "@/components/app-table"
import { useState } from "react";

export default function ContohTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const sampleData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'Manager', status: 'Active' },
    { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User', status: 'Active' },
    { id: 12, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 23, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 34, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
    { id: 45, name: 'Alice Williams', email: 'alice@example.com', role: 'Manager', status: 'Active' },
    { id: 53, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User', status: 'Active' },
    { id: 15, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 242, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 33, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
    { id: 554, name: 'Alice Williams', email: 'alice@example.com', role: 'Manager', status: 'Active' },
    { id: 65, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User', status: 'Active' },
  ];

  const fields: Field[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true, filterable: true },
    { key: 'email', label: 'Email', filterable: true },
    { 
      key: 'role', 
      label: 'Role', 
      sortable: true, 
      filterable: true,
      render: (value) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value === 'Admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (value) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
  ];

  const customFilters: CustomFilter[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'All', value: '' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      onFilterChange: (value) => {
        console.log('Custom filter changed:', value);
        // Here you would typically make an API call with the filter
      },
    },
  ];
  
  
  return <>
   <DataTable
        headerName="Transactions"
        fields={fields}
        data={sampleData}
        acl={{
          canView: true,
          canAdd: false,
          canUpdate: false,
          canDelete: true,
        }}
        actions={{
          onView: (row) => alert(`View: ${JSON.stringify(row)}`),
          onAdd: () => alert('Add new item'),
          onUpdate: (row) => alert(`Update: ${JSON.stringify(row)}`),
          onDelete: (row) => alert(`Delete: ${JSON.stringify(row)}`),
        }}
        customFilters={customFilters}
        pagination={{
          currentPage,
          totalPages: 3,
          pageSize,
          totalItems: 25,
        }}
        onPageChange={(page) => {
          setCurrentPage(page);
          console.log('Page changed to:', page);
          // Make API call here
        }}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
          console.log('Page size changed to:', size);
          // Make API call here
        }}
      />
  </>
}