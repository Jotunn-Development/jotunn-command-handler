const mongoose = require('mongoose')

const CommandHandler = require('./command-handler/CommandHandler')

class jotunnCommand {
  constructor({ client, mongoUri, commandsDir, testServers = [] }) {
    if (!client) {
      throw new Error('A client is required.')
    }

    this._testServers = testServers

    if (mongoUri) {
      this.connectToMongo(mongoUri)
    }

    if (commandsDir) {
      new CommandHandler(this, commandsDir, client)
    }
  }

  get testServers() {
    return this._testServers
  }

  connectToMongo(mongoUri) {
    mongoose.connect(mongoUri, {
      keepAlive: true,
    })
  }
}

module.exports = jotunnCommand
