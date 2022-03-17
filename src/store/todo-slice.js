import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const fetchTodos = createAsyncThunk(
	'todos/fetchTodos',
	async function (_, { rejectWithValue }) {
		try {
			const response = await fetch(
				'https://todo-hw-3e2f1-default-rtdb.firebaseio.com/todos.json',
			)

			if (!response.ok) {
				throw new Error('Server Error!')
			}

			const data = await response.json()
			const generatedData = []
			for (const key in data) {
				generatedData.push({
					id: key,
					title: data[key].title,
					complete: data[key].complete,
				})
			}

			return generatedData
		} catch (error) {
			return rejectWithValue(error.message)
		}
	},
)

export const deleteTodo = createAsyncThunk(
	'todos/deleteTodo',
	async function (id, { rejectWithValue, dispatch }) {
		try {
			const response = await fetch(
				`https://todo-hw-3e2f1-default-rtdb.firebaseio.com/todos/${id}.json`,
				{
					method: 'DELETE',
				},
			)

			if (!response.ok) {
				throw new Error("Can't delete task. Server error.")
			}

			dispatch(todoActions.removeTodo(id))
		} catch (error) {
			return rejectWithValue(error.message)
		}
	},
)

export const toggleStatus = createAsyncThunk(
	'todos/toggleStatus',
	async function (id, { rejectWithValue, dispatch, getState }) {
		const todo = getState().todo.todos.find((todo) => todo.id === id)
		try {
			const response = await fetch(
				`https://todo-hw-3e2f1-default-rtdb.firebaseio.com/todos/${id}.json`,
				{
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						complete: !todo.complete,
					}),
				},
			)

			if (!response.ok) {
				throw new Error("Can't toggle status. Server error.")
			}

			dispatch(todoActions.checkedTodo(id))
		} catch (error) {
			return rejectWithValue(error.message)
		}
	},
)

export const addNewTodo = createAsyncThunk(
	'todos/addNewTodo',
	async function (text, { rejectWithValue, dispatch }) {
		try {
			const todo = {
				title: text,
				completed: false,
				id: Math.random().toString(),
			}

			const response = await fetch(
				'https://todo-hw-3e2f1-default-rtdb.firebaseio.com/todos.json',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(todo),
				},
			)
			const data = await response.json()
			//  console.log(data.name);
			//  const generatedData  = []
			// for (const key in data) {
			//          generatedData.push({
			//         id : key,
			//         title : data[key].title,
			//         complete : data[key].complete
			//     })
			// }
			if (!response.ok) {
				throw new Error("Can't add task. Server error.")
			}

			dispatch(todoActions.addTodo(todo))
		} catch (error) {
			return rejectWithValue(error.message)
		}
	},
)

const setError = (state, action) => {
	state.status = 'rejected'
	state.error = action.payload
}

const initState = {
	todos: [],
	task: {},
	showEditModal: false,
	status: null,
	error: null,
}
const todoSlice = createSlice({
	name: 'todos',
	initialState: initState,
	reducers: {
		addTodo(state, action) {
			state.todos = [...state.todos, action.payload]
		},
		removeTodo(state, action) {
			state.todos = state.todos.filter((el) => el.id !== action.payload)
		},
		checkedTodo(state, action) {
			state.todos.forEach((el) =>
				el.id === action.payload ? (el.complete = !el.complete) : el,
			)
		},
		showEdit(state, action) {
			state.showEditModal = true
			state.task = action.payload
		},
		hideEdit(state) {
			state.showEditModal = false
		},
		editTodo(state, action) {
			console.log(action.payload.task)
			state.todos.forEach((el) =>
				el.id === action.payload.id
					? (el.title = action.payload.task)
					: el,
			)
			state.showEditModal = false
		},
	},
	extraReducers: {
		[fetchTodos.pending]: (state) => {
			state.status = 'loading'
			state.error = null
		},
		[fetchTodos.fulfilled]: (state, action) => {
			state.status = 'resolved'
			state.todos = action.payload
		},
		[fetchTodos.rejected]: setError,
		[deleteTodo.rejected]: setError,
		[toggleStatus.rejected]: setError,
	},
})
export const todoActions = todoSlice.actions
export default todoSlice
