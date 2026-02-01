--!strict
local Selection = game:GetService("Selection")
local ChangeHistoryService = game:GetService("ChangeHistoryService")
local ScriptEditorService = game:GetService("ScriptEditorService")

local Overmind = script:FindFirstAncestor("Overmind")

local Types = require(Overmind.Types)
local Log = require(Overmind.Log)

local Signals = {}

local function findInstance(path: string): Instance?
	local useDotSeparator = not string.find(path, "/")
		and not string.find(path, "%.luau")
		and not string.find(path, "%.lua")
	local parts = useDotSeparator and string.split(path, ".") or string.split(path, "/")

	local current: Instance = game

	for _, part in parts do
		if part == "" then
			continue
		end
		local child = current:FindFirstChild(part)
		if not child then
			return nil
		end
		current = child
	end

	return current
end

local function findOrCreatePath(path: string): (Instance?, string)
	local useDotSeparator = not string.find(path, "/")
		and not string.find(path, "%.luau")
		and not string.find(path, "%.lua")
	local parts = useDotSeparator and string.split(path, ".") or string.split(path, "/")

	if #parts == 0 then
		return nil, "Invalid path"
	end

	local fileName = parts[#parts]
	table.remove(parts, #parts)

	if #parts == 0 then
		return game:GetService("ServerScriptService"), fileName
	end

	local current: Instance = game

	for _, part in parts do
		if part == "" then
			continue
		end
		local child = current:FindFirstChild(part)
		if not child then
			return nil, `Parent not found: {part}`
		end
		current = child
	end

	return current, fileName
end

local function getScriptTypeFromName(name: string): string
	if string.find(name, "%.server%.") or string.find(name, "%.server$") then
		return "Script"
	elseif string.find(name, "%.client%.") or string.find(name, "%.client$") then
		return "LocalScript"
	elseif string.find(name, "%.module%.") or string.find(name, "%.module$") then
		return "ModuleScript"
	elseif string.find(name, "%.luau$") or string.find(name, "%.lua$") then
		return "ModuleScript"
	end
	return "ModuleScript"
end

local function cleanScriptName(name: string): string
	name = string.gsub(name, "%.server%.luau$", "")
	name = string.gsub(name, "%.client%.luau$", "")
	name = string.gsub(name, "%.module%.luau$", "")
	name = string.gsub(name, "%.server%.lua$", "")
	name = string.gsub(name, "%.client%.lua$", "")
	name = string.gsub(name, "%.module%.lua$", "")
	name = string.gsub(name, "%.luau$", "")
	name = string.gsub(name, "%.lua$", "")
	return name
end

local function getInstancePath(instance: Instance): string
	local parts = {}
	local current = instance

	while current and current ~= game do
		table.insert(parts, 1, current.Name)
		current = current.Parent :: Instance
	end

	return table.concat(parts, "/")
end

local function createRecording(name: string)
	ChangeHistoryService:SetWaypoint(name)
end

local function cleanContent(content: string): string
	content = string.gsub(content, "\\n", "\n")
	content = string.gsub(content, "\\t", "\t")
	content = string.gsub(content, '\\"', '"')
	content = string.gsub(content, "\\'", "'")
	content = string.gsub(content, "\\\\", "\\")
	return content
end

function Signals.handle(signal: Types.Signal): Types.SignalResult
	local action = signal.action
	local data = signal.data or {}

	local dataKeys = {}
	for k in pairs(data) do
		table.insert(dataKeys, tostring(k))
	end

	print("[Overmind] ========== SIGNAL RECEIVED ==========")
	print("[Overmind] Signal ID:", signal.id)
	print("[Overmind] Action:", action)
	print("[Overmind] Data keys:", table.concat(dataKeys, ", "))

	if data.args then
		print("[Overmind] Found nested args, extracting...")
		data = data.args
	end

	if data.path then
		print("[Overmind] Path:", data.path)
	end
	if data.content then
		print("[Overmind] Content length:", #tostring(data.content))
	end

	local result: Types.SignalResult = {
		id = signal.id,
		success = false,
		data = nil,
		error = nil,
	}

	Log.trace(`Handling signal: {action}`)

	local success, err = pcall(function()
		if action == "create_file" then
			result = Signals.createFile(signal.id, data)
		elseif action == "update_file" or action == "edit_file" then
			result = Signals.updateFile(signal.id, data)
		elseif action == "delete_file" then
			result = Signals.deleteFile(signal.id, data)
		elseif action == "read_file" then
			result = Signals.readFile(signal.id, data)
		elseif action == "create_script" then
			result = Signals.createScript(signal.id, data)
		elseif action == "update_script" then
			result = Signals.updateScript(signal.id, data)
		elseif action == "delete_script" then
			result = Signals.deleteScript(signal.id, data)
		elseif action == "create_object" or action == "create_instance" then
			result = Signals.createObject(signal.id, data)
		elseif action == "update_object" or action == "update_instance" then
			result = Signals.updateObject(signal.id, data)
		elseif action == "delete_object" or action == "delete_instance" then
			result = Signals.deleteObject(signal.id, data)
		elseif action == "move_object" or action == "move_instance" then
			result = Signals.moveObject(signal.id, data)
		elseif action == "clone_object" or action == "clone_instance" then
			result = Signals.cloneObject(signal.id, data)
		elseif action == "search" or action == "find" then
			result = Signals.search(signal.id, data)
		elseif action == "query_search" then
			result = Signals.querySearch(signal.id, data)
		elseif action == "grep_search" or action == "grep" then
			result = Signals.grepSearch(signal.id, data)
		elseif action == "run_script" or action == "execute" or action == "run" then
			result = Signals.runScript(signal.id, data)
		elseif action == "get_selection" then
			result = Signals.getSelection(signal.id)
		elseif action == "set_selection" then
			result = Signals.setSelection(signal.id, data)
		elseif action == "notify" or action == "message" then
			result = Signals.notify(signal.id, data)
		else
			result.error = `Unknown action: {action}`
		end
	end)

	if not success then
		result.success = false
		result.error = tostring(err)
		Log.warn(`Signal handler error for {action}:`, err)
	end

	return result
end

function Signals.createFile(id: string, data: { [string]: any }): Types.SignalResult
	local path = data.path
	local content = data.content or ""

	print("[Overmind] createFile called with path:", path)

	if not path then
		return { id = id, success = false, error = "Missing path" }
	end

	local parent, fileName = findOrCreatePath(path)
	print("[Overmind] parent:", parent, "fileName:", fileName)

	if not parent then
		return { id = id, success = false, error = fileName }
	end

	local cleanName = cleanScriptName(fileName)
	print("[Overmind] cleanName:", cleanName)

	local existing = parent:FindFirstChild(cleanName)
	if existing then
		return { id = id, success = false, error = `File already exists: {fileName}` }
	end

	local scriptType = getScriptTypeFromName(fileName)
	print("[Overmind] scriptType:", scriptType)

	local scriptClass = scriptType == "LocalScript" and "LocalScript"
		or scriptType == "Script" and "Script"
		or "ModuleScript"

	local newScript = Instance.new(scriptClass)
	newScript.Name = cleanName
	newScript.Source = cleanContent(content)
	newScript.Parent = parent

	print("[Overmind] Created script:", newScript.Name, "in", parent:GetFullName())

	createRecording(`Created {cleanName}`)

	return {
		id = id,
		success = true,
		data = {
			path = getInstancePath(newScript),
			name = cleanName,
			scriptType = scriptType,
		},
	}
end

function Signals.updateFile(id: string, data: { [string]: any }): Types.SignalResult
	local path = data.path
	local content = data.content

	if not path then
		return { id = id, success = false, error = "Missing path" }
	end

	local parent, fileName = findOrCreatePath(path)
	if not parent then
		return { id = id, success = false, error = fileName }
	end

	local cleanName = cleanScriptName(fileName)
	local instance = parent:FindFirstChild(cleanName)

	if not instance then
		instance = findInstance(path)
	end

	if not instance then
		return { id = id, success = false, error = `File not found: {path}` }
	end

	if not instance:IsA("LuaSourceContainer") then
		return { id = id, success = false, error = `Not a script: {path}` }
	end

	local script = instance :: LuaSourceContainer

	if content then
		local cleanSource = cleanContent(content)
		local doc = ScriptEditorService:FindScriptDocument(script)
		if doc then
			local lineCount = doc:GetLineCount()
			doc:EditTextAsync(cleanSource, 1, 1, lineCount, #(doc:GetLine(lineCount)))
		else
			script.Source = cleanSource
		end
	end

	createRecording(`Updated {script.Name}`)

	return { id = id, success = true, data = { path = getInstancePath(script), name = script.Name } }
end

function Signals.deleteFile(id: string, data: { [string]: any }): Types.SignalResult
	local path = data.path

	if not path then
		return { id = id, success = false, error = "Missing path" }
	end

	local parent, fileName = findOrCreatePath(path)
	if parent then
		local cleanName = cleanScriptName(fileName)
		local instance = parent:FindFirstChild(cleanName)
		if instance then
			local name = instance.Name
			instance:Destroy()
			createRecording(`Deleted {name}`)
			return { id = id, success = true, data = { deleted = path } }
		end
	end

	local instance = findInstance(path)
	if not instance then
		return { id = id, success = false, error = `File not found: {path}` }
	end

	local name = instance.Name
	instance:Destroy()

	createRecording(`Deleted {name}`)

	return { id = id, success = true, data = { deleted = path } }
end

function Signals.readFile(id: string, data: { [string]: any }): Types.SignalResult
	local path = data.path

	if not path then
		return { id = id, success = false, error = "Missing path" }
	end

	local instance = findInstance(path)

	if not instance then
		local parent, fileName = findOrCreatePath(path)
		if parent then
			local cleanName = cleanScriptName(fileName)
			instance = parent:FindFirstChild(cleanName)
		end
	end

	if not instance then
		return { id = id, success = false, error = `File not found: {path}` }
	end

	if not instance:IsA("LuaSourceContainer") then
		return { id = id, success = false, error = `Not a script: {path}` }
	end

	local script = instance :: LuaSourceContainer

	return {
		id = id,
		success = true,
		data = {
			path = getInstancePath(script),
			name = script.Name,
			content = script.Source,
			className = script.ClassName,
		},
	}
end

function Signals.createScript(id: string, data: { [string]: any }): Types.SignalResult
	if data.path then
		return Signals.createFile(id, data)
	end
	local parentPath = data.parent or "ServerScriptService"
	local name = data.name or "NewScript"
	local scriptType = data.scriptType or "Script"
	local source = data.source or data.content or ""

	local parent = findInstance(parentPath)
	if not parent then
		return { id = id, success = false, error = `Parent not found: {parentPath}` }
	end

	local scriptClass = scriptType == "LocalScript" and "LocalScript"
		or scriptType == "ModuleScript" and "ModuleScript"
		or "Script"

	local newScript = Instance.new(scriptClass)
	newScript.Name = name
	newScript.Source = cleanContent(source)
	newScript.Parent = parent

	createRecording(`Created {name}`)

	return {
		id = id,
		success = true,
		data = { path = getInstancePath(newScript) },
	}
end

function Signals.updateScript(id: string, data: { [string]: any }): Types.SignalResult
	local path = data.path
	local source = data.source or data.content

	if not path or not source then
		return { id = id, success = false, error = "Missing path or source" }
	end

	local instance = findInstance(path)
	if not instance then
		return { id = id, success = false, error = `Script not found: {path}` }
	end

	if not instance:IsA("LuaSourceContainer") then
		return { id = id, success = false, error = `Not a script: {path}` }
	end

	local script = instance :: LuaSourceContainer

	local doc = ScriptEditorService:FindScriptDocument(script)
	if doc then
		local lineCount = doc:GetLineCount()
		doc:EditTextAsync(source, 1, 1, lineCount, #(doc:GetLine(lineCount)))
	else
		script.Source = source
	end

	createRecording(`Updated {script.Name}`)

	return { id = id, success = true, data = { path = path } }
end

function Signals.deleteScript(id: string, data: { [string]: any }): Types.SignalResult
	local path = data.path

	if not path then
		return { id = id, success = false, error = "Missing path" }
	end

	local instance = findInstance(path)
	if not instance then
		return { id = id, success = false, error = `Script not found: {path}` }
	end

	local name = instance.Name
	instance:Destroy()

	createRecording(`Deleted {name}`)

	return { id = id, success = true, data = { deleted = path } }
end

function Signals.createObject(id: string, data: { [string]: any }): Types.SignalResult
	local parentPath = data.parent or "Workspace"
	local className = data.className or data.class or "Part"
	local name = data.name or className
	local properties = data.properties or {}

	local parent = findInstance(parentPath)
	if not parent then
		return { id = id, success = false, error = `Parent not found: {parentPath}` }
	end

	local newInstance = Instance.new(className)
	newInstance.Name = name

	for prop, value in properties do
		pcall(function()
			(newInstance :: any)[prop] = value
		end)
	end

	newInstance.Parent = parent

	createRecording(`Created {name}`)

	return {
		id = id,
		success = true,
		data = { path = getInstancePath(newInstance) },
	}
end

function Signals.updateObject(id: string, data: { [string]: any }): Types.SignalResult
	local path = data.path
	local properties = data.properties or {}

	if not path then
		return { id = id, success = false, error = "Missing path" }
	end

	local instance = findInstance(path)
	if not instance then
		return { id = id, success = false, error = `Object not found: {path}` }
	end

	for prop, value in properties do
		pcall(function()
			(instance :: any)[prop] = value
		end)
	end

	createRecording(`Updated {instance.Name}`)

	return { id = id, success = true, data = { path = path } }
end

function Signals.deleteObject(id: string, data: { [string]: any }): Types.SignalResult
	local path = data.path

	if not path then
		return { id = id, success = false, error = "Missing path" }
	end

	local instance = findInstance(path)
	if not instance then
		return { id = id, success = false, error = `Object not found: {path}` }
	end

	local name = instance.Name
	instance:Destroy()

	createRecording(`Deleted {name}`)

	return { id = id, success = true, data = { deleted = path } }
end

function Signals.moveObject(id: string, data: { [string]: any }): Types.SignalResult
	local path = data.path
	local newParentPath = data.newParent or data.destination

	if not path or not newParentPath then
		return { id = id, success = false, error = "Missing path or newParent" }
	end

	local instance = findInstance(path)
	if not instance then
		return { id = id, success = false, error = `Object not found: {path}` }
	end

	local newParent = findInstance(newParentPath)
	if not newParent then
		return { id = id, success = false, error = `New parent not found: {newParentPath}` }
	end

	instance.Parent = newParent

	createRecording(`Moved {instance.Name}`)

	return {
		id = id,
		success = true,
		data = { path = getInstancePath(instance) },
	}
end

function Signals.cloneObject(id: string, data: { [string]: any }): Types.SignalResult
	local path = data.path
	local newParentPath = data.newParent or data.destination

	if not path then
		return { id = id, success = false, error = "Missing path" }
	end

	local instance = findInstance(path)
	if not instance then
		return { id = id, success = false, error = `Object not found: {path}` }
	end

	local clone = instance:Clone()

	if newParentPath then
		local newParent = findInstance(newParentPath)
		if newParent then
			clone.Parent = newParent
		else
			clone.Parent = instance.Parent
		end
	else
		clone.Parent = instance.Parent
	end

	createRecording(`Cloned {instance.Name}`)

	return {
		id = id,
		success = true,
		data = { path = getInstancePath(clone) },
	}
end

function Signals.search(id: string, data: { [string]: any }): Types.SignalResult
	local query = data.query or data.name or ""
	local scope = data.scope or "game"
	local maxResults = data.maxResults or data.limit or 50

	local root = scope == "workspace" and game.Workspace
		or scope == "serverscriptservice" and game:GetService("ServerScriptService")
		or scope == "replicatedstorage" and game:GetService("ReplicatedStorage")
		or scope == "starterplayer" and game:GetService("StarterPlayer")
		or game

	local results = {}

	local function searchRecursive(instance: Instance)
		if #results >= maxResults then
			return
		end

		if string.find(string.lower(instance.Name), string.lower(query)) then
			table.insert(results, {
				name = instance.Name,
				className = instance.ClassName,
				path = getInstancePath(instance),
			})
		end

		for _, child in instance:GetChildren() do
			searchRecursive(child)
		end
	end

	searchRecursive(root)

	return {
		id = id,
		success = true,
		data = { results = results, count = #results },
	}
end

function Signals.querySearch(id: string, data: { [string]: any }): Types.SignalResult
	local className = data.className or data.class
	local scope = data.scope or "game"
	local maxResults = data.maxResults or data.limit or 50

	local root = scope == "workspace" and game.Workspace
		or scope == "serverscriptservice" and game:GetService("ServerScriptService")
		or scope == "replicatedstorage" and game:GetService("ReplicatedStorage")
		or game

	local results = {}

	if className then
		for _, instance in root:GetDescendants() do
			if #results >= maxResults then
				break
			end
			if instance.ClassName == className then
				table.insert(results, {
					name = instance.Name,
					className = instance.ClassName,
					path = getInstancePath(instance),
				})
			end
		end
	end

	return {
		id = id,
		success = true,
		data = { results = results, count = #results },
	}
end

function Signals.grepSearch(id: string, data: { [string]: any }): Types.SignalResult
	local pattern = data.pattern or data.query or ""
	local scope = data.scope or "game"
	local maxResults = data.maxResults or data.limit or 50

	local root = scope == "workspace" and game.Workspace
		or scope == "serverscriptservice" and game:GetService("ServerScriptService")
		or scope == "replicatedstorage" and game:GetService("ReplicatedStorage")
		or game

	local results = {}

	for _, instance in root:GetDescendants() do
		if #results >= maxResults then
			break
		end

		if instance:IsA("LuaSourceContainer") then
			local script = instance :: LuaSourceContainer
			local source = script.Source

			local lineNum = 0
			for line in string.gmatch(source, "[^\n]+") do
				lineNum += 1
				if string.find(line, pattern, 1, true) then
					table.insert(results, {
						path = getInstancePath(instance),
						line = lineNum,
						content = line,
					})
				end
			end
		end
	end

	return {
		id = id,
		success = true,
		data = { results = results, count = #results },
	}
end

function Signals.runScript(id: string, data: { [string]: any }): Types.SignalResult
	local code = data.code or data.content

	if not code then
		return { id = id, success = false, error = "Missing code" }
	end

	local fn, compileErr = loadstring(code)
	if not fn then
		return { id = id, success = false, error = `Compile error: {compileErr}` }
	end

	local success, result = pcall(fn)
	if not success then
		return { id = id, success = false, error = `Runtime error: {result}` }
	end

	return {
		id = id,
		success = true,
		data = { result = tostring(result) },
	}
end

function Signals.getSelection(id: string): Types.SignalResult
	local selection = Selection:Get()
	local paths = {}

	for _, instance in selection do
		table.insert(paths, {
			name = instance.Name,
			className = instance.ClassName,
			path = getInstancePath(instance),
		})
	end

	return {
		id = id,
		success = true,
		data = { selection = paths, count = #paths },
	}
end

function Signals.setSelection(id: string, data: { [string]: any }): Types.SignalResult
	local paths = data.paths or {}
	local instances = {}

	for _, path in paths do
		local instance = findInstance(path)
		if instance then
			table.insert(instances, instance)
		end
	end

	Selection:Set(instances)

	return {
		id = id,
		success = true,
		data = { selected = #instances },
	}
end

function Signals.notify(id: string, data: { [string]: any }): Types.SignalResult
	local message = data.message or ""
	local notifyType = data.type or "info"

	if notifyType == "warn" then
		warn("[Overmind]", message)
	elseif notifyType == "error" then
		warn("[Overmind Error]", message)
	else
		print("[Overmind]", message)
	end

	return { id = id, success = true, data = {} }
end

return Signals
