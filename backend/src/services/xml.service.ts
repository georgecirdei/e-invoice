import { Builder } from 'xml2js';
import prisma from '../config/database';
import logger from '../utils/logger';

/**
 * Generate XML for government e-invoice submission
 * Format compatible with common e-invoice standards (UBL, PEPPOL)
 */
export async function generateInvoiceXML(invoiceId: string): Promise<string> {
  try {
    // Get invoice with all details
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        lineItems: {
          orderBy: { createdAt: 'asc' },
        },
        customer: true,
        organization: true,
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Build XML structure (UBL-like format)
    const xmlObject = {
      Invoice: {
        $: {
          xmlns: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
          'xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
          'xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
        },
        'cbc:ID': invoice.invoiceNumber,
        'cbc:IssueDate': new Date(invoice.invoiceDate).toISOString().split('T')[0],
        'cbc:DueDate': invoice.dueDate
          ? new Date(invoice.dueDate).toISOString().split('T')[0]
          : undefined,
        'cbc:InvoiceTypeCode': '380', // Commercial invoice
        'cbc:DocumentCurrencyCode': invoice.currency,
        'cbc:TaxCurrencyCode': invoice.currency,

        // Supplier (Organization)
        'cac:AccountingSupplierParty': {
          'cac:Party': {
            'cac:PartyName': {
              'cbc:Name': invoice.organization.name,
            },
            'cac:PostalAddress': {
              'cbc:StreetName': invoice.organization.address || '',
              'cbc:CityName': invoice.organization.city || '',
              'cbc:PostalZone': invoice.organization.postalCode || '',
              'cbc:CountrySubentity': invoice.organization.state || '',
              'cac:Country': {
                'cbc:IdentificationCode': invoice.organization.country,
              },
            },
            'cac:PartyTaxScheme': {
              'cbc:CompanyID': invoice.organization.taxId,
              'cac:TaxScheme': {
                'cbc:ID': 'VAT',
              },
            },
            'cac:Contact': {
              'cbc:Telephone': invoice.organization.phone || '',
              'cbc:ElectronicMail': invoice.organization.email,
            },
          },
        },

        // Customer
        'cac:AccountingCustomerParty': {
          'cac:Party': {
            'cac:PartyName': {
              'cbc:Name': invoice.customer.name,
            },
            'cac:PostalAddress': {
              'cbc:StreetName': invoice.customer.address || '',
              'cbc:CityName': invoice.customer.city || '',
              'cbc:PostalZone': invoice.customer.postalCode || '',
              'cbc:CountrySubentity': invoice.customer.state || '',
              'cac:Country': {
                'cbc:IdentificationCode': invoice.customer.country,
              },
            },
            'cac:PartyTaxScheme': invoice.customer.taxId
              ? {
                  'cbc:CompanyID': invoice.customer.taxId,
                  'cac:TaxScheme': {
                    'cbc:ID': 'VAT',
                  },
                }
              : undefined,
            'cac:Contact': {
              'cbc:Telephone': invoice.customer.phone || '',
              'cbc:ElectronicMail': invoice.customer.email,
            },
          },
        },

        // Tax Total
        'cac:TaxTotal': {
          'cbc:TaxAmount': {
            _: Number(invoice.taxAmount).toFixed(2),
            $: { currencyID: invoice.currency },
          },
        },

        // Monetary Totals
        'cac:LegalMonetaryTotal': {
          'cbc:LineExtensionAmount': {
            _: Number(invoice.subtotal).toFixed(2),
            $: { currencyID: invoice.currency },
          },
          'cbc:TaxExclusiveAmount': {
            _: Number(invoice.subtotal).toFixed(2),
            $: { currencyID: invoice.currency },
          },
          'cbc:TaxInclusiveAmount': {
            _: Number(invoice.totalAmount).toFixed(2),
            $: { currencyID: invoice.currency },
          },
          'cbc:PayableAmount': {
            _: Number(invoice.totalAmount).toFixed(2),
            $: { currencyID: invoice.currency },
          },
        },

        // Invoice Lines
        'cac:InvoiceLine': invoice.lineItems.map((item: any, index: number) => ({
          'cbc:ID': (index + 1).toString(),
          'cbc:InvoicedQuantity': {
            _: Number(item.quantity).toFixed(2),
            $: { unitCode: 'EA' }, // Each
          },
          'cbc:LineExtensionAmount': {
            _: (Number(item.quantity) * Number(item.unitPrice)).toFixed(2),
            $: { currencyID: invoice.currency },
          },
          'cac:Item': {
            'cbc:Description': item.description,
          },
          'cac:Price': {
            'cbc:PriceAmount': {
              _: Number(item.unitPrice).toFixed(2),
              $: { currencyID: invoice.currency },
            },
          },
          'cac:TaxTotal': {
            'cbc:TaxAmount': {
              _: Number(item.taxAmount).toFixed(2),
              $: { currencyID: invoice.currency },
            },
            'cac:TaxSubtotal': {
              'cbc:TaxableAmount': {
                _: (Number(item.quantity) * Number(item.unitPrice)).toFixed(2),
                $: { currencyID: invoice.currency },
              },
              'cbc:TaxAmount': {
                _: Number(item.taxAmount).toFixed(2),
                $: { currencyID: invoice.currency },
              },
              'cac:TaxCategory': {
                'cbc:ID': 'S', // Standard rate
                'cbc:Percent': Number(item.taxRate).toFixed(2),
                'cac:TaxScheme': {
                  'cbc:ID': 'VAT',
                },
              },
            },
          },
        })),

        // Notes
        'cbc:Note': invoice.notes || '',
      },
    };

    // Build XML string
    const builder = new Builder({
      renderOpts: { pretty: true, indent: '  ' },
      xmldec: { version: '1.0', encoding: 'UTF-8' },
    });

    const xml = builder.buildObject(xmlObject);

    logger.info(`XML generated for invoice: ${invoice.invoiceNumber}`);

    return xml;
  } catch (error) {
    logger.error('XML generation error:', error);
    throw new Error('Failed to generate XML');
  }
}

