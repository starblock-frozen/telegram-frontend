export const exportToCSV = (data, filename) => {
  const headers = [
    'Domain Name',
    'Country',
    'Category',
    'DA',
    'PA',
    'SS',
    'Backlinks',
    'Price',
    'Status',
    'Panel Link',
    'Panel Username',
    'Panel Password',
    'Shell Link',
    'Hosting Link',
    'Hosting Username',
    'Hosting Password',
    'Ischannel',
    'Created At',
    'Updated At'
  ];

  const csvContent = [
    headers.join(','),
    ...data.map(domain => [
      `"${domain.domainName || ''}"`,
      `"${domain.country || ''}"`,
      `"${domain.category || ''}"`,
      domain.da || 0,
      domain.pa || 0,
      domain.ss || 0,
      domain.backlink || 0,
      domain.price || 0,
      domain.status ? 'Available' : 'Sold',
      `"${domain.panelLink || ''}"`,
      `"${domain.panelUsername || ''}"`,
      `"${domain.panelPassword || ''}"`,
      `"${domain.goodLink || ''}"`,
      `"${domain.hostingLink || ''}"`,
      `"${domain.hostingUsername || ''}"`,
      `"${domain.hostingPassword || ''}"`,
      domain.ischannel ? 'Posted' : 'Not Posted',
      `"${domain.createdAt || ''}"`,
      `"${domain.updatedAt || ''}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportSearchResultsToCSV = (data, filename) => {
  const headers = [
    'Domain Name',
    'Search Status',
    'Country',
    'Category',
    'DA',
    'PA',
    'SS',
    'Backlinks',
    'Price',
    'Status',
    'Channel Status',
    'Panel Link',
    'Panel Username',
    'Panel Password',
    'Shell Link',
    'Hosting Link',
    'Hosting Username',
    'Hosting Password',
    'Created At',
    'Updated At'
  ];

  const csvContent = [
    headers.join(','),
    ...data.map(domain => [
      `"${domain.domainName || ''}"`,
      domain.found ? 'Found' : 'Not Found',
      `"${domain.country || ''}"`,
      `"${domain.category || ''}"`,
      domain.da || 0,
      domain.pa || 0,
      domain.ss || 0,
      domain.backlink || 0,
      domain.price || 0,
      domain.found ? (domain.status ? 'Available' : 'Sold') : '-',
      domain.found ? (domain.ischannel ? 'Posted' : 'Not Posted') : '-',
      `"${domain.panelLink || ''}"`,
      `"${domain.panelUsername || ''}"`,
      `"${domain.panelPassword || ''}"`,
      `"${domain.goodLink || ''}"`,
      `"${domain.hostingLink || ''}"`,
      `"${domain.hostingUsername || ''}"`,
      `"${domain.hostingPassword || ''}"`,
      `"${domain.createdAt || ''}"`,
      `"${domain.updatedAt || ''}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportTicketsToCSV = (data, filename) => {
  const headers = [
    'Customer ID',
    'Requested Domains',
    'Request Time',
    'Price',
    'Status',
    'Created At',
    'Updated At'
  ];

  const csvContent = [
    headers.join(','),
    ...data.map(ticket => [
      `"${ticket.customer_id || ''}"`,
      `"${ticket.request_domains ? ticket.request_domains.join('; ') : ''}"`,
      `"${ticket.request_time || ''}"`,
      ticket.price || 0,
      `"${ticket.status || ''}"`,
      `"${ticket.createdAt || ''}"`,
      `"${ticket.updatedAt || ''}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const downloadCSVTemplate = () => {
  const headers = [
    'Domain Name',
    'Country',
    'Category',
    'DA',
    'PA',
    'SS',
    'Backlinks',
    'Price',
    'Status',
    'Panel Link',
    'Panel Username',
    'Panel Password',
    'Shell Link',
    'Hosting Link',
    'Hosting Username',
    'Hosting Password',
    'Ischannel'
  ];

  const sampleData = [
    'example.com',
    'United States',
    'GOV',
    '85',
    '75',
    '5',
    '1500',
    '2500',
    'Available',
    'https://panel.example.com',
    'admin',
    'password123',
    'https://shell.example.com',
    'https://hosting.example.com',
    'hostuser',
    'hostpass',
    'false'
  ];

  const csvContent = [
    headers.join(','),
    sampleData.map(field => `"${field}"`).join(',')
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'domain_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
