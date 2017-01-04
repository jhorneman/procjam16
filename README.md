# Procjam 16

This is a game developed for [Procjam 2016](http://www.procjam.com) by Liz England, Jurie Horneman, and Stefan Srb.

## Installation

Install the latest LTS verion of [Node](https://nodejs.org/).

Open a terminal or command line window in the directory where you have this repository on your local hard drive.

Type `npm install`. This should now install all the software you need to run the game. This may take a while!

## Working on the game

Type `npm start`. This will run the game in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The web page will reload automatically if you make edits to the source code, but _not_ if you edit the quest data from the Google spreadsheet.

When you run in development mode, there are a lot of debugging tools to make your life easier.

## Building the game for publishing

Type `npm run build`. This will build the game and put the resulting files in the `build` folder. Put the contents of this folder on a standard web server to deploy the game for others to play.
