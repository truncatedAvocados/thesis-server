# BlogRank

BlogRank is your go-to source for discovering programming knowledge from bloggers. Independent bloggers power the world of development, often-times disseminating the best new ideas, practices, and even novel language contructs that the creators of a technology didn't even think of. The core idea of BlogRank is that the articles you want to see most are the ones vetted by other independent bloggers. The more highly cited a blog post is by other authors, the more highly we rank it. You can also search by author who are ranked according to their h-index, as inspired by the world of academia.

Our search engine is powered by the graph data structure you see visualized in the background, and a web crawler and indexing service running behind the scenes. The project was made with React, Node.js, and postgreSQL.

## Team

  - __Product Owner__: Amir Bandeali
  - __Scrum Master__: Nick Olszowy
  - __Development Team Members__: Amir Bandeali, Nick Olszowy, Pete Herbert

## Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Server-side](#server-side)
    1. [Client-side](#client-side)
    1. [Worker Service and Index Service](#worker-service-and-index-service)
    1. [Roadmap](#roadmap)
1. [Contributing](#contributing)

## Usage

Just enter your search term or phrase and see what we give you back! The app shows you relevant information when you click on a search result, mainly the blog posts who have cited the result you are on. This is useful knowledge, because while you are visiting a website you can never see those who have linked to it, only links from the page outwards. Having this information is very useful to guide your search in finding relevant and well-written information.

## Requirements

- Node (v6.6^)
- PostgreSQL (v9.5^)

## Development

In order to start developing there are several steps to take. First, you should have a local postgreSQL up and running with a database named `testgraph`. See [this page](https://www.postgresql.org/docs/9.0/static/tutorial-createdb.html) to get started with postgreSQL locally. From there, you'll want to use `brew` or another package manager to get the grunt command line interface and the mocha command line interface if you don't already.

Once you have a working postgres server up, move on to installing dependencies.

### Installing Dependencies

Clone the client repo into the top level of the server repo. From within the server directory, and then again within the client directory:

```sh
npm install
```

That's it!

### Server-side

To develop server-side, within your server-side directory run `npm run start:dev` which will intialize nodemon to start the server connected to your local postgres DB and watch the files for changes. [Postman](https://www.getpostman.com/) is a very useful app for testing routes.

### Client-side

ES6 syntax and JSX notation must be transpiled to vanilla javascript. To achieve this we are using Babel within grunt to transpile and browserify files into the compiled directory. To transpile files just once, run `grunt` in the terminal within the client directory. To watch the files for changes and transpile on all changes run `grunt watch`. 

### Worker Service and Index Service

This is where the magic happens. These files are accessed by CRON jobs on the deployed server, and as such export their functionality. If you want to test the services on your local DB, go into the top level file for each (startCrawlers.js and main.js, respectively) and uncomment the code at the bottom that initializes the main function. Then you will be able to use the `node` terminal command to test either one. One thing to note, before the crawler will work you must load in the whitelist to the database with the loadWL.js file. Finally, the worker must find posts and the index service must populate the query lists before your local client will be able to search for anything.

The crawler has a few arguments that can be provided to it. If your crawler ever crashes or you command-C on the terminal, the crawlers current queue qill be written to a JSON file. You can restart the crawler with this queue using the `--continue` argument. Additionally, if you wish to interactively add to the whitelist implemented by your local crawler, run the crawler with the argument `--add`. This will give you a prompt driven system where random sites are chosen and presented to you. You have four options at any given link:

- `y` to add the site to the whitelist
- `n` to not add it and move on to the next link in the queue
- `a` to add this base url to the list of urls you know are not blogs and can be filtered out automatically
- `e` to exit interactive mode and continue crawling with the new links you have amassed


### Roadmap

FOR PETE
View the project roadmap [here](LINK_TO_PROJECT_ISSUES)


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
