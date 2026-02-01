local ContentProvider = game:GetService("ContentProvider")

local Overmind = script:FindFirstAncestor("Overmind")

local Util = require(Overmind.Util)
local Log = require(Overmind.Log)

local Assets = require(script.Parent.Assets)

local Loader = {}

function Loader.assets(): { string }
	return Util.dictionaryToArray(Assets)
end

function Loader.load()
	local assets = Loader.assets()

	Log.trace(`Loading {#assets} assets..`)

	task.spawn(function()
		ContentProvider:PreloadAsync(assets)
	end)
end

return Loader
