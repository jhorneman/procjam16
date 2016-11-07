import { createStore, createStoreMutator } from './miniflux'; 
import loadDataFromGoogleSpreadsheet from './loadData';


export const visibleStatNames = [
    'health',
    'luck',
    'morale',
    'rations',
];

const statStartValue = 5;
const statMaxValue = 10;
const defaultDeathTag = 'death';

let state = 'uninitialized';
let errorMessage;
let allQuests = [];
let warnings = [];

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
    }

}, 'gameStore');


export let GameStoreMutator = createStoreMutator(GameStore, {
    init: function() {
        let that = this;
        let dataLoadPromise = loadDataFromGoogleSpreadsheet();
        dataLoadPromise.then(function(result) {
            allQuests = result.data.quests;
            warnings = result.warnings;
            that.restartGame();
        });
    },

    restartGame: function() {
        resetGameState();
        possibleNextQuests = getPossibleNextQuests();
        pickNextQuest();
        this.emitChange();
    },

    executeChoice: function(choiceIndex) {
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
        pickNextQuest();
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

    possibleNextQuests = [];
}


function isPlayerDead() {
    return [...tags].some(tag => tag.startsWith('death'));
}


function getPossibleNextQuests() {
    const playerIsDead = isPlayerDead();
    return allQuests.filter(q => {
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
