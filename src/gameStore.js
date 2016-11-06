import { createStore, createStoreMutator } from './miniflux'; 
import loadDataFromGoogleSpreadsheet from './loadData';


export const validCommands = [
    'restart',
    'go',
];

export const statNames = [
    'health',
    'luck',
    'morale',
    'rations',
];

let state = 'uninitialized';
let errorMessage;
let allQuests = [];
let warnings = [];

let currentQuest;
let stats;
let tags;
let possibleNextQuests;


export let GameStore = createStore({
    state: function() {
        return state;
    },

    errorMessage: function() {
        return errorMessage;
    },

    allQuests: function() {
        return allQuests;
    },

    warnings: function() {
        return warnings;
    },

    currentQuest: function() {
        return currentQuest;
    },

    possibleNextQuests: function() {
        return possibleNextQuests;
    },

    statNames: function() {
        return statNames;
    },

    stats: function() {
        return stats;
    }

}, 'gameStore');


export let GameStoreMutator = createStoreMutator(GameStore, {
    init: function() {
        let that = this;
        if (process.env.NODE_ENV === 'development') {
            let dataLoadPromise = loadDataFromGoogleSpreadsheet();
            dataLoadPromise.then(function(result) {
                allQuests = result.data.quests;
                warnings = result.warnings;
                that.restartGame();
            });
        } else {
            // loadDataFromJSONFile();
        }
    },

    restartGame: function() {
        resetGameState();
        possibleNextQuests = getPossibleNextQuests();
        pickNextQuest();
        this.emitChange();
    },

    executeChoice: function(choiceIndex) {
        const whichResult = choiceIndex ? 'ChoiceBData' : 'ChoiceAData';
        const outcome = currentQuest[whichResult];

        let nextQuestSetByGoCommand = null;

        outcome.forEach(([operator, param0, param1]) => {
            switch (operator) {
            case 'add': {
                if (stats.hasOwnProperty(param0)) {
                    stats[param0] += param1;
                } else {
                    reportError(`Unknown stat '${param0}' in ${whichResult} of quest '${currentQuest.QuestName}'`);
                }
                break;
            }
            case 'subtract': {
                if (stats.hasOwnProperty(param0)) {
                    stats[param0] -= param1;
                } else {
                    reportError(`Unknown stat '${param0}' in ${whichResult} of quest '${currentQuest.QuestName}'`);
                }
                break;
            }
            case 'addTag': {
                tags.add(param0);
                break;
            }
            case 'removeTag': {
                tags.delete(param0);
                break;
            }
            case 'command': {
                switch (param0) {
                case 'restart': {
                    resetGameState();
                    break;
                }
                case 'go': {
                    const nextQuest = allQuests.find(q => q.QuestName === param1);
                    if (nextQuest !== undefined) {
                        nextQuestSetByGoCommand = nextQuest;
                    } else {
                        reportError(`Go command in ${whichResult} of quest '${currentQuest.QuestName}': could not find a quest named '${param1}'`);
                    }
                    break;
                }
                default: {
                    reportError(`Unknown command '${param0}' in ${whichResult} of quest '${currentQuest.QuestName}'`);
                    break;
                }
                }
                break;
            }
            default: {
                reportError(`Unknown operator '${operator}' in ${whichResult} of quest '${currentQuest.QuestName}'`);
                break;
            }
            }
        });

        if (nextQuestSetByGoCommand === null) {
            possibleNextQuests = getPossibleNextQuests();
        } else {
            possibleNextQuests = [ nextQuestSetByGoCommand ];
        }

        this.emitChange();
    },

    pickNextQuest: function() {
        pickNextQuest();
        this.emitChange();
    },
});


function reportError(message) {
    warnings.push(message);
    console.log(message);
}


function resetGameState() {
    state = 'playing';

    currentQuest = null;

    stats = {};
    for (let statName of statNames) {
        stats[statName] = 5;
    }

    tags = new Set();
}


function getPossibleNextQuests() {
    return allQuests.filter(q => {
        return q.Conditions.every(([operator, param0, param1]) => {
            switch (operator) {
            case 'lessThan': {
                if (stats.hasOwnProperty(param0)) {
                    return stats[param0] < param1;
                } else {
                    console.log(`Unknown stat '${param0}' in conditions of quest '${q.QuestName}'`);
                }
                break;
            }
            case 'greaterThan': {
                if (stats.hasOwnProperty(param0)) {
                    return stats[param0] > param1;
                } else {
                    console.log(`Unknown stat '${param0}' in conditions of quest '${q.QuestName}'`);
                }
                break;
            }
            case 'lessThanOrEqual': {
                if (stats.hasOwnProperty(param0)) {
                    return stats[param0] <= param1;
                } else {
                    console.log(`Unknown stat '${param0}' in conditions of quest '${q.QuestName}'`);
                }
                break;
            }
            case 'greaterThanOrEqual': {
                if (stats.hasOwnProperty(param0)) {
                    return stats[param0] >= param1;
                } else {
                    console.log(`Unknown stat '${param0}' in conditions of quest '${q.QuestName}'`);
                }
                break;
            }
            case 'equals': {
                if (stats.hasOwnProperty(param0)) {
                    return stats[param0] === param1;
                } else {
                    console.log(`Unknown stat '${param0}' in conditions of quest '${q.QuestName}'`);
                }
                break;
            }
            case 'hasTag': {
                return tags.has(param0);
            }
            case 'doesntHaveTag': {
                return !tags.has(param0);
            }
            default: {
                console.log(`Unknown operator '${operator}' in conditions of quest '${q.QuestName}'`);
                break;
            }
            }
            return false;
        });
    });
}


function pickNextQuest() {
    if (possibleNextQuests.length > 0) {
        const newQuestIndex = Math.floor(Math.random() * possibleNextQuests.length);
        currentQuest = possibleNextQuests[newQuestIndex];
    } else {
        state = 'error';
        errorMessage = 'No eligible next quests exist';
        currentQuest = null;
    }
}
