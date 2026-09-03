import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'

export async function downloadLoveNotePdf(element: HTMLElement, filename: string) {
  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: '#ffffff',
  })

  // Requirement: one landscape 7 × 5 inch page, matching the website preview.
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'in', format: [7, 5], compress: true })
  pdf.addImage(dataUrl, 'PNG', 0, 0, 7, 5, undefined, 'FAST')
  pdf.save(`${filename}.pdf`)
}
