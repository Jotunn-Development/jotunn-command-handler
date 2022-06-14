class SlashCommands {
  constructor(client) {
    this._client = client
  }

  getCommands(guildId) {
    if (guildId) {
      return this._client.guilds.cache.get(guildId)?.commands
    }

    return this._client.application?.commands
  }

  // Create slash command, perform check for existing commands to update or otherwise ignore.
  async create(name, description, options, guildId) {
    const commands = this.getCommands(guildId)
    if (!commands) {
      return
    }

    await commands.fetch()

    const existingCommand = commands.cache.find((cmd) => cmd.name === name)
    if (existingCommand) {
      // TODO: Update Slash Commands
      console.log(`Ignoring command "${name}", already exists`)
      return
    }

    return await commands.create({
      name,
      description,
      options,
    })
  }

  delete() {}
}

module.exports = SlashCommands
