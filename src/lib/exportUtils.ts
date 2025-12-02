import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in values
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (
  title: string,
  headers: string[],
  data: any[][],
  filename: string
) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text(title, 14, 15);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22);
  
  // Add table
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 28,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  doc.save(`${filename}.pdf`);
};

export const exportAttendanceToPDF = (attendance: any[], filename: string) => {
  const headers = ['Student Name', 'Status', 'Date', 'Notes'];
  const data = attendance.map(a => [
    a.student?.full_name || 'N/A',
    a.status,
    new Date(a.created_at).toLocaleDateString(),
    a.notes || '-'
  ]);
  
  exportToPDF('Attendance Report', headers, data, filename);
};

export const exportAttendanceToCSV = (attendance: any[], filename: string) => {
  const csvData = attendance.map(a => ({
    'Student Name': a.student?.full_name || 'N/A',
    'Status': a.status,
    'Date': new Date(a.created_at).toLocaleDateString(),
    'Notes': a.notes || '-'
  }));
  
  exportToCSV(csvData, filename);
};

export const exportPerformanceNotesToPDF = (notes: any[], filename: string) => {
  const headers = ['Student', 'Category', 'Rating', 'Note', 'Date'];
  const data = notes.map(n => [
    n.student?.full_name || 'N/A',
    n.category,
    n.rating ? `${n.rating}/10` : '-',
    n.note,
    new Date(n.created_at).toLocaleDateString()
  ]);
  
  exportToPDF('Performance Notes Report', headers, data, filename);
};

export const exportPerformanceNotesToCSV = (notes: any[], filename: string) => {
  const csvData = notes.map(n => ({
    'Student': n.student?.full_name || 'N/A',
    'Category': n.category,
    'Rating': n.rating ? `${n.rating}/10` : '-',
    'Note': n.note,
    'Date': new Date(n.created_at).toLocaleDateString()
  }));
  
  exportToCSV(csvData, filename);
};

export const exportAnalyticsToPDF = (
  studentName: string,
  attendanceRate: number,
  performanceData: any[],
  filename: string
) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text('Student Performance Analytics', 14, 15);
  
  // Student info
  doc.setFontSize(12);
  doc.text(`Student: ${studentName}`, 14, 25);
  doc.text(`Attendance Rate: ${attendanceRate}%`, 14, 32);
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 39);
  
  // Performance data table
  if (performanceData.length > 0) {
    const headers = ['Category', 'Average Rating', 'Notes Count'];
    const data = performanceData.map(p => [
      p.category,
      p.avgRating ? p.avgRating.toFixed(1) : '-',
      p.count
    ]);
    
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 45,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] },
    });
  }
  
  doc.save(`${filename}.pdf`);
};
