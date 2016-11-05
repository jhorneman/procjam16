import { createStore, createStoreMutator } from './miniflux'; 
import loadDataFromGoogleSpreadsheet from './loadData';


let isLoading = true;
let quests = [];
let loadWarnings = [];


export let QuestStore = createStore({
    isLoading: function() {
        return isLoading;
    },

    all: function() {
        return quests;
    },

    loadWarnings: function() {
        return loadWarnings;
    },
}, 'questStore');


export let QuestStoreMutator = createStoreMutator(QuestStore, {
    init: function() {
        let that = this;
        if (process.env.NODE_ENV === 'development') {
            let dataLoadPromise = loadDataFromGoogleSpreadsheet();
            dataLoadPromise.then(function(result) {
                quests = result.data.quests;
                loadWarnings = result.warnings;
                isLoading = false;
                that.emitChange();
            });
        } else {
            // loadDataFromJSONFile();
        }
    }
});
