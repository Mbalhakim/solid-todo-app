import {
    addDatetime,
    addStringNoLocale,
    createThing,
    getSolidDataset,
    getSourceUrl,
    getThing,
    getUrlAll,
    saveSolidDatasetAt,
    setThing,
    addUrl,
  } from "@inrupt/solid-client";
  import { useSession } from "@inrupt/solid-ui-react";
  import React, { useEffect, useState } from "react";
  import { getOrCreateTodoList } from "../../utils";
  
  const STORAGE_PREDICATE = "http://www.w3.org/ns/pim/space#storage";
  const TEXT_PREDICATE = "http://schema.org/text";
  const CREATED_PREDICATE = "http://www.w3.org/2002/12/cal/ical#created";
  const TODO_CLASS = "http://www.w3.org/2002/12/cal/ical#Vtodo";
  const TYPE_PREDICATE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
  
  function AddTodo() {
    const { session } = useSession();
    const [todoList, setTodoList] = useState();
    const [todoText, setTodoText] = useState("");
  
    useEffect(() => {
      if (!session.info.isLoggedIn || !session.info.webId) return;
  
      (async () => {
        try {
          // Fetch profile dataset
          const profileDataset = await getSolidDataset(session.info.webId, {
            fetch: session.fetch,
          });
  
          const profileThing = getThing(profileDataset, session.info.webId);
          const podsUrls = getUrlAll(profileThing, STORAGE_PREDICATE);
  
          if (!podsUrls.length) {
            console.error("No Solid Pod found for this user.");
            return;
          }
  
          const pod = podsUrls[0]; // Assuming first pod
          const containerUri = `${pod}todos/`;
  
          const list = await getOrCreateTodoList(containerUri, session.fetch);
          setTodoList(list);
        } catch (error) {
          console.error("Error fetching Solid Pod storage:", error);
        }
      })();
    }, [session]);
  
    const addTodo = async (text) => {
      if (!todoList) return;
  
      try {
        const indexUrl = getSourceUrl(todoList);
        const todoWithText = addStringNoLocale(createThing(), TEXT_PREDICATE, text);
        const todoWithDate = addDatetime(todoWithText, CREATED_PREDICATE, new Date());
        const todoWithType = addUrl(todoWithDate, TYPE_PREDICATE, TODO_CLASS);
        const updatedTodoList = setThing(todoList, todoWithType);
  
        const updatedDataset = await saveSolidDatasetAt(indexUrl, updatedTodoList, {
          fetch: session.fetch,
        });
  
        setTodoList(updatedDataset);
      } catch (error) {
        console.error("Error adding to-do:", error);
      }
    };
  
    const handleSubmit = async (event) => {
      event.preventDefault();
      if (todoText.trim()) {
        await addTodo(todoText);
        setTodoText(""); // Clear input field
      }
    };
  
    const handleChange = (e) => {
      setTodoText(e.target.value);
    };
  
    return (
        <>
          <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
            <label htmlFor="todo-input" className="flex-1">
              <input
                id="todo-input"
                type="text"
                value={todoText}
                onChange={handleChange}
                placeholder="Enter a new to-do"
                className="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
              />
            </label>
            <button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md font-semibold transition-colors"
            >
              Add Todo
            </button>
          </form>
        </>
      );
    }
  
  export default AddTodo;
  