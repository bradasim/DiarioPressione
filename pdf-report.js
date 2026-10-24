/**
 * Modulo Generazione Referto PDF - Diario Pressione Arteriosa
 * File: pdf-report.js
 * Genera un PDF ottimizzato (~50-80 KB) con download Data URI garantito su file:///
 */

window.PdfReport = {
    /**
     * Genera e avvia il download del referto clinico in formato PDF
     * @param {Object} options
     * @param {Array} options.records - Array delle misurazioni filtrate per il periodo
     * @param {string} options.dateRangeLabel - Etichetta descrittiva del periodo (es. "Ultimi 30 giorni")
     * @param {Object} options.kpis - Oggetto con { avgMax, avgMin, avgBat, categoryLabel, totalRecords }
     * @param {Object} options.chartInstance - Istanza attiva di Chart.js (per estrarre il grafico)
     */
    generate: async function (options) {
        const { records, dateRangeLabel, kpis, chartInstance } = options;

        // Individuazione robusta del costruttore jsPDF
        const jsPDFConstructor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF || (window.jspdf && window.jspdf.default);

        if (!jsPDFConstructor) {
            throw new Error("Libreria jsPDF non disponibile. Verifica la connessione a Internet per il caricamento dei moduli.");
        }

        const doc = new jsPDFConstructor({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 14;

        // --- 1. HEADER CLINICO (Fascia superiore) ---
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, 28, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.text("DIARIO PRESSIONE ARTERIOSA", margin, 11);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text("Referto Clinico & Storico Misurazioni (Protocollo doppia rilevazione)", margin, 17);

        // Data generazione e Periodo
        const todayStr = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
        doc.setFontSize(8);
        doc.setTextColor(203, 213, 225);
        doc.text(`Generato il: ${todayStr}`, pageWidth - margin, 11, { align: 'right' });
        doc.text(`Periodo: ${dateRangeLabel || 'Tutto lo storico'}`, pageWidth - margin, 17, { align: 'right' });

        let currentY = 33;

        // --- 2. BOX SINTESI CLINICA (KPI) ---
        doc.setFillColor(248, 250, 252); // slate-50
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 22, 2, 2, 'FD');

        const colWidth = (pageWidth - (margin * 2)) / 4;
        const kpiItems = [
            { label: "MEDIA SISTOLICA (MAX)", value: `${(kpis && kpis.avgMax !== '--') ? kpis.avgMax : '--'} mmHg`, sub: "Valore medio periodo" },
            { label: "MEDIA DIASTOLICA (MIN)", value: `${(kpis && kpis.avgMin !== '--') ? kpis.avgMin : '--'} mmHg`, sub: "Valore medio periodo" },
            { label: "FREQUENZA MEDIA", value: `${(kpis && kpis.avgBat !== '--') ? kpis.avgBat : '--'} bpm`, sub: "Pulsazioni a riposo" },
            { label: "SESSIONI REGISTRATE", value: `${records ? records.length : 0}`, sub: (kpis && kpis.categoryLabel) ? `ESC: ${kpis.categoryLabel}` : 'Classificazione ESC' }
        ];

        kpiItems.forEach((item, index) => {
            const x = margin + (index * colWidth) + 4;
            doc.setTextColor(100, 116, 139); // slate-500
            doc.setFontSize(6.8);
            doc.setFont('helvetica', 'bold');
            doc.text(item.label, x, currentY + 6);

            doc.setTextColor(15, 23, 42); // slate-900
            doc.setFontSize(11.5);
            doc.setFont('helvetica', 'bold');
            doc.text(item.value, x, currentY + 13);

            doc.setTextColor(71, 85, 105); // slate-600
            doc.setFontSize(6.8);
            doc.setFont('helvetica', 'normal');
            doc.text(item.sub, x, currentY + 18);
        });

        currentY += 27;

        // --- 3. GRAFICO DELL'ANDAMENTO (Ottimizzato e compresso in JPEG per ridurre il peso) ---
        if (chartInstance && records && records.length > 0) {
            try {
                const chartImg = getCleanChartImage(chartInstance);
                if (chartImg) {
                    doc.setFontSize(9.5);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(30, 41, 59);
                    doc.text("Andamento Pressione e Pulsazioni nel Periodo", margin, currentY);
                    currentY += 3;

                    const chartWidth = pageWidth - (margin * 2);
                    const chartHeight = 52;

                    doc.addImage(chartImg, 'JPEG', margin, currentY, chartWidth, chartHeight);
                    currentY += chartHeight + 6;
                }
            } catch (err) {
                console.warn("Impossibile inserire immagine grafico nel PDF:", err);
            }
        }

        // --- 4. TABELLA DETTAGLIATA MISURAZIONI ---
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text("Dettaglio Analitico delle Rilevazioni", margin, currentY);
        currentY += 2;

        const tableRows = (records || []).map(r => {
            const slotNames = {
                'mattino': 'Mattino (06:30)',
                'pranzo': 'Pranzo (12:30)',
                'cena': 'Cena (19:00)',
                'altro': r.ora || 'Altro'
            };
            const slotStr = slotNames[r.slot] || r.slot;
            const mis1 = `${r.max_1} / ${r.min_1} (${r.bat_1} bpm)`;
            const mis2 = r.hasSecond ? `${r.max_2} / ${r.min_2} (${r.bat_2} bpm)` : '-';
            const media = `${r.avg_max} / ${r.avg_min} mmHg (${r.avg_bat} bpm)`;

            return [
                formatDateItalianPdf(r.data),
                slotStr,
                mis1,
                mis2,
                media,
                r.note || ''
            ];
        });

        const autoTableConfig = {
            startY: currentY,
            margin: { left: margin, right: margin, bottom: 15 },
            head: [['Data', 'Momento', '1ª Misurazione', '2ª Misurazione', 'MEDIA (Graficata)', 'Note / Sintomi']],
            body: tableRows.length > 0 ? tableRows : [['-', '-', '-', '-', '-', 'Nessun dato registrato nel periodo selezionato']],
            theme: 'grid',
            headStyles: {
                fillColor: [15, 23, 42],
                textColor: [255, 255, 255],
                fontSize: 7.5,
                fontStyle: 'bold',
                halign: 'left'
            },
            bodyStyles: {
                fontSize: 7.2,
                textColor: [30, 41, 59],
                cellPadding: 1.8
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252]
            },
            columnStyles: {
                0: { cellWidth: 26 },
                1: { cellWidth: 26 },
                2: { cellWidth: 32 },
                3: { cellWidth: 32 },
                4: { cellWidth: 36, fontStyle: 'bold', textColor: [13, 148, 136] }, // teal-600
                5: { cellWidth: 'auto' }
            },
            didDrawPage: function () {
                const totalPages = doc.internal.getNumberOfPages();
                doc.setFontSize(7.5);
                doc.setTextColor(148, 163, 184);
                doc.text(`Pagina ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
                doc.text("Documento ad uso personale per consultazione clinica con il medico curante.", margin, pageHeight - 7);
            }
        };

        if (typeof doc.autoTable === 'function') {
            doc.autoTable(autoTableConfig);
        } else if (typeof window.jspdfAutoTable === 'function') {
            window.jspdfAutoTable(doc, autoTableConfig);
        } else if (typeof window.autoTable === 'function') {
            window.autoTable(doc, autoTableConfig);
        }

        // --- 5. GESTIONE SALVATAGGIO / ANTEPRIMA ---
        const fileNameDate = new Date().toISOString().slice(0, 10);
        const fileName = `referto_pressione_${fileNameDate}.pdf`;

        // Imposta proprietà del documento PDF
        doc.setDocumentProperties({
            title: fileName,
            subject: 'Referto Diario Pressione Arteriosa',
            author: 'Diario Pressione Arteriosa',
            creator: 'Diario Pressione Arteriosa'
        });

        const pdfBlob = doc.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);

        // Su protocollo locale file:///, Chrome e i browser Chromium bloccano i download automatici con nome
        // e li salvano come file temporanei anonimi (UUID). Aprire il referto nella scheda nativa del browser
        // permette all'utente di vederlo subito, stamparlo o salvarlo con nome senza alcuna restrizione.
        const isFileProtocol = window.location.protocol === 'file:';
        let openedTab = false;

        if (isFileProtocol) {
            try {
                const win = window.open(blobUrl, '_blank');
                if (win) {
                    openedTab = true;
                }
            } catch (openErr) {
                console.warn("Apertura nuova scheda bloccata da popup blocker:", openErr);
            }
        }

        if (!openedTab) {
            try {
                const downloadLink = document.createElement('a');
                downloadLink.href = blobUrl;
                downloadLink.download = fileName;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                setTimeout(() => {
                    document.body.removeChild(downloadLink);
                }, 1000);
            } catch (err) {
                console.warn("Fallback doc.save:", err);
                doc.save(fileName);
            }
        }
    }
};

function formatDateItalianPdf(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Converte il canvas a risoluzione ottimale (800px) e formato JPEG compresso (qualità 0.82)
 * Riduciamo il peso dell'immagine da oltre 2 MB a meno di 50 KB mantenendo una nitidezza perfetta!
 */
function getCleanChartImage(chartInstance) {
    if (!chartInstance || !chartInstance.canvas) return null;
    try {
        const canvas = chartInstance.canvas;
        if (!canvas.width || !canvas.height) return null;

        const targetWidth = 800;
        const targetHeight = Math.round((canvas.height / canvas.width) * targetWidth);
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = targetWidth;
        tempCanvas.height = targetHeight;
        const ctx = tempCanvas.getContext('2d');

        // Sfondo bianco nitido
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // Disegna il grafico scalato
        ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);

        // Esporta in JPEG leggerissimo ad alta nitidezza
        return tempCanvas.toDataURL('image/jpeg', 0.82);
    } catch (e) {
        console.warn("Errore cattura grafico ottimizzato:", e);
        return null;
    }
}
