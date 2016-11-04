import { createStore, createStoreMutator } from './miniflux'; 
import loadDataFromGoogleSpreadsheet from './loadData';


let quests = [];
let questLoadWarnings = [];


export let QuestStore = createStore({
    all: function() {
        return quests;
    },

    warnings: function() {
        return questLoadWarnings;
    }
}, 'questStore');


export let QuestStoreMutator = createStoreMutator(QuestStore, {
    init: function() {
        let that = this;
        if (process.env.NODE_ENV === 'development') {
            let dataLoadPromise = loadDataFromGoogleSpreadsheet();
            dataLoadPromise.then(function(result) {
                quests = result.data.quests;
                questLoadWarnings = result.warnings;
                that.emitChange();
            });
        } else {
            // loadDataFromJSONFile();
        }
    }
});
