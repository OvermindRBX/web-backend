--!strict
local Overmind = script:FindFirstAncestor("Overmind")
local App = Overmind.App
local Components = App.Components
local Util = Components.Util

local Fusion = require(Overmind.Packages.Fusion)
local Config = require(Overmind.Config)

local Theme = require(App.Theme)

local TextButton = require(Components.TextButton)
local IconButton = require(Components.IconButton)
local Container = require(Components.Container)
local Padding = require(Components.Padding)
local Input = require(Components.Input)
local List = require(Components.List)
local Text = require(Components.Text)
local Box = require(Components.Box)

local Value = Fusion.Value
local Computed = Fusion.Computed
local Children = Fusion.Children
local Spring = Fusion.Spring

type Props = {
	App: { [string]: any },
}

return function(props: Props): { Instance }
	local apiKeyInput = Value(Config:get("ApiKey") or "")
	local inputFocused = Value(false)

	return {
		List {},
		Box {
			Size = UDim2.new(1, 0, 0, Theme.CompSizeY.Large),
			AutomaticSize = Enum.AutomaticSize.None,
			BorderColor = Spring(
				Computed(function(use)
					if use(inputFocused) then
						return use(Theme.Colors.Brand)
					else
						return use(Theme.Colors.Border)
					end
				end),
				Theme.SpringFastSpeed,
				Theme.SpringDamping
			),

			[Children] = {
				List {
					Spacing = 4,
					FillDirection = Enum.FillDirection.Horizontal,
					VerticalAlignment = Enum.VerticalAlignment.Center,
				},
				Input {
					Size = UDim2.fromScale(1, 1),
					Font = Theme.Fonts.Mono,
					PlaceholderText = "Enter your API key",
					Text = apiKeyInput,

					Started = function()
						inputFocused:set(true)
					end,

					Changed = function(text)
						apiKeyInput:set(text)
					end,

					Finished = function()
						inputFocused:set(false)
					end,

					[Children] = {
						Padding {
							Left = 1,
						},
					},
				},
				Padding {
					Padding = 10,
					Vertical = false,
				},
			},
		},
		Text {
			Size = UDim2.fromScale(1, 0),
			AutomaticSize = Enum.AutomaticSize.Y,
			Text = "Get your API key from the Overmind dashboard",
			Color = Theme.Colors.TextDimmed,
			TextSize = Theme.TextSize.Small,
			TextXAlignment = Enum.TextXAlignment.Center,
		},
		Container {
			Size = UDim2.fromScale(1, 0),
			[Children] = {
				List {
					FillDirection = Enum.FillDirection.Horizontal,
					HorizontalAlignment = Enum.HorizontalAlignment.Right,
				},
				TextButton {
					Solid = true,
					LayoutOrder = 2,
					Text = "Connect",
					Activated = function()
						local key = Fusion.peek(apiKeyInput)
						if key and key ~= "" then
							props.App:connect(key)
						end
					end,
				},
				IconButton {
					Icon = "rbxassetid://7733908918",
					Activated = function()
						Config:set("ApiKey", "", "Global")
						apiKeyInput:set("")
					end,
					LayoutOrder = 1,
				},
			},
		},
	}
end
