import Tabletop from 'tabletop';
import {
    googleSpreadsheetKey,
    binaryConditions,
    unaryConditions,
    binaryOperations,
    unaryOperations,
    defaultTags
} from './constants';


const controlSheetName = 'Control';

const IDfieldName = 'ID';
const doneFieldName = 'Done?';
const questFieldNames = [
    IDfieldName,
    doneFieldName,
    'QuestName',
    'Conditions',
    'QuestText',
    'Style',
    'ChoiceAText',
    'ChoiceAResult',
    'ChoiceAData',
    'DeathTypeA',
    'ChoiceBText',
    'ChoiceBResult',
    'ChoiceBData',
    'DeathTypeB',
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
            continueButtonText: '<continue>',
            deathContinueButtonText: '<continue>',
            deathResultText: '<you died>',
            allTags: [],
            allStats: [],
            stringLists: {},
        },
        warnings: [],
        success: false,
    };

    if (tabletop.foundSheetNames.indexOf(controlSheetName) === -1) {
        result.warnings.push(`Couldn't find sheet named '${controlSheetName}'`);
        return result;
    }

    let controlData = {};
    tabletop.sheets(controlSheetName).all().forEach(row  => controlData[row.Key] = row.Value);

    ['continueButtonText', 'deathContinueButtonText', 'deathResultText'].forEach(fieldName => {
        if (controlData.hasOwnProperty(fieldName)) {
            result.data[fieldName] = controlData[fieldName];
        } else {
            result.warnings.push(`Couldn't find control data field '${fieldName}'`);
        }
    })

    const blacklistedSheetNames = splitIntoParts(controlData['blacklistedSheetNames']);
    blacklistedSheetNames.push(controlSheetName);

    const stringListSheetNames = splitIntoParts(controlData['stringListSheetNames']);

    result.continueButtonText = controlData['continueButtonText'];
    result.deathContinueButtonText = controlData['deathContinueButtonText'];
    result.deathResultText = controlData['deathResultText'];

    const questSheetNames = tabletop.foundSheetNames.filter(sheetName =>
        blacklistedSheetNames.indexOf(sheetName) === -1 &&
        stringListSheetNames.indexOf(sheetName) === -1
    );

    questSheetNames.forEach(sheetName => loadDataFromQuestSheet(result, tabletop.sheets(sheetName)));

    let globalQuestData = {
        queriedTags: new Set(),
        queriedStats: new Set(),
        modifiedTags: new Set(defaultTags),
        modifiedStats: new Set(),
        questNames: result.data.quests.map(q => q.QuestName),
    };

    result.data.quests.forEach(q => readQuestReferences(globalQuestData, q));

    result.data.quests.forEach(q => verifyQuest(globalQuestData, q,
        w => result.warnings.push(`${w} (quest '${q.QuestName}' in sheet '${q.SheetName}')`)));

    result.allTags = [...globalQuestData.modifiedTags];
    result.allStats = [...globalQuestData.modifiedStats];

    stringListSheetNames.forEach(sheetName => loadDataFromStringListsSheet(result, tabletop.sheets(sheetName)));

    result.retrievedAt = (new Date()).toUTCString();
    result.success = true;

    return result;
}


function loadDataFromStringListsSheet(result, sheet) {
    sheet.column_names.forEach(stringListKey => {
        if (!result.data.stringLists.hasOwnProperty(stringListKey)) {
            result.data.stringLists[stringListKey] = [];
        }
    });

    sheet.toArray().forEach((row, rowIndex) => {
        let cell;
        for (var i=0; i<row.length; i++) {
            try {
                cell = row[i].trim();
            } catch(e) {
                result.data.stringLists(`Couldn't process a cell in row ${rowIndex} of sheet '${sheet.name}'.`);
                continue;
            }
            if (cell !== '') {
                result.data.stringLists[sheet.column_names[i]].push(cell);
            }
        }
    });
}


function loadDataFromQuestSheet(result, sheet) {
    let data = {};

    function addRow(row) {
        // Make sure we can read the first column, which is the field name.
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
        if (questFieldNames.indexOf(rowName) === -1) {
            result.warnings.push(`Ignoring '${rowName}' row in sheet '${sheet.name}'.`);
            return;
        }

        // Make sure we haven't read this field name already.
        if (data.hasOwnProperty(rowName)) {
            result.warnings.push(`There is more than one '${rowName}' row in sheet '${sheet.name}'.`);
            return;
        }

        // Read remaining cells of row.
        let convertedRow = [];
        let cell;
        for (var i=1; i<row.length; i++) {
            try {
                cell = row[i].trim();
            } catch(e) {
                result.warnings.push(`Couldn't process a cell in the '${rowName}' row of sheet '${sheet.name}'.`);
                cell = '';
            }
            convertedRow.push(cell);
        }

        // Store row.
        data[rowName] = convertedRow;
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
    let readColumnIDs = new Set();
    for (let i=0; i<nrColumns; i++) {
        if (data[doneFieldName][i] !== 'x') continue;

        const columnID = data[IDfieldName][i];

        if ((columnID === '') || (columnID === undefined)) {
            result.warnings.push(`Empty ID field (quest '${data['QuestName'][i]}' in sheet '${sheet.name}')`);
            continue;
        }

        if (readColumnIDs.has(columnID)) {
            result.warnings.push(`Duplicate column ID '${columnID}' (quest '${data['QuestName'][i]}' in sheet '${sheet.name}')`);
            continue;
        }
        readColumnIDs.add(columnID);

        let rawQuestData = {};
        questFieldNames.forEach(fieldName => rawQuestData[fieldName] = data[fieldName][i]);
        rawQuestData.SheetName = sheet.name;

        const newQuest = processQuest(rawQuestData, w => result.warnings.push(`${w} (quest '${rawQuestData['QuestName']}' in sheet '${sheet.name}')`));
        if (newQuest) {
            newQuest.ID = result.data.quests.length;
            result.data.quests.push(newQuest);
        }
    }
}


function readQuestReferences(globalQuestData, quest) {
    quest.Conditions.forEach(c => {
        switch (c[0]) {
        case 'hasTag':
        case 'doesntHaveTag': {
            globalQuestData.queriedTags.add(c[1]);
            break;
        }
        default: {
            globalQuestData.queriedStats.add(c[1]);
            break;
        }
        }
    });

    quest.Outcomes.forEach(o => o.forEach(a => {
        switch (a[0]) {
        case 'addTag':
        case 'removeTag': {
            globalQuestData.modifiedTags.add(a[1]);
            break;
        }
        case 'set':
        case 'add':
        case 'subtract': {
            globalQuestData.modifiedStats.add(a[1]);
            break;
        }
        default: break;
        }
    }));

    quest.DeathTags.forEach(tags => tags.forEach(tag => globalQuestData.modifiedTags.add(tag)));
}


function verifyQuest(globalQuestData, quest, reportFn) {
    quest.Conditions.forEach(c => {
        switch (c[0]) {
        case 'hasTag':
        case 'doesntHaveTag': {
            if (!globalQuestData.modifiedTags.has(c[1])) {
                reportFn(`Condition uses unknown tag '${c[1]}'`);
            }
            break;
        }
        default: {
            if (!globalQuestData.modifiedStats.has(c[1])) {
                reportFn(`Condition uses unknown stat '${c[1]}'`);
            }
            break;
        }
        }
    });

    quest.Outcomes.forEach(o => o.forEach(a => {
        switch (a[0]) {
/*        case 'addTag':
        case 'removeTag': {
            if (!globalQuestData.queriedTags.has(a[1])) {
                reportFn(`Tag '${a[1]}' is never used in a condition`);
            }
            break;
        } */
        case 'set':
        case 'add':
        case 'subtract': {
            if (!globalQuestData.queriedStats.has(a[1])) {
                reportFn(`Stat '${a[1]}' is never used in a condition`);
            }
            break;
        }
        case 'go': {
            const foundQuests = globalQuestData.questNames.filter(n => n === a[1]);
            switch (foundQuests.length) {
            case 0: {
                reportFn(`Go command refers to a quest named '${a[1]}' - there are no known quests with this name.`);
                break;
            }
            case 1: break;
            default: {
                reportFn(`Go command refers to a quest named '${a[1]}' - there are ${foundQuests.length} with this name, the name must be unique!`);
                break;
            }
            }
            break;
        }
        default: break;
        }
    }));
}


function processQuest(rawQuestData, reportFn) {
    let newQuest = {};
    ['QuestName', 'QuestText', 'SheetName'].forEach(n => newQuest[n] = rawQuestData[n]);

    newQuest.ColumnID = rawQuestData['ID'];
    newQuest.IsDeathQuest = (newQuest.SheetName === 'Deaths');
    newQuest.Style = splitIntoParts(rawQuestData['Style']);

    let parsedConditions = splitIntoParts(rawQuestData['Conditions']);
    parsedConditions = parsedConditions.map(c => parseCondition(c, w => reportFn(`Conditions: ${w}`)));
    if (parsedConditions.some(c => c.length === 0)) return null;
    newQuest.Conditions = parsedConditions;

    newQuest.IsStartQuest = newQuest.Conditions.some(c => (c[0] === 'hasTag') && (c[1] === 'start'));

    newQuest.ChoiceTexts = [rawQuestData['ChoiceAText'], rawQuestData['ChoiceBText']];
    newQuest.ResultTexts = [rawQuestData['ChoiceAResult'], rawQuestData['ChoiceBResult']];
    newQuest.Outcomes = [null, null];
    newQuest.DeathTags = [null, null];

    function copyChoiceData(choiceIndex) {
        const choice = 'AB'[choiceIndex];

        let fieldName = `Choice${choice}Data`;
        let parsedChoiceData = splitIntoParts(rawQuestData[fieldName]);
        parsedChoiceData = parsedChoiceData.map(c => parseOperation(c, w => reportFn(`${fieldName}: ${w}`)));
        if (parsedChoiceData.some(c => c.length === 0)) return false;
        newQuest.Outcomes[choiceIndex] = parsedChoiceData;

        fieldName = `DeathType${choice}`;
        newQuest.DeathTags[choiceIndex] = splitIntoParts(rawQuestData[fieldName]);
        return true;
    }

    if (!copyChoiceData(0)) return null;
    if (!copyChoiceData(1)) return null;

    return newQuest;
}


function splitIntoParts(rawText) {
    return rawText.split(',').map(b => b.trim()).filter(b => b.length > 0);
}


function parseCondition(condition, reportFn) {
    return parseStatement(binaryConditions, unaryConditions, 'hasTag', condition, reportFn);
}


function parseOperation(operation, reportFn) {
    return parseStatement(binaryOperations, unaryOperations, 'addTag', operation, reportFn);
}


function parseStatement(binaryOperators, unaryOperators, defaultOperator, statement, reportFn) {
    let result = null;

    // Check for binary operators.
    binaryOperators.forEach(([token, operator]) => {
        let bits = statement.split(token);
        if ((bits.length === 2) && (bits[0] !== '')) {
            bits = bits.map(b => b.trim());
            const rightOperandAsNumber = tryToConvertToNumber(bits[1]);
            if (rightOperandAsNumber !== undefined) {
                result = [operator, bits[0], rightOperandAsNumber];
            } else {
                reportFn(`'${bits[1]}' is not a number`);
                result = [];
            }
            return;
        }
    });
    if (result !== null) return result;

    // Check for unary operators.
    unaryOperators.forEach(([token, operator]) => {
        let bits = statement.split(token);
        if ((bits.length === 2) && (bits[0] === '')) {
            result = [operator, bits[1].trim()];
            return;
        }
        if (bits.length !== 1) {
            reportFn(`Can't parse '${statement}'`);
            result = [];
            return;
        }
    });
    if (result !== null) return result;

    if (defaultOperator !== null) {
        return [defaultOperator, statement];
    } else {
        reportFn(`Can't parse '${statement}'`);
        return [];
    }
}


function tryToConvertToNumber(operand) {
    let operandAsNumber = parseInt(operand, 10);
    return (operandAsNumber !== operandAsNumber) ? undefined : operandAsNumber;     // eslint-disable-line no-self-compare
}


export default loadDataFromGoogleSpreadsheet;
