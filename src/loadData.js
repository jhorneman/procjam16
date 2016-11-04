import Tabletop from 'tabletop';


// const googleSpreadsheetKey = '1AHirIj1eUn8ofGamkkCgu2XWXweM4byqrcu9FAg-j48';     // Simple test doc
const googleSpreadsheetKey = '1rDndDW7cebpGy9fnDZqvfcsLN1CB_pTb4n28W140O04';        // Copy of game doc

const blacklistedSheetNames = ['Math'];

const doneFieldName = 'Done?';
const questFieldNames = [
    doneFieldName,
    'QuestName',
    'Conditions',
    'QuestText',
    'ChoiceAText',
    'ChoiceAResult',
    'ChoiceAData',
    'ChoiceBText',
    'ChoiceBResult',
    'ChoiceBData',
];


function loadDataFromGoogleSpreadsheet() {
    return new Promise(function (resolve, reject) {
        Tabletop.init({
            key: googleSpreadsheetKey,
            callback: function dataHasLoaded(sheets, tabletop) {
                resolve(loadDataFromTabletop(sheets, tabletop));
            },
        });
    });
}


function loadDataFromTabletop(sheets, tabletop) {
    let result = {
        data: {
            quests: [],
        },
        warnings: [],
        success: false,
    };

    let questSheetNames = tabletop.foundSheetNames.filter(sheetName =>
        blacklistedSheetNames.indexOf(sheetName) === -1
    );

    questSheetNames.forEach(sheetName => loadDataFromQuestSheet(result, tabletop.sheets(sheetName)));

    return result;
}


function loadDataFromQuestSheet(result, sheet) {
    let data = {};

    function addRow(row) {
        // Make sure we can read the first column, which is  the field name.
        let rowName;
        try {
            rowName = row[0].trim();
        } catch(e) {
            result.warnings.push(`Couldn't process a row in sheet '${sheet.name}'.`);
            return;
        }

        // Make sure the field name is not empty.
        if (rowName.length === 0) return;

        // Make sure this is a valid field name.
        if (questFieldNames.indexOf(rowName) === -1) return;

        // Make sure we haven't read this field name already.
        if (data.hasOwnProperty(rowName)) {
            result.warnings.push(`There is more than one '${rowName}' row in sheet '${sheet.name}'.`);
            return;
        }

        // Read remaining cells of row.
        let column = [];
        let cell;
        for (var i=1; i<row.length; i++) {
            try {
                cell = row[i].trim();
            } catch(e) {
                result.warnings.push(`Couldn't process a cell in the '${rowName}' row of sheet '${sheet.name}'.`);
                cell = '';
            }
            column.push(cell);
        }

        // Store row.
        data[rowName] = column;
    }

    // Read column names (first row) and all rows below it.
    addRow(sheet.column_names);
    sheet.toArray().forEach(addRow);

    // Make sure we have all rows we need and determine maximum row length.
    let noRowsMissing = false;
    let nrColumns = 0;
    questFieldNames.forEach(fieldName => {
        if (data.hasOwnProperty(fieldName)) {
            if (nrColumns < data[fieldName].length) nrColumns = data[fieldName].length;
        } else {
            noRowsMissing = true;
            result.warnings.push(`Couldn't find '${fieldName}' row in sheet '${sheet.name}'.`);
        }
    })
    if (noRowsMissing) return;

    // Make sure all rows are the same length.
    questFieldNames.forEach(fieldName => {
        let row = data[fieldName];
        while (row.length < nrColumns) row.push('');
    });

    // Read quest data.
    for (let i=0; i<nrColumns; i++) {
        if (data[doneFieldName][i] !== 'x') continue;
        let newQuest = {};
        questFieldNames.forEach(fieldName => newQuest[fieldName] = data[fieldName][i]);
        delete newQuest[doneFieldName];     // Easier to do this than not read it.
        newQuest.SheetName = sheet.name;
        newQuest = processQuest(newQuest, result.warnings);
        if (newQuest) {
            result.data.quests.push(newQuest);
        }
    }
}


function processQuest(newQuest, messages) {
    return newQuest;
}


export default loadDataFromGoogleSpreadsheet;
