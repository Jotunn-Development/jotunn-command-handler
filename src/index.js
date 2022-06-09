const CommandHandler = require('./CommandHandler')

class jotunnCommand {
  constructor({ client, commandsDir }) {
    if (!client) {
      throw new Error('A client is required.')
    }

    if (commandsDir) {
      new CommandHandler(commandsDir, client)
    }
  }
}

module.exports = jotunnCommand
