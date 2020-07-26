class Pdf {
    constructor(pdfBytes, pdfFile) {
        this.bytes = typeof pdfBytes === 'string' ? new TextEncoder("utf-8").encode(pdfBytes) : pdfBytes
        this.pdfFile = pdfFile
        this.pdfDoc = null;
    }

    async load() {
        this.pdfDoc = await PDFLib.PDFDocument.load(this.bytes)
    }

    removePages(indicesToRemoveArray) {
        const maxPages = this.pdfDoc.getPageCount()
        indicesToRemoveArray
            .filter(i => i < maxPages)
            .sort()
            .forEach((page, index) => this.pdfDoc.removePage(page - index))
    }

    async merge(pdf) {
        const copiedPages = this.pdfDoc.copyPages(pdf.pdfDoc, pdf.pdfDoc.getPageIndices());
        (await copiedPages).forEach(p => this.pdfDoc.addPage(p))
    }

    getBase64() {
        return this.pdfDoc.saveAsBase64()
    }

    async getBlob() {
        const pdfBytes = await this.pdfDoc.save()
        return new Blob([pdfBytes.buffer], { type: "application/pdf" });
    }

    async download() {
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(await this.getBlob());
        link.download = this.pdfFile.name;
        link.click();
    }
}