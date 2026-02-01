--!strict
local RunService = game:GetService("RunService")

local plugin = script:FindFirstAncestorWhichIsA("Plugin")

local Overmind = script:FindFirstAncestor("Overmind")
local Packages = Overmind.Packages

local Components = script.Components
local Pages = script.Pages

local Fusion = require(Packages.Fusion)
local Signal = require(Packages.Signal)

local manifest = require(Overmind.manifest)
local Config = require(Overmind.Config)
local Client = require(Overmind.Client)
local Signals = require(Overmind.Signals)
local Log = require(Overmind.Log)

local Assets = require(script.Assets)
local Theme = require(script.Theme)

local Toolbar = require(Components.Plugin.Toolbar)
local ToolbarButton = require(Components.Plugin.ToolbarButton)
local Widget = require(Components.Plugin.Widget)
local Container = require(Components.Container)
local Padding = require(Components.Padding)
local Image = require(Components.Image)
local Text = require(Components.Text)
local List = require(Components.List)

local NotConnected = require(Pages.NotConnected)
local Connecting = require(Pages.Connecting)
local Connected = require(Pages.Connected)
local Unavailable = require(Pages.Unavailable)
local Error = require(Pages.Error)

local New = Fusion.New
local Value = Fusion.Value
local Spring = Fusion.Spring
local OnEvent = Fusion.OnEvent
local OnChange = Fusion.OnChange
local Observer = Fusion.Observer
local Computed = Fusion.Computed
local Children = Fusion.Children
local cleanup = Fusion.cleanup
local peek = Fusion.peek

local POLL_INTERVAL = 1

local App = {}
App.__index = App

function App.new()
	local self = setmetatable({}, App)

	self.client = nil
	self.pollThread = nil
	self.lastSignal = Value(os.time())
	self.signalsProcessed = Value(0)

	self.rootSize = Value(Vector2.new(300, 200))
	self.icon = Value(Assets.Overmind.Logo)
	self.pages = Value({})

	self.settingsWidget = Value(nil)

	local isOpen = Value(false)

	local toolbarButton = ToolbarButton {
		Toolbar = Toolbar {
			Name = "qborder",
		},
		Name = "Overmind",
		ToolTip = "Open Overmind AI",
		Image = self.icon,

		[OnEvent "Click"] = function()
			isOpen:set(not peek(isOpen))
		end,
	}

	Widget {
		Name = "Overmind",
		MinimumSize = peek(self.rootSize),
		Enabled = isOpen,

		[OnChange "Enabled"] = function(isEnabled)
			isOpen:set(isEnabled)
		end,
		[OnChange "AbsoluteSize"] = function(size)
			self.rootSize:set(size)
		end,

		[Children] = self.pages,
	}

	plugin.Unloading:Connect(Observer(isOpen):onChange(function()
		toolbarButton:SetActive(peek(isOpen))
	end))

	toolbarButton:SetActive(peek(isOpen))

	if RunService:IsEdit() then
		self:home()

		if Config:get("AutoConnect") then
			local apiKey = Config:get("ApiKey")
			if apiKey and apiKey ~= "" then
				self:connect(apiKey)
			end
		end
	else
		self:setPage(Unavailable())
	end

	return self
end

function App:setIcon(icon: ("Ok" | "Warn" | "Error")?)
	if icon == "Ok" then
		self.icon:set(Assets.Overmind.LogoOk)
	elseif icon == "Warn" then
		self.icon:set(Assets.Overmind.LogoWarn)
	elseif icon == "Error" then
		self.icon:set(Assets.Overmind.LogoError)
	else
		self.icon:set(Assets.Overmind.Logo)
	end
end

function App:setPage(page)
	local pages = peek(self.pages)

	for id, child in pages do
		if child._finished then
			pages[id] = nil
			continue
		end

		task.spawn(function()
			child._destructor(child._value)
			child._finished = true
		end)
	end

	local size = Value(UDim2.fromScale(1, 1))

	page = Computed(function()
		return New "Frame" {
			AnchorPoint = Vector2.new(0.5, 0.5),
			Position = UDim2.fromScale(0.5, 0.5),
			Size = Spring(size, 10),
			BackgroundColor3 = Theme.Colors.Background,
			BorderSizePixel = 0,
			[Children] = {
				List {
					VerticalAlignment = Enum.VerticalAlignment.Center,
					HorizontalAlignment = Enum.HorizontalAlignment.Center,
					Spacing = 8,
				},
				Padding {
					Padding = Theme.WidgetPadding,
				},
				Container {
					Size = UDim2.fromScale(1, 0),
					[Children] = {
						Image {
							Size = UDim2.fromOffset(155, 35),
							Image = Assets.Overmind.Banner,
							ImageColor3 = Theme.Colors.Brand,
						},
						Text {
							AnchorPoint = Vector2.new(1, 1),
							Position = UDim2.new(1, -3, 1, 0),
							Text = `v{manifest.package.version}`,
							Color = Theme.Colors.TextDimmed,
							TextSize = Theme.TextSize.Small,
						},
					},
				},
				Container {
					Size = UDim2.fromScale(1, 0),
					[Children] = page,
				},
			},
		}
	end, function(page)
		if not page then
			return
		end

		local TWEEN_INFO = TweenInfo.new(0.2, Enum.EasingStyle.Sine, Enum.EasingDirection.Out)
		game:GetService("TweenService"):Create(page, TWEEN_INFO, { BackgroundTransparency = 1 }):Play()

		for _, descendant in page:GetDescendants() do
			local properties = {}

			if descendant:IsA("GuiObject") then
				if descendant:IsA("GuiButton") then
					descendant.Active = false
				end

				properties.BackgroundTransparency = 1

				if descendant:IsA("TextLabel") or descendant:IsA("TextButton") or descendant:IsA("TextBox") then
					properties.TextTransparency = 1
				elseif descendant:IsA("ImageLabel") or descendant:IsA("ImageButton") then
					properties.ImageTransparency = 1
				end
			end

			if descendant:IsA("UIStroke") then
				properties.Transparency = 1
			end

			if next(properties) then
				game:GetService("TweenService"):Create(descendant, TWEEN_INFO, properties):Play()
			end
		end

		page.ZIndex = 2
		size:set(UDim2.fromScale(1.2, 1))

		task.wait(0.2)
		cleanup(page)
	end)

	local Util = require(Overmind.Util)
	pages[Util.generateGUID()] = page
	self.pages:set(pages)
end

function App:home()
	self:setPage(NotConnected {
		App = self,
	})

	self:setIcon()
end

function App:connect(apiKey: string)
	self:setPage(Connecting {
		App = self,
	})

	self.client = Client.new()

	self.client
		:connect(apiKey)
		:andThen(function()
			Config:set("ApiKey", apiKey, "Global")

			self:setPage(Connected {
				App = self,
			})

			self:setIcon("Ok")
			self:startPolling()
		end)
		:catch(function(err)
			self:setPage(Error {
				App = self,
				Message = tostring(err),
			})

			self:setIcon("Error")
			self.client = nil
		end)
end

function App:disconnect()
	if self.pollThread then
		task.cancel(self.pollThread)
		self.pollThread = nil
	end

	if self.client then
		self.client:disconnect()
		self.client = nil
	end

	self:home()
end

function App:startPolling()
	if self.pollThread then
		task.cancel(self.pollThread)
	end

	self.pollThread = task.spawn(function()
		while self.client and self.client.isConnected do
			local signals = self.client:poll():expect()

			for _, signal in signals do
				Log.trace("Processing signal:", signal.action)

				local result = Signals.handle(signal)
				self.client:sendResult(result)

				self.lastSignal:set(os.time())
				self.signalsProcessed:set(peek(self.signalsProcessed) + 1)
			end

			task.wait(POLL_INTERVAL)
		end
	end)
end

function App:isConnected(): boolean
	return self.client ~= nil and self.client.isConnected
end

return App
