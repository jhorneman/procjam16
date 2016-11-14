// Copied from https://github.com/exupero/saveSvgAsPng

function uriToBlob(uri) {
    var byteString = window.atob(uri.split(',')[1]);
    var mimeString = uri.split(',')[0].split(':')[1].split(';')[0]
    var buffer = new ArrayBuffer(byteString.length);
    var intArray = new Uint8Array(buffer);
    for (var i = 0; i < byteString.length; i++) {
        intArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([buffer], {type: mimeString});
}


export default function download(name, uri) {
    if (navigator.msSaveOrOpenBlob) {
        navigator.msSaveOrOpenBlob(uriToBlob(uri), name);
    } else {
        var saveLink = document.createElement('a');
        var downloadSupported = 'download' in saveLink;
        if (downloadSupported) {
            saveLink.download = name;
            saveLink.href = uri;
            saveLink.style.display = 'none';
            document.body.appendChild(saveLink);
            saveLink.click();
            document.body.removeChild(saveLink);
        }
        else {
            window.open(uri, '_temp', 'menubar=no,toolbar=no,status=no');
        }
    }
}
