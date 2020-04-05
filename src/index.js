var primaryPdf = null
var mergePdf = null

// Uploaders
document.getElementById("fileUpload").onchange = event => fileUploader(event, loadPrimaryPdf);
document.getElementById("mergeFileUpload").onchange = event => fileUploader(event, loadMergePdf);

function fileUploader(event, onloadCallback) {
    var input = event.target
    var reader = new FileReader()
    reader.onload = () => onloadCallback(reader, input);
    reader.readAsArrayBuffer(input.files[0]);
}

async function loadMergePdf(reader, input) {
    let data = reader.result
    mergePdf = new Pdf(data, input.files[0])
    await mergePdf.load()
    onMergePdf()
}

async function loadPrimaryPdf(reader, input) {
    let data = reader.result
    primaryPdf = new Pdf(data, input.files[0])
    await primaryPdf.load()

    updatePdfPreview()
    show('pdfOperation')

    // Scroll to operation panel
    document.querySelector('#pdfOperation').scrollIntoView({ behavior: 'smooth' });
};

// --------------------------------------

function onMergePdf() {
    primaryPdf.merge(mergePdf)
    updatePdfPreview()
    mergePdf = null
}

function onSaveDocument() {
    primaryPdf.download()
}

async function onRemovePages(pagesValue) {
    // Prepare
    let pages = pagesValue
        .replace(/ /g, '')
        .replace(/;/g, ',')
        .split(',')

    // Resolve ranges
    pages.forEach((p, i) => {
        if (p.includes('-')) {
            let startEnd = p.split('-')
            pages[i] = startEnd[0]
            range(Number(startEnd[0]) + 1, Number(startEnd[1])).forEach(pageInRange => pages.push(pageInRange))
        }
    });

    // Convert to pages to indices and make them unique
    pages = pages
        .map(p => Number(p) - 1)
        .filter((value, index, self) => self.indexOf(value) === index)

    primaryPdf.removePages(pages)

    updatePdfPreview()
}

async function updatePdfPreview() {
    const preview = document.getElementById('pdfPreview');
    const url = URL.createObjectURL(await primaryPdf.getBlob(), {
        type: "application/pdf"
    });
    preview.setAttribute("src", url)
}

function hide(id) {
    const element = document.getElementById(id)
    element.classList.add("is-hidden")
}

function show(id) {
    const element = document.getElementById(id)
    element.classList.remove('is-hidden')
}

function range(start, end) {
    if (start === end) return [start];
    return [start, ...range(start + 1, end)];
}