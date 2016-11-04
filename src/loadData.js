import Tabletop from 'tabletop';


// const googleSpreadsheetKey = '1AHirIj1eUn8ofGamkkCgu2XWXweM4byqrcu9FAg-j48';     // Simple test doc
const googleSpreadsheetKey = '1rDndDW7cebpGy9fnDZqvfcsLN1CB_pTb4n28W140O04';        // Copy of game doc


function loadDataFromGoogleSpreadsheet() {
    return new Promise(function (resolve, reject) {
        Tabletop.init({
            key: googleSpreadsheetKey,
            callback: function dataHasLoaded(data, tabletop) {
                resolve(data);
            }
        });
    });
}


export default loadDataFromGoogleSpreadsheet;
