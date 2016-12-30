import { createStore, createStoreMutator } from './miniflux'; 
import loadDataFromGoogleSpreadsheet from './loadData';
import lscache from 'ls-cache';
import sha1 from 'stable-sha1';
import download from './download';
import bakedGameData from './gameData.json';
import { visibleStatNames, distanceStatName, timeStatName } from './constants';


const statStartValue = 5;
const statMaxValue = 10;
const defaultDeathTag = 'death';
const startTag = 'start';
const defaultQuestDistance = 8;
const defaultQuestTime = 1;
const localStorageKey = 'gameState';

let state = 'uninitialized';
let errorMessage;
let rawGameData;
let allQuests = [];
let allStringLists = {};
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

    currentStyle: function() {
        if (currentQuest && (currentQuest.Style.length > 0)) {
           return currentQuest.Style;
        }
        return ['jungle'];
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
                if (allStringLists.hasOwnProperty(parts[i])) {
                    const stringIndex = Math.floor(Math.random() * allStringLists[parts[i]].length);
                    parts[i] = allStringLists[parts[i]][stringIndex];
                } else {
                    parts[i] = `<unknown stat or string list '${parts[i]}'>`;
                }
            }
        }
        return parts.join('');
    },

    downloadGameDataAsJSON: function() {
        const resultAsJSONString = JSON.stringify(rawGameData, undefined, 4);
        const resultAsDataURI = 'data:application/json;base64,' + window.btoa(resultAsJSONString);
        download('gameData.json', resultAsDataURI);
    },

    // This doesn't mutate store state, so it's fine to put it here.
    clearLocalStorage: function() {
        lscache.remove(localStorageKey);
    },

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
        console.log(`Data was retrieved at ${result.retrievedAt}.`);

        allQuests = result.data.quests;
        allStringLists = result.data.stringLists;
        warnings = result.warnings;
        continueButtonText = result.continueButtonText;
        deathContinueButtonText = result.deathContinueButtonText;
        deathResultText = result.deathResultText;

        const dataHash = sha1(allQuests);   // Only quests can alter the game flow, no need to hash the rest.
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
        lscache.set(localStorageKey, savedGameState);
    },

    _loadGame: function() {
        let loadGameSuccess = false;

        // Try to get dynamic game state from local storage. Did we get anything?
        let loadedGameState = lscache.get(localStorageKey);
        if (loadedGameState) {
            // Yes -> Do we have any current quest ID?
            if (loadedGameState.currentQuestID !== -1) {
                // Yes -> Can we find a quest with this ID?
                currentQuest = allQuests.find(q => q.ID === loadedGameState.currentQuestID);
                if (currentQuest !== undefined) {
                    // Yes -> Success!
                    state = 'playing';
                    stats = loadedGameState.stats;
                    tags = new Set(loadedGameState.tags);
                    loadGameSuccess = true;
                } else {
                    console.log(`Couldn't find a quest with the ID '${loadedGameState.currentQuestID}' - resetting the game.`);
                }
            }
        }

        // If we couldn't load the game state, reset it.
        if (!loadGameSuccess) {
            resetGameState();
            possibleNextQuests = getPossibleNextQuests();
            pickNextQuest();
        }
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

        // TODO: Read distance/time from quest, only do following if no values are found.
        stats[distanceStatName] += defaultQuestDistance;
        stats[timeStatName] += defaultQuestTime;

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
    stats[distanceStatName] = 0;
    stats[timeStatName] = 0;

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
