/**
 * Modulo Generazione Referto PDF - Diario Pressione Arteriosa
 * File: pdf-report.js
 * Supporta intestazione clinica con dati paziente, ottimizzazione peso (~50-80 KB),
 * apertura nativa su file:///, download automatico e condivisione via Web Share API
 */

window.PdfReport = {
    /**
     * Costruisce il documento jsPDF con tutti i dati clinici, statistiche, grafico e tabella
     * @param {Object} options
     * @returns {Object} { doc, fileName }
     */
    buildPdfDocument: function (options) {
        const { records, dateRangeLabel, kpis, chartInstance, userProfile } = options;

        const jsPDFConstructor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF || (window.jspdf && window.jspdf.default);

        if (!jsPDFConstructor) {
            throw new Error("Libreria jsPDF non disponibile. Verifica la connessione a Internet.");
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
        const hasProfile = userProfile && (userProfile.nome || userProfile.cognome || userProfile.genere || userProfile.data_nascita || userProfile.peso || userProfile.altezza || userProfile.note);
        const hasNotes = Boolean(userProfile && userProfile.note && userProfile.note.trim());
        const headerHeight = hasProfile ? (hasNotes ? 37 : 33) : 28;
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, headerHeight, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.text("DIARIO PRESSIONE ARTERIOSA", margin, 11);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text("Referto Clinico & Storico Misurazioni (Protocollo doppia rilevazione)", margin, 17);

        // Data generazione e Periodo a destra
        const todayStr = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
        doc.setFontSize(8);
        doc.setTextColor(203, 213, 225);
        doc.text(`Generato il: ${todayStr}`, pageWidth - margin, 11, { align: 'right' });
        doc.text(`Periodo: ${dateRangeLabel || 'Tutto lo storico'}`, pageWidth - margin, 17, { align: 'right' });

        // Dati Paziente nell'header (se configurati dall'ingranaggio)
        if (hasProfile) {
            let patientItems = [];
            const fullName = `${userProfile.nome || ''} ${userProfile.cognome || ''}`.trim();
            patientItems.push(`PAZIENTE: ${fullName ? fullName.toUpperCase() : "NON SPECIFICATO"}`);

            if (userProfile.genere === 'uomo') {
                patientItems.push(`SESSO: M`);
            } else if (userProfile.genere === 'donna') {
                patientItems.push(`SESSO: F`);
            }

            if (userProfile.data_nascita) {
                const age = calculateAge(userProfile.data_nascita);
                const natoPrefix = (userProfile.genere === 'donna') ? 'NATA IL' : ((userProfile.genere === 'uomo') ? 'NATO IL' : 'NATO/A');
                patientItems.push(`${natoPrefix}: ${formatDateItalianPdf(userProfile.data_nascita)}${age ? ` (${age})` : ''}`);
            }

            if (userProfile.peso) {
                patientItems.push(`PESO: ${userProfile.peso} kg`);
            }

            if (userProfile.altezza) {
                patientItems.push(`ALTEZZA: ${userProfile.altezza} cm`);
            }

            if (userProfile.peso && userProfile.altezza) {
                const hMeters = parseFloat(userProfile.altezza) / 100;
                if (hMeters > 0) {
                    const bmi = (parseFloat(userProfile.peso) / (hMeters * hMeters)).toFixed(1);
                    patientItems.push(`BMI: ${bmi}`);
                }
            }

            const boxH = hasNotes ? 12 : 8.5;
            doc.setFillColor(30, 41, 59); // slate-800
            doc.roundedRect(margin, 21.5, pageWidth - (margin * 2), boxH, 1.5, 1.5, 'F');

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.2);
            doc.setTextColor(45, 212, 191); // teal-400

            if (hasNotes) {
                doc.text(patientItems.join('  •  '), margin + 3, 26.2);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(6.8);
                doc.setTextColor(203, 213, 225); // slate-300
                doc.text(`NOTE / TERAPIA: ${userProfile.note}`, margin + 3, 30.8);
            } else {
                doc.text(patientItems.join('  •  '), margin + 3, 27.2);
            }
        }

        let currentY = headerHeight + 5;

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

        // --- 3. GRAFICO DELL'ANDAMENTO (Rendering dedicato ad alta fedeltà senza distorsioni) ---
        if (records && records.length > 0) {
            try {
                const chartRes = generatePdfChartImage(records, chartInstance);
                if (chartRes && chartRes.imgData) {
                    doc.setFontSize(9.5);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(30, 41, 59);
                    doc.text("Andamento Pressione e Pulsazioni nel Periodo", margin, currentY);
                    currentY += 3;

                    const chartWidth = 190; // Larghezza in mm sul foglio A4 (la pagina è larga 210 mm)
                    const chartX = (pageWidth - chartWidth) / 2; // Centrato orizzontalmente
                    // Calcolo altezza proporzionale esatta per EVITARE qualsiasi deformazione
                    const chartHeight = Math.round((chartRes.height / chartRes.width) * chartWidth * 10) / 10;

                    doc.addImage(chartRes.imgData, chartRes.format || 'PNG', chartX, currentY, chartWidth, chartHeight);
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
                4: { cellWidth: 36, fontStyle: 'bold', textColor: [13, 148, 136] },
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

        const fileNameDate = new Date().toISOString().slice(0, 10);
        let patientSlug = '';
        if (userProfile && (userProfile.cognome || userProfile.nome)) {
            patientSlug = `_${(userProfile.cognome || userProfile.nome).toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        }
        const fileName = `referto_pressione${patientSlug}_${fileNameDate}.pdf`;

        doc.setDocumentProperties({
            title: fileName,
            subject: 'Referto Diario Pressione Arteriosa',
            author: (userProfile && (userProfile.nome || userProfile.cognome)) ? `${userProfile.nome} ${userProfile.cognome}`.trim() : 'Diario Pressione Arteriosa',
            creator: 'Diario Pressione Arteriosa'
        });

        return { doc, fileName };
    },

    /**
     * Genera e apre o scarica il PDF
     */
    generate: async function (options) {
        const { doc, fileName } = this.buildPdfDocument(options);
        const pdfBlob = doc.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);

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
                    URL.revokeObjectURL(blobUrl);
                }, 1200);
            } catch (err) {
                console.warn("Fallback doc.save:", err);
                doc.save(fileName);
            }
        }
    },

    /**
     * Restituisce il Blob del PDF e il nome del file per la Web Share API
     */
    createPdfBlob: async function (options) {
        const { doc, fileName } = this.buildPdfDocument(options);
        const blob = doc.output('blob');
        return { blob, fileName };
    }
};

function formatDateItalianPdf(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

function calculateAge(birthDateStr) {
    if (!birthDateStr) return '';
    const [y, m, d] = birthDateStr.split('-').map(Number);
    const today = new Date();
    let age = today.getFullYear() - y;
    const mDiff = today.getMonth() - (m - 1);
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < d)) {
        age--;
    }
    return age > 0 ? `${age} anni` : '';
}

/**
 * Genera un grafico Chart.js dedicato per la stampa su A4:
 * - Risoluzione 1400x450 px (Retina per stampa nitida)
 * - Sfondo bianco con testi e griglie scuri ad alto contrasto
 * - Etichette asse X sintetiche GG/MM con slot compatto (M, P, C)
 * - Proporzione perfetta senza stiramento anamorfico
 */
function generatePdfChartImage(records, fallbackChartInstance) {
    if (!records || records.length === 0) return null;

    if (typeof window !== 'undefined' && window.Chart) {
        try {
            const width = 1600;
            const height = 500; // Ratio ~3.2 : 1
            const offCanvas = document.createElement('canvas');
            offCanvas.width = width;
            offCanvas.height = height;
            const ctx = offCanvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);

            // Etichette sintetiche giorno/mese (es. 24/10 o 24/10 (M))
            const labels = records.map(r => {
                const parts = (r.data || '').split('-');
                const day = parts[2] ? parts[2].padStart(2, '0') : '';
                const month = parts[1] ? parts[1].padStart(2, '0') : '';
                const shortDate = `${day}/${month}`;
                const slotShort = {
                    'mattino': 'M',
                    'pranzo': 'P',
                    'cena': 'C',
                    'altro': r.ora || 'A'
                };
                const slot = slotShort[r.slot] || '';
                return slot ? `${shortDate} (${slot})` : shortDate;
            });

            const maxData = records.map(r => r.avg_max);
            const minData = records.map(r => r.avg_min);
            const batData = records.map(r => r.avg_bat);

            const printChart = new window.Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Sistolica Media (MAX)',
                            data: maxData,
                            borderColor: '#dc2626', // rosso marcato
                            backgroundColor: 'rgba(220, 38, 38, 0.08)',
                            borderWidth: 3.2,
                            pointBackgroundColor: '#dc2626',
                            pointBorderColor: '#000000',
                            pointBorderWidth: 1.5,
                            pointRadius: records.length > 25 ? 4 : 6,
                            tension: 0.25,
                            fill: false
                        },
                        {
                            label: 'Diastolica Media (MIN)',
                            data: minData,
                            borderColor: '#0284c7', // azzurro marcato
                            backgroundColor: 'rgba(2, 132, 199, 0.08)',
                            borderWidth: 3.2,
                            pointBackgroundColor: '#0284c7',
                            pointBorderColor: '#000000',
                            pointBorderWidth: 1.5,
                            pointRadius: records.length > 25 ? 4 : 6,
                            tension: 0.25,
                            fill: false
                        },
                        {
                            label: 'Battiti Medi (BPM)',
                            data: batData,
                            borderColor: '#059669', // verde smeraldo
                            borderDash: [5, 4],
                            borderWidth: 2.8,
                            pointBackgroundColor: '#059669',
                            pointBorderColor: '#000000',
                            pointBorderWidth: 1.5,
                            pointRadius: records.length > 25 ? 3.5 : 5,
                            tension: 0.2,
                            fill: false
                        }
                    ]
                },
                plugins: [
                    {
                        id: 'whiteBackground',
                        beforeDraw: (chart) => {
                            const c = chart.ctx;
                            c.save();
                            c.globalCompositeOperation = 'destination-over';
                            c.fillStyle = '#ffffff';
                            c.fillRect(0, 0, chart.width, chart.height);
                            c.restore();
                        }
                    }
                ],
                options: {
                    animation: false,
                    responsive: false,
                    maintainAspectRatio: false,
                    // Blocco a 1: EVITA che lo scaling del monitor (125%/150%) ingrandisca il canvas tagliando bordi e date!
                    devicePixelRatio: 1,
                    layout: {
                        padding: {
                            left: 65,  // spazio per titolo 'Valori Medi'
                            right: 40, // spazio a destra per l'ultimo punto
                            top: 18,   // spazio sopra la legenda
                            bottom: 50 // spazio sotto per le date GG/MM
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                color: '#000000', // testo NERO pieno
                                font: { size: 15, weight: 'bold', family: 'Helvetica, Arial, sans-serif' },
                                usePointStyle: true,
                                boxWidth: 10,
                                padding: 18
                            }
                        },
                        tooltip: { enabled: false }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: '#000000', // griglia NERA nitida
                                lineWidth: 1
                            },
                            border: {
                                color: '#000000', // linea asse NERA
                                width: 2
                            },
                            ticks: {
                                color: '#000000', // etichette NERE
                                font: { size: 14, weight: 'bold', family: 'Helvetica, Arial, sans-serif' },
                                padding: 8,
                                maxRotation: 0,
                                autoSkip: records.length > 20
                            }
                        },
                        y: {
                            grid: {
                                color: '#000000', // griglia NERA nitida
                                lineWidth: 1
                            },
                            border: {
                                color: '#000000', // linea asse NERA
                                width: 2
                            },
                            ticks: {
                                color: '#000000', // valori NERI
                                font: { size: 14, weight: 'bold', family: 'Helvetica, Arial, sans-serif' },
                                padding: 8,
                                stepSize: 10
                            },
                            suggestedMin: 50,
                            suggestedMax: 130,
                            title: {
                                display: true,
                                text: 'Valori Medi (mmHg / bpm)',
                                color: '#000000', // titolo NERO
                                font: { size: 15, weight: 'bold', family: 'Helvetica, Arial, sans-serif' },
                                padding: { bottom: 10 }
                            }
                        }
                    }
                }
            });

            printChart.render();

            // Esportazione diretta del canvas originale con sfondo bianco (nessun ritaglio o compressione intermedia)
            const imgData = offCanvas.toDataURL('image/png');
            const actualWidth = offCanvas.width;
            const actualHeight = offCanvas.height;
            printChart.destroy();

            return { imgData, width: actualWidth, height: actualHeight, format: 'PNG' };
        } catch (e) {
            console.warn("Errore rendering grafico PDF dedicato:", e);
        }
    }

    return getCleanChartImage(fallbackChartInstance);
}

function getCleanChartImage(chartInstance) {
    if (!chartInstance || !chartInstance.canvas) return null;
    try {
        const canvas = chartInstance.canvas;
        if (!canvas.width || !canvas.height) return null;

        const targetWidth = 1000;
        const targetHeight = Math.round((canvas.height / canvas.width) * targetWidth);
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = targetWidth;
        tempCanvas.height = targetHeight;
        const ctx = tempCanvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);

        return {
            imgData: tempCanvas.toDataURL('image/png'),
            width: targetWidth,
            height: targetHeight,
            format: 'PNG'
        };
    } catch (e) {
        console.warn("Errore cattura grafico ottimizzato:", e);
        return null;
    }
}
