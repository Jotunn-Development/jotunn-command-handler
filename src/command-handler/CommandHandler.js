const path = require('path')

const getAllFiles = require('../util/get-all-files')
const Command = require('./Command')
const SlashCommands = require('./SlashCommands')

class CommandHandler {
  // <commandName, instance of the Command class>
  commands = new Map()

  constructor(instance, commandsDir, client) {
    this._instance = instance
    this._commandsDir = commandsDir
    this._slashCommands = new SlashCommands(client)

    this.readFiles()
    this.messageListener(client)
  }

  readFiles() {
    const files = getAllFiles(this._commandsDir)
    const validations = this.getValidations('syntax')

    for (let file of files) {
      const commandObject = require(file)

      let commandName = file.split(/[/\\]/)
      commandName = commandName.pop()
      commandName = commandName.split('.')[0]

      const command = new Command(this._instance, commandName, commandObject)

      for (const validation of validations) {
        validation(command)
      }

      /**
       * false || undefined  = legacy command
       * true - slash command only
       * 'both' = legacy and slash command
       */
      const { slash, testOnly } = commandObject

      if (slash === true || slash === 'both') {
        if (commandObject.testOnly === true) {
          for (const guildId of this._instance.testServers) {
            this._slashCommands.create(commandName, 'description', [], guildId)
          }
        } else {
          this._slashCommands.create(commandName, 'description', [])
        }
      }

      if (slash !== true) {
        this.commands.set(command.commandName, command)
      }
    }
  }

  messageListener(client) {
    const validations = this.getValidations('run-time')

    const prefix = 'hb.'

    client.on('messageCreate', (message) => {
      const { content } = message

      if (!content.startsWith(prefix)) {
        return
      }

      const args = content.split(/\s+/)
      const commandName = args.shift().substring(prefix.length).toLowerCase()

      const command = this.commands.get(commandName)
      if (!command) {
        return
      }

      const usage = {
        message,
        args,
        text: args.join(' '),
        guild: message.guild,
      }

      for (const validation of validations) {
        if (!validation(command, usage, prefix)) {
          return
        }
      }

      const { callback } = command.commandObject

      callback(usage)
    })
  }

  getValidations(folder) {
    const validations = getAllFiles(
      path.join(__dirname, `./validations/${folder}`)
    ).map((filepath) => require(filepath))

    return validations
  }
}

module.exports = CommandHandler
