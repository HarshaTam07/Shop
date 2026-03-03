import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Item, Transaction, Debt } from '@/types';

// Export Items to Excel
export const exportItemsToExcel = (items: Item[]) => {
  const data = items.map(item => ({
    Name: item.name,
    'Meta Names': item.metaNames.join(', '),
    Stock: item.quantity,
    Price: item.amount,
    Weight: item.weight || '',
    Category: item.category || '',
    Type: item.type || '',
    'Size Type': item.sizeType || '',
    'Created At': new Date(item.createdAt).toLocaleString(),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Items');
  XLSX.writeFile(wb, `items_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export Items to PDF
export const exportItemsToPDF = (items: Item[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Items Report', 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

  const tableData = items.map(item => [
    item.name,
    item.quantity,
    `₹${item.amount.toFixed(2)}`,
    item.weight || '-',
    item.category || '-',
    item.type || '-',
  ]);

  autoTable(doc, {
    head: [['Name', 'Stock', 'Price', 'Weight', 'Category', 'Type']],
    body: tableData,
    startY: 35,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save(`items_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export Transactions to Excel
export const exportTransactionsToExcel = (transactions: Transaction[]) => {
  const data = transactions.flatMap(txn => {
    // Create a row for each line item
    return txn.lines.map((line, index) => ({
      'Transaction Name': index === 0 ? (txn.name || '-') : '',
      'Date': index === 0 ? new Date(txn.createdAt).toLocaleString() : '',
      'Item Name': line.name,
      'Quantity': line.qty,
      'Unit Price': line.unitPrice,
      'Line Total': line.finalLineTotal,
      'Cart Total': index === 0 ? txn.finalTotal : '',
      'Debt Payment': index === 0 ? (txn.debtPayment?.amount || 0) : '',
      'Debt Customer': index === 0 ? (txn.debtPayment?.customerName || '-') : '',
      'Custom Amount': index === 0 ? (txn.customAmount || 0) : '',
      'Grand Total': index === 0 ? (txn.finalTotal + (txn.debtPayment?.amount || 0) + (txn.customAmount || 0)) : '',
      'Paid Amount': index === 0 ? (txn.paidAmount ?? txn.finalTotal) : '',
      'Status': index === 0 ? (txn.status || 'PAID') : '',
    }));
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
  XLSX.writeFile(wb, `transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export Transactions to PDF
export const exportTransactionsToPDF = (transactions: Transaction[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Transactions Report', 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

  let startY = 35;

  transactions.forEach((txn, txnIndex) => {
    // Check if we need a new page
    if (startY > 250) {
      doc.addPage();
      startY = 20;
    }

    // Transaction header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Transaction: ${txn.name || 'Unnamed'}`, 14, startY);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date(txn.createdAt).toLocaleString()}`, 14, startY + 5);
    doc.text(`Status: ${txn.status || 'PAID'}`, 14, startY + 10);

    // Items table
    const itemsData = txn.lines.map(line => [
      line.name,
      line.qty,
      `₹${line.unitPrice.toFixed(2)}`,
      `₹${line.finalLineTotal.toFixed(2)}`,
    ]);

    autoTable(doc, {
      head: [['Item', 'Qty', 'Unit Price', 'Total']],
      body: itemsData,
      startY: startY + 15,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14 },
    });

    // Get the final Y position after the table
    const finalY = (doc as any).lastAutoTable.finalY;

    // Totals
    doc.setFontSize(9);
    let totalY = finalY + 5;
    doc.text(`Cart Total: ₹${txn.finalTotal.toFixed(2)}`, 14, totalY);
    
    if (txn.debtPayment && txn.debtPayment.amount > 0) {
      totalY += 5;
      doc.text(`Debt Payment (${txn.debtPayment.customerName}): ₹${txn.debtPayment.amount.toFixed(2)}`, 14, totalY);
    }
    
    if (txn.customAmount && txn.customAmount > 0) {
      totalY += 5;
      doc.text(`Custom Amount: ₹${txn.customAmount.toFixed(2)}`, 14, totalY);
    }

    totalY += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`Grand Total: ₹${(txn.finalTotal + (txn.debtPayment?.amount || 0) + (txn.customAmount || 0)).toFixed(2)}`, 14, totalY);
    doc.setFont('helvetica', 'normal');

    // Add separator line
    startY = totalY + 10;
    if (txnIndex < transactions.length - 1) {
      doc.setDrawColor(200, 200, 200);
      doc.line(14, startY, 196, startY);
      startY += 10;
    }
  });

  doc.save(`transactions_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export Debts to Excel
export const exportDebtsToExcel = (debts: Debt[]) => {
  const data = debts.map(debt => ({
    'Customer Name': debt.customerName,
    Date: new Date(debt.date).toLocaleDateString(),
    'Total Owed': debt.totalOwed,
    'Total Paid': debt.totalPaid,
    Balance: debt.balance,
    Status: debt.status,
    'Payment Count': debt.history.length,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Debts');
  XLSX.writeFile(wb, `debts_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export Debts to PDF
export const exportDebtsToPDF = (debts: Debt[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Debts Report', 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

  const tableData = debts.map(debt => [
    debt.customerName,
    new Date(debt.date).toLocaleDateString(),
    `₹${debt.totalOwed.toFixed(2)}`,
    `₹${debt.totalPaid.toFixed(2)}`,
    `₹${debt.balance.toFixed(2)}`,
    debt.status,
  ]);

  autoTable(doc, {
    head: [['Customer', 'Date', 'Total Owed', 'Total Paid', 'Balance', 'Status']],
    body: tableData,
    startY: 35,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save(`debts_${new Date().toISOString().split('T')[0]}.pdf`);
};
