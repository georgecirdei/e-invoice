import apiClient from './api';

/**
 * Download invoice as PDF
 */
export async function downloadInvoicePDF(invoiceId: string, invoiceNumber: string) {
  try {
    const response = await apiClient.get(`/invoices/${invoiceId}/pdf`, {
      responseType: 'blob',
    });

    // Create blob URL
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error('Failed to download PDF');
  }
}

/**
 * Download invoice as XML
 */
export async function downloadInvoiceXML(invoiceId: string, invoiceNumber: string) {
  try {
    const response = await apiClient.get(`/invoices/${invoiceId}/xml`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoiceNumber}.xml`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error('Failed to download XML');
  }
}

/**
 * Email invoice to customer
 */
export async function emailInvoice(invoiceId: string) {
  const response = await apiClient.post(`/invoices/${invoiceId}/email`);
  return response.data;
}

