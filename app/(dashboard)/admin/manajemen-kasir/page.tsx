"use client"

import { CustomFilter, DataTable, Field } from "@/components/app-table"
import { useState } from "react";

export default function AdminKasirPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const sampleData = [
    { id: 1, name: 'asep', username : 'asep123', password: 'asep321', nomor_wa:'0812-3921-8174'},
    { id: 2, name: 'yyyy', username : 'yyy543', password: '(password telah diganti)', nomor_wa:'0812-1234-5678'},

  ];

  const fields: Field[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true, filterable: true },
    { key: 'username', label: 'Username', filterable: true },
    { key: 'password', label: 'password', filterable: true },
    { key: 'nomor_wa', label: 'Nomor WhatsApp', filterable: true },
    
   
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
        headerName="Managemen Kasir"
        fields={fields}
        data={sampleData}
        acl={{
          canView: false,
          canAdd: true,
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