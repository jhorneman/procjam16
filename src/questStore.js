import { createStore, createStoreMutator } from './miniflux'; 
import loadDataFromGoogleSpreadsheet from './loadData';


let isLoading = true;
let quests = [];
let questLoadWarnings = [];


export let QuestStore = createStore({
    isLoading: function() {
        return isLoading;
    },

    all: function() {
        return quests;
    },

    warnings: function() {
        return questLoadWarnings;
    },
}, 'questStore');


export let QuestStoreMutator = createStoreMutator(QuestStore, {
    init: function() {
        let that = this;
        if (process.env.NODE_ENV === 'development') {
            let dataLoadPromise = loadDataFromGoogleSpreadsheet();
            dataLoadPromise.then(function(result) {
                quests = result.data.quests;
                questLoadWarnings = result.warnings;
                isLoading = false;
                that.emitChange();
            });
        } else {
            // loadDataFromJSONFile();
        }
    }
});
