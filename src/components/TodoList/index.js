import {
    addDatetime,
    getDatetime,
    getSourceUrl,
    getThingAll,
    getStringNoLocale,
    getUrl,
    removeDatetime,
    removeThing,
    saveSolidDatasetAt,
    setThing,
  } from "@inrupt/solid-client";
  import { useSession } from "@inrupt/solid-ui-react";
  import React from "react";
  
  const TEXT_PREDICATE = "http://schema.org/text";
  const CREATED_PREDICATE = "http://www.w3.org/2002/12/cal/ical#created";
  const COMPLETED_PREDICATE = "http://www.w3.org/2002/12/cal/ical#completed";
  
  function TodoList({ todoList, setTodoList }) {
    const todoThings = todoList ? getThingAll(todoList) : [];
    todoThings.sort((a, b) => {
      return (
        getDatetime(a, CREATED_PREDICATE) - getDatetime(b, CREATED_PREDICATE)
      );
    });
  
    const { fetch } = useSession();
  
    const handleCheck = async (todo, checked) => {
      const todosUrl = getSourceUrl(todoList);
      let updatedTodos;
      if (!checked) {
        const date = new Date();
        const doneTodo = addDatetime(todo, COMPLETED_PREDICATE, date);
        updatedTodos = setThing(todoList, doneTodo);
      } else {
        const date = getDatetime(todo, COMPLETED_PREDICATE);
        const undoneTodo = removeDatetime(todo, COMPLETED_PREDICATE, date);
        updatedTodos = setThing(todoList, undoneTodo);
      }
      const updatedList = await saveSolidDatasetAt(todosUrl, updatedTodos, {
        fetch,
      });
      setTodoList(updatedList);
    };
  
    const deleteTodo = async (todo) => {
      const todosUrl = getSourceUrl(todoList);
      const updatedTodos = removeThing(todoList, todo);
      const updatedDataset = await saveSolidDatasetAt(todosUrl, updatedTodos, {
        fetch,
      });
      setTodoList(updatedDataset);
    };
  
    const todos = todoThings.map((thing) => ({
      text: getStringNoLocale(thing, TEXT_PREDICATE),
      created: getDatetime(thing, CREATED_PREDICATE),
      completed: getDatetime(thing, COMPLETED_PREDICATE),
      thing,
    }));
  
    if (!todos.length) {
      return <p>Your to-do list is empty.</p>;
    }
  
    
  if (!todos.length) {
    return <p className="text-gray-500 italic mt-4">Your to-do list is empty.</p>;
  }

  return (
    <div className="mt-6">
      <span className="block mb-3 font-medium text-gray-600">
        Your to-do list has {todos.length} items
      </span>
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                To Do
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Done
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {todos.map((todo, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {todo.text || "No description"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {todo.created ? new Date(todo.created).toLocaleString() : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={!!todo.completed}
                      onChange={() => handleCheck(todo.thing, !!todo.completed)}
                      className="rounded text-blue-600 focus:ring-blue-500 h-5 w-5"
                    />
                  </label>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => deleteTodo(todo.thing)}
                    className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
  export default TodoList;