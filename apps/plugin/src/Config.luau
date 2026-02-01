--!strict
local plugin = script:FindFirstAncestorWhichIsA("Plugin")

local Overmind = script:FindFirstAncestor("Overmind")

local Util = require(Overmind.Util)
local Log = require(Overmind.Log)

export type Level = "Place" | "Game" | "Global"
export type Setting = "ApiKey" | "ApiUrl" | "PollInterval" | "AutoConnect" | "LogLevel"

type Config = {
	__configs: { [Level]: { [Setting]: any } },
	__callbacks: { [Setting]: { (value: any) -> () } },
	load: () -> (),
	get: (self: Config, setting: Setting, level: Level?) -> any,
	getDefault: (self: Config, setting: Setting) -> any,
	set: (self: Config, setting: Setting, value: any, level: Level) -> (),
	restoreDefaults: (self: Config, level: Level) -> (),
	onChanged: (self: Config, setting: Setting, callback: (value: any) -> ()) -> () -> (),
}

local DEFAULTS = {
	ApiKey = "",
	ApiUrl = "https://overmindai.vercel.app",
	PollInterval = 1,
	AutoConnect = false,
	LogLevel = "Warn",
}

local CONFIGS = {
	Place = "OvermindConfigPlace_" .. game.PlaceId,
	Game = "OvermindConfigGame_" .. game.GameId,
	Global = "OvermindConfigGlobal",
}

local Config: Config = {
	__configs = {},
	__callbacks = {},
} :: Config

function Config.load()
	for level, config in CONFIGS do
		config = plugin:GetSetting(config)

		if config and type(config) == "table" then
			Config.__configs[level] = config
		else
			Config.__configs[level] = {}
		end
	end
end

function Config:get(setting, level)
	local default = DEFAULTS[setting]

	if default == nil then
		Log.error(`Setting '{setting}' does not exist!`)
	end

	if level then
		return self.__configs[level][setting]
	end

	for _, config in self.__configs do
		if config[setting] ~= nil then
			return config[setting]
		end
	end

	return default
end

function Config:getDefault(setting)
	local default = DEFAULTS[setting]

	if default == nil then
		Log.error(`Setting '{setting}' does not exist!`)
	end

	return default
end

function Config:set(setting, value, level)
	local default = DEFAULTS[setting]

	if default == nil then
		Log.error(`Setting '{setting}' does not exist!`)
	end

	value = Util.cast(value, type(default))

	if value ~= self.__configs[level][setting] and self.__callbacks[setting] then
		for _, callback in self.__callbacks[setting] do
			callback(value)
		end
	end

	self.__configs[level][setting] = if value == default then nil else value

	local config = self.__configs[level]

	if not next(config) then
		plugin:SetSetting(CONFIGS[level], nil)
	else
		plugin:SetSetting(CONFIGS[level], config)
	end
end

function Config:restoreDefaults(level)
	for setting, _ in self.__configs[level] do
		if self.__callbacks[setting] then
			for _, callback in self.__callbacks[setting] do
				callback(self:getDefault(setting))
			end
		end
	end

	self.__configs[level] = {}

	plugin:SetSetting(CONFIGS[level], nil)
end

function Config:onChanged(setting, callback)
	if not self.__callbacks[setting] then
		self.__callbacks[setting] = {}
	end

	local id = Util.generateGUID()
	self.__callbacks[setting][id] = callback

	return function()
		self.__callbacks[setting][id] = nil
	end
end

return Config
