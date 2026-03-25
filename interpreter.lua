local json = require('json')

local cmds = require('commands')

local command
local decoded_command

io.write('{"type":"started"}\n')

repeat
	io.flush()

	command=json.decode(io.read())

	if command['type'] == 'command' then
		core.console(command['command'])

		local response = {}

		response.type = "command_end"

		io.write(json.encode(response) .. "\n")
		io.flush()
	end
until command['type'] == 'exit'
