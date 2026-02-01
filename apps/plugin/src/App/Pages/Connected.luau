--!strict
local Overmind = script:FindFirstAncestor("Overmind")
local App = Overmind.App
local Components = App.Components

local Fusion = require(Overmind.Packages.Fusion)

local Theme = require(App.Theme)

local TextButton = require(Components.TextButton)
local Container = require(Components.Container)
local Padding = require(Components.Padding)
local Text = require(Components.Text)
local List = require(Components.List)
local Box = require(Components.Box)

local Value = Fusion.Value
local Observer = Fusion.Observer
local Computed = Fusion.Computed
local Children = Fusion.Children
local Cleanup = Fusion.Cleanup
local peek = Fusion.peek

type Props = {
	App: { [string]: any },
}

return function(props: Props): { Instance }
	local lastSignalText = Value("just now")

	local function updateLastSignalText()
		return task.spawn(function()
			while true do
				local elapsed = os.time() - peek(props.App.lastSignal)
				local interval = 1
				local text

				if elapsed < 1 then
					text = "just now"
				elseif elapsed < 60 then
					text = math.floor(elapsed) .. "s ago"
				elseif elapsed < 3600 then
					interval = 60
					text = elapsed // interval .. "m ago"
				elseif elapsed < 86400 then
					interval = 3600
					text = elapsed // interval .. "h ago"
				else
					interval = 86400
					text = elapsed // interval .. "d ago"
				end

				lastSignalText:set(text)
				task.wait(interval)
			end
		end)
	end

	local thread = updateLastSignalText()
	local disconnect = Observer(props.App.lastSignal):onChange(function()
		task.cancel(thread)
		thread = updateLastSignalText()
	end)

	return {
		List {},
		Box {
			Size = UDim2.new(1, 0, 0, Theme.CompSizeY.Large * 1.5),
			[Children] = {
				Padding {},
				Text {
					Size = UDim2.fromScale(0.8, 0.5),
					Text = "Connected",
					Font = Theme.Fonts.Bold,
					Scaled = true,
				},
				Text {
					Position = UDim2.fromScale(0, 0.5),
					Size = UDim2.fromScale(0.8, 0.5),
					Text = Computed(function(use)
						return `Signals: {use(props.App.signalsProcessed)}`
					end),
					TextSize = Theme.TextSize.Small,
					Font = Theme.Fonts.Mono,
					Scaled = true,
				},
				Text {
					AnchorPoint = Vector2.new(1, 0.5),
					Position = UDim2.new(1, -2, 0.5, 0),
					Text = Computed(function(use)
						return `<i>Last signal\n{use(lastSignalText)}</i>`
					end),
					RichText = true,
					Color = Theme.Colors.TextDimmed,
					TextSize = Theme.TextSize.Small,
					TextXAlignment = Enum.TextXAlignment.Right,
					LineHeight = 1.2,
				},
			},
		},
		Container {
			Size = UDim2.fromScale(1, 0),
			[Children] = {
				List {
					FillDirection = Enum.FillDirection.Horizontal,
					HorizontalAlignment = Enum.HorizontalAlignment.Right,
				},
				TextButton {
					Text = "Disconnect",
					LayoutOrder = 2,
					Solid = true,

					Activated = function()
						props.App:disconnect()
					end,

					[Cleanup] = function()
						disconnect()
						task.cancel(thread)
					end,
				},
			},
		},
	}
end
