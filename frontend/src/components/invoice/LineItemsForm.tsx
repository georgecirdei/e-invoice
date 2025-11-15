'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { CreateInvoiceLineItem } from '@/types/invoice';

interface LineItemsFormProps {
  lineItems: CreateInvoiceLineItem[];
  onChange: (items: CreateInvoiceLineItem[]) => void;
  errors?: any;
}

export const LineItemsForm: React.FC<LineItemsFormProps> = ({
  lineItems,
  onChange,
  errors = {},
}) => {
  const addLineItem = () => {
    onChange([
      ...lineItems,
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 0,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    const newItems = lineItems.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const updateLineItem = (index: number, field: keyof CreateInvoiceLineItem, value: any) => {
    const newItems = [...lineItems];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    onChange(newItems);
  };

  const calculateLineTotal = (item: CreateInvoiceLineItem) => {
    const subtotal = item.quantity * item.unitPrice;
    const tax = (subtotal * item.taxRate) / 100;
    return subtotal + tax;
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const calculateTotalTax = () => {
    return lineItems.reduce((sum, item) => {
      const subtotal = item.quantity * item.unitPrice;
      return sum + (subtotal * item.taxRate) / 100;
    }, 0);
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTotalTax();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Line Items</h3>
        <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
          + Add Item
        </Button>
      </div>

      {lineItems.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-2">No items added yet</p>
          <Button type="button"  size="sm" onClick={addLineItem}>
            + Add First Item
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {lineItems.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-700">Item #{index + 1}</span>
                {lineItems.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeLineItem(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Input
                  label="Description"
                  type="text"
                  placeholder="Product or service description"
                  value={item.description}
                  onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                  error={errors[`lineItems.${index}.description`]?.message}
                  required
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Input
                    label="Quantity"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    error={errors[`lineItems.${index}.quantity`]?.message}
                    required
                  />

                  <Input
                    label="Unit Price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    error={errors[`lineItems.${index}.unitPrice`]?.message}
                    required
                  />

                  <Input
                    label="Tax Rate (%)"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={item.taxRate}
                    onChange={(e) => updateLineItem(index, 'taxRate', parseFloat(e.target.value) || 0)}
                    error={errors[`lineItems.${index}.taxRate`]?.message}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total
                    </label>
                    <div className="px-3 py-2 bg-primary-50 border border-primary-200 rounded-md text-primary-900 font-semibold">
                      ${calculateLineTotal(item).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Totals Summary */}
          <div className="border-t-2 border-gray-300 pt-4 mt-6">
            <div className="space-y-2 max-w-md ml-auto">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">${calculateTotalTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-primary-600">${calculateGrandTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

