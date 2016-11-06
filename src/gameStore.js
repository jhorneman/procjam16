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
let quests = [];
let loadWarnings = [];

let currentQuest;
let stats;
let tags;


export let GameStore = createStore({
    isLoading: function() {
        return (state === 'uninitialized') || (state === 'loading');
    },

    state: function() {
        return state;
    },

    errorMessage: function() {
        return errorMessage;
    },

    quests: function() {
        return quests;
    },

    loadWarnings: function() {
        return loadWarnings;
    },

    currentQuest: function() {
        return currentQuest;
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
                quests = result.data.quests;
                loadWarnings = result.warnings;
                that.restartGame();
            });
        } else {
            // loadDataFromJSONFile();
        }
    },

    restartGame: function() {
        resetGameState();
        pickNextQuest();
        this.emitChange();
    },

    executeChoice: function(choiceIndex) {
        const whichResult = choiceIndex ? 'ChoiceBResult' : 'ChoiceAResult';
        const outcome = currentQuest[whichResult];
        outcome.forEach(([operator, param0, param1]) => {
            switch (operator) {
            case 'add': {
                if (stats.hasOwnProperty(param0)) {
                    stats[param0] += param1;
                } else {
                    console.log(`Unknown stat '${param0}' in ${whichResult} of quest '${currentQuest.QuestName}'.`);
                }
                break;
            }
            case 'subtract': {
                if (stats.hasOwnProperty(param0)) {
                    stats[param0] -= param1;
                } else {
                    console.log(`Unknown stat '${param0}' in ${whichResult} of quest '${currentQuest.QuestName}'.`);
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
                if (param0 === 'restart') {
                    resetGameState();
                } else {
                    console.log(`Unknown command '${param0}' in ${whichResult} of quest '${currentQuest.QuestName}'.`);
                }
                break;
            }
            default: {
                console.log(`Unknown operator '${operator}' in ${whichResult} of quest '${currentQuest.QuestName}'.`);
                break;
            }
            }
        });
        pickNextQuest();
        this.emitChange();
    }
});


function resetGameState() {
    state = 'playing';

    currentQuest = null;

    stats = {};
    for (let statName of statNames) {
        stats[statName] = 5;
    }

    tags = new Set();
}


function pickNextQuest() {
    const eligibleQuests = quests.filter(q => {
        return q.Conditions.every(([operator, param0, param1]) => {
            switch (operator) {
            case 'lessThan': {
                if (stats.hasOwnProperty(param0)) {
                    return stats[param0] < param1;
                } else {
                    console.log(`Unknown stat '${param0}' in conditions of quest '${q.QuestName}'.`);
                }
                break;
            }
            case 'greaterThan': {
                if (stats.hasOwnProperty(param0)) {
                    return stats[param0] > param1;
                } else {
                    console.log(`Unknown stat '${param0}' in conditions of quest '${q.QuestName}'.`);
                }
                break;
            }
            case 'lessThanOrEqual': {
                if (stats.hasOwnProperty(param0)) {
                    return stats[param0] <= param1;
                } else {
                    console.log(`Unknown stat '${param0}' in conditions of quest '${q.QuestName}'.`);
                }
                break;
            }
            case 'greaterThanOrEqual': {
                if (stats.hasOwnProperty(param0)) {
                    return stats[param0] >= param1;
                } else {
                    console.log(`Unknown stat '${param0}' in conditions of quest '${q.QuestName}'.`);
                }
                break;
            }
            case 'equals': {
                if (stats.hasOwnProperty(param0)) {
                    return stats[param0] === param1;
                } else {
                    console.log(`Unknown stat '${param0}' in conditions of quest '${q.QuestName}'.`);
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
                console.log(`Unknown operator '${operator}' in conditions of quest '${q.QuestName}'.`);
                break;
            }
            }
            return false;
        });
    });

    if (eligibleQuests.length > 0) {
        const newQuestIndex = Math.floor(Math.random() * eligibleQuests.length);
        currentQuest = eligibleQuests[newQuestIndex];
    } else {
        state = 'error';
        errorMessage = 'No eligible quests available';
        currentQuest = null;
    }
}
