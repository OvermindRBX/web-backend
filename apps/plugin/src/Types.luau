--!strict

export type SignalAction =
	"create_file"
	| "update_file"
	| "delete_file"
	| "read_file"
	| "create_script"
	| "update_script"
	| "delete_script"
	| "create_object"
	| "update_object"
	| "delete_object"
	| "move_object"
	| "clone_object"
	| "search"
	| "query_search"
	| "grep_search"
	| "run_script"
	| "notify"
	| "get_selection"
	| "set_selection"
	| string

export type Signal = {
	id: string,
	action: string,
	data: { [string]: any }?,
}

export type SignalResult = {
	id: string,
	success: boolean,
	data: { [string]: any }?,
	error: string?,
}

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error"

export type Project = {
	id: string,
	name: string,
	userId: string,
}

export type Message = {
	id: string,
	role: "user" | "assistant",
	content: string,
}

return nil
