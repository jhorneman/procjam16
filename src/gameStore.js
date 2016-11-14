import { createStore, createStoreMutator } from './miniflux'; 
import loadDataFromGoogleSpreadsheet from './loadData';
import lscache from 'ls-cache';
import sha1 from 'stable-sha1';
import download from './download';
import bakedGameData from './gameData.json';


export const visibleStatNames = [
    'health',
    'luck',
    'morale',
    'rations',
];

const statStartValue = 5;
const statMaxValue = 10;
const defaultDeathTag = 'death';
const startTag = 'start';

let state = 'uninitialized';
let errorMessage;
let rawGameData;
let allQuests = [];
let warnings = [];
let continueButtonText;
let deathContinueButtonText;
let deathResultText;

let currentQuest;
let stats = {};
let tags = new Set();
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

    isDeathQuest: function() {
        return currentQuest ? currentQuest.IsDeathQuest : false;
    },

    possibleNextQuests: function() {
        return possibleNextQuests;
    },

    allStatNames: function() {
        return Object.keys(stats);
    },

    visibleStatNames: function() {
        return visibleStatNames;
    },

    stats: function() {
        return stats;
    },

    tags: function() {
        return [...tags];
    },

    playerIsDead: function() {
        return isPlayerDead();
    },

    continueButtonText: function() {
        return continueButtonText;
    },

    deathContinueButtonText: function() {
        return deathContinueButtonText;
    },

    deathResultText: function() {
        return deathResultText;
    },

    processText: function(rawText) {
        const parts = rawText.split('#');
        if ((parts.length % 2) === 0) {
            return '<text substitution error - unmatched hash signs>';            
        }
        for (let i=1; i<parts.length; i += 2) {
            if (stats.hasOwnProperty(parts[i])) {
                parts[i] = stats[parts[i]];
            } else {
                parts[i] = `<unknown stat '${parts[i]}'>`;
            }
        }
        return parts.join('');
    },

    downloadGameDataAsJSON: function() {
        const resultAsJSONString = JSON.stringify(rawGameData, undefined, 4);
        const resultAsDataURI = 'data:application/json;base64,' + window.btoa(resultAsJSONString);
        download('gameData.json', resultAsDataURI);
    }

}, 'gameStore');


export let GameStoreMutator = createStoreMutator(GameStore, {
    init: function() {
        state = 'loading';

        let dataLoadPromise;
        if (process.env.NODE_ENV === 'development') {
            console.log('Loading game data from Google spreadsheet.');
            dataLoadPromise = loadDataFromGoogleSpreadsheet();

        } else {
            console.log('Loading game data from JSON file.');
            dataLoadPromise = new Promise(function (resolve, reject) {
                resolve(bakedGameData);
            });
        }
        dataLoadPromise.then(this._processLoadedData.bind(this));
    },

    _processLoadedData: function(result) {
        rawGameData = result;
        allQuests = result.data.quests;
        warnings = result.warnings;
        continueButtonText = result.continueButtonText;
        deathContinueButtonText = result.deathContinueButtonText;
        deathResultText = result.deathResultText;

        const dataHash = sha1(allQuests);
        const cachedDataHash = lscache.get('dataHash');

        if (cachedDataHash === dataHash) {
            console.log('Cache has same hash as loaded data.')
            this._loadGame();
            this.emitChange();
        } else {
            console.log('Cache has different hash as loaded data.')
            lscache.set('dataHash', dataHash);
            this.restartGame();
        }
    },

    _saveGame: function() {
        let savedGameState = {
            currentQuestID: currentQuest ? currentQuest.ID : -1,
            stats: stats,
            tags: [...tags],
        };
        lscache.set('gameState', savedGameState);
    },

    _loadGame: function() {
        let loadedGameState = lscache.get('gameState');
        if (loadedGameState) {
            state = 'playing';
            if (loadedGameState.currentQuestID !== -1) {
                currentQuest = allQuests.find(q => q.ID === loadedGameState.currentQuestID);
                if (currentQuest === undefined) {
                    console.log(`Couldn't find a quest with the ID '${loadedGameState.currentQuestID}' - resetting the game.`);
                    resetGameState();
                    possibleNextQuests = getPossibleNextQuests();
                    pickNextQuest();
                    return;
                }
            } else {
                currentQuest =  null;
            }
            stats = loadedGameState.stats;
            tags = new Set(loadedGameState.tags);
        } else {
            resetGameState();
        }
        possibleNextQuests = getPossibleNextQuests();
        pickNextQuest();
    },

    restartGame: function() {
        resetGameState();
        possibleNextQuests = getPossibleNextQuests();
        pickNextQuest();
        this.emitChange();
    },

    executeChoice: function(choiceIndex) {
        // Automatically delete start tag.
        if (tags.has(startTag)) tags.delete(startTag);

        // If the current quest is a death quest, don't execute quest logic. The game will be restarted in pickNextQuest.
        if (currentQuest.IsDeathQuest) return;

        let nextQuestSetByGoCommand = null;

        currentQuest.Outcomes[choiceIndex].forEach(([operator, param0, param1]) => {
            switch (operator) {
            case 'set': {
                stats[param0] = param1;
                checkStatForDeath(param0, choiceIndex);
                break;
            }
            case 'add': {
                if (!stats.hasOwnProperty(param0)) stats[param0] = 0;
                stats[param0] += param1;
                if (stats[param0] > statMaxValue) stats[param0] = statMaxValue;
                break;
            }
            case 'subtract': {
                if (!stats.hasOwnProperty(param0)) stats[param0] = 0;
                stats[param0] -= param1;
                checkStatForDeath(param0, choiceIndex);
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
            case 'restart': {
                resetGameState();
                break;
            }
            case 'go': {
                // This picks the first one. The loading code warns when there are go commands referring to non-unique quest names. 
                const nextQuest = allQuests.find(q => q.QuestName === param0);
                if (nextQuest !== undefined) {
                    nextQuestSetByGoCommand = nextQuest;
                } else {
                    reportError(`Go command in outcome ${'AB'[choiceIndex]} of quest '${currentQuest.QuestName}', sheet '${currentQuest.SheetName}': could not find a quest named '${param0}'`);
                }
                break;
            }
            default: {
                reportError(`Unknown operator '${operator}' in outcome ${'AB'[choiceIndex]} of quest '${currentQuest.QuestName}', sheet '${currentQuest.SheetName}'`);
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
        if (currentQuest.IsDeathQuest) {
            resetGameState();
            possibleNextQuests = getPossibleNextQuests();
        }
        pickNextQuest();
        this._saveGame();
        this.emitChange();
    },
});


function checkStatForDeath(statName, choiceIndex) {
    if (stats[statName] <= 0) {
        stats[statName] = 0;
        const deathTags = currentQuest.DeathTags[choiceIndex];
        if (deathTags.length > 0) {
            const deathTagIndex = Math.floor(Math.random() * deathTags.length);
            tags.add(deathTags[deathTagIndex]);
        } else {
            tags.add(defaultDeathTag);
        };
    }
}


function reportError(message) {
    warnings.push(message);
    console.log(message);
}


function resetGameState() {
    state = 'playing';

    currentQuest = null;

    stats = {};
    for (let statName of visibleStatNames) {
        stats[statName] = statStartValue;
    }

    tags.clear();
    tags.add(startTag);

    possibleNextQuests = [];
}


function isPlayerDead() {
    return [...tags].some(tag => tag.startsWith('death'));
}


function getPossibleNextQuests() {
    const playerIsDead = isPlayerDead();
    const gameIsStarting = tags.has(startTag);

    return allQuests.filter(q => {
        if (gameIsStarting !== q.IsStartQuest) return false;
        if (playerIsDead !== q.IsDeathQuest) return false;

        const evaluateConditionForThisQuest = evaluateCondition.bind(null, q);
        return q.Conditions.every(evaluateConditionForThisQuest);
    });
}


function evaluateCondition(quest, [operator, param0, param1]) {
    switch (operator) {
    case 'lessThan': {
        if (!stats.hasOwnProperty(param0)) stats[param0] = 0;
        return stats[param0] < param1;
    }
    case 'greaterThan': {
        if (!stats.hasOwnProperty(param0)) stats[param0] = 0;
        return stats[param0] > param1;
    }
    case 'lessThanOrEqual': {
        if (!stats.hasOwnProperty(param0)) stats[param0] = 0;
        return stats[param0] <= param1;
    }
    case 'greaterThanOrEqual': {
        if (!stats.hasOwnProperty(param0)) stats[param0] = 0;
        return stats[param0] >= param1;
    }
    case 'equals': {
        if (!stats.hasOwnProperty(param0)) stats[param0] = 0;
        return stats[param0] === param1;
    }
    case 'hasTag': {
        return tags.has(param0);
    }
    case 'doesntHaveTag': {
        return !tags.has(param0);
    }
    default: {
        console.log(`Unknown operator '${operator}' in conditions of quest '${quest.QuestName}'`);
        break;
    }
    }
    return false;
};


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
