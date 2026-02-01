--!strict
local HttpService = game:GetService("HttpService")

local Overmind = script:FindFirstAncestor("Overmind")

local Promise = require(Overmind.Packages.Promise)

local Config = require(Overmind.Config)
local Types = require(Overmind.Types)
local Log = require(Overmind.Log)

type Response = {
	Body: string,
	Headers: { [string]: string },
	StatusCode: number,
	StatusMessage: string,
	Success: boolean,
}

local Client = {}
Client.__index = Client

function Client.new()
	local self = setmetatable({}, Client)

	self.apiKey = ""
	self.apiUrl = Config:get("ApiUrl")
	self.pollInterval = Config:get("PollInterval")
	self.isConnected = false
	self.sessionId = HttpService:GenerateGUID(false)

	return self
end

function Client:getUrl(endpoint: string?): string
	return `{self.apiUrl}/api/{endpoint or "rivet"}`
end

function Client:request(method: string, body: { [string]: any }?): Promise.TypedPromise<Response>
	return Promise.new(function(resolve, reject)
		local success, response = pcall(function()
			return HttpService:RequestAsync({
				Url = self:getUrl("rivet"),
				Method = method,
				Headers = {
					["Content-Type"] = "application/json",
					["Authorization"] = `Bearer {self.apiKey}`,
				},
				Body = body and HttpService:JSONEncode(body) or nil,
			})
		end)

		if success then
			if response.Success then
				resolve(response)
			else
				reject(`HTTP {response.StatusCode}: {response.StatusMessage}`)
			end
		else
			reject(tostring(response))
		end
	end)
end

function Client:connect(apiKey: string): Promise.TypedPromise<boolean>
	Log.trace("Connecting to Overmind API...")

	self.apiKey = apiKey

	local placeName = "Unknown"
	pcall(function()
		if game.PlaceId ~= 0 then
			placeName = game:GetService("MarketplaceService"):GetProductInfo(game.PlaceId).Name or "Unknown"
		else
			placeName = game.Name
		end
	end)

	return self:request("POST", {
		action = "connect",
		apiKey = apiKey,
		source = "roblox",
		data = {
			sessionId = self.sessionId,
			placeName = placeName,
			placeId = game.PlaceId,
			gameId = game.GameId,
		},
	}):andThen(function(response)
		local data = HttpService:JSONDecode(response.Body)

		if data.success then
			self.isConnected = true
			Log.trace("Connected to Overmind API")
			return true
		else
			return Promise.reject(data.error or "Connection failed")
		end
	end)
end

function Client:disconnect(): Promise.TypedPromise<boolean>
	Log.trace("Disconnecting from Overmind API...")

	return self:request("POST", {
		action = "disconnect",
		apiKey = self.apiKey,
		source = "roblox",
		data = {
			sessionId = self.sessionId,
		},
	})
		:andThen(function()
			self.isConnected = false
			self.apiKey = ""
			Log.trace("Disconnected from Overmind API")
			return true
		end)
		:catch(function(err)
			self.isConnected = false
			self.apiKey = ""
			Log.warn("Disconnect error:", err)
			return true
		end)
end

function Client:poll(): Promise.TypedPromise<{ Types.Signal }>
	if not self.isConnected then
		return Promise.resolve({})
	end

	return self:request("POST", {
		action = "poll",
		apiKey = self.apiKey,
		source = "roblox",
		data = {
			sessionId = self.sessionId,
		},
	})
		:andThen(function(response)
			local data = HttpService:JSONDecode(response.Body)
			return data.signals or {}
		end)
		:catch(function(err)
			Log.warn("Poll error:", err)
			return {}
		end)
end

function Client:sendResult(result: Types.SignalResult): Promise.Promise
	return self:request("POST", {
		action = "signal_result",
		apiKey = self.apiKey,
		source = "roblox",
		data = result,
	}):catch(function(err)
		Log.warn("Failed to send signal result:", err)
	end)
end

return Client
