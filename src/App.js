import React, { useEffect, useState } from "react";
import {
  LogoutButton,
  Text,
  useSession,
  CombinedDataProvider,
} from "@inrupt/solid-ui-react";
import { getSolidDataset, getUrlAll, getThing } from "@inrupt/solid-client";
import AddTodo from "./components/AddTodo";
import TodoList from "./components/TodoList";
import ProfilePage from "./components/ProfilePage";
import LoginPage from "./components/LoginPage";
import { getOrCreateTodoList } from "./utils";

const STORAGE_PREDICATE = "http://www.w3.org/ns/pim/space#storage";

function App() {
  const { session } = useSession();
  const [todoList, setTodoList] = useState();
  const [currentView, setCurrentView] = useState("todos"); // "todos" or "profile"

  useEffect(() => {
    if (!session || !session.info.isLoggedIn) return;
    (async () => {
      const profileDataset = await getSolidDataset(session.info.webId, {
        fetch: session.fetch,
      });
      const profileThing = getThing(profileDataset, session.info.webId);
      const podsUrls = getUrlAll(profileThing, STORAGE_PREDICATE);
      const pod = podsUrls[0];
      const containerUri = `${pod}todos/`;
      const list = await getOrCreateTodoList(containerUri, session.fetch);
      setTodoList(list);
    })();
  }, [session, session.info.isLoggedIn]);

  // Navigation handler
  const handleNavigation = (view) => {
    setCurrentView(view);
  };

  // If not logged in, show the enhanced login page
  if (!session.info.isLoggedIn) {
    return (
      <div className="mx-auto my-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg overflow-hidden">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Solid Todo App
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Manage your tasks securely with data ownership
            </p>
          </div>
          <LoginPage />
        </div>
      </div>
    );
  }

  // When logged in, show the app with navigation
  return (
    <div className="max-w-4xl mx-auto my-8 p-6 bg-white rounded-lg shadow-lg">
      <CombinedDataProvider
        datasetUrl={session.info.webId}
        thingUrl={session.info.webId}
      >
        <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-medium mr-2">You are logged in as: </span>
            <Text
              properties={[
                "http://xmlns.com/foaf/0.1/name",
                "http://www.w3.org/2006/vcard/ns#fn",
              ]}
              className="font-semibold"
            />
          </div>
          <LogoutButton className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors" />
        </div>
        
        {/* Navigation tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => handleNavigation('todos')}
              className={`py-3 px-1 ${
                currentView === 'todos'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Todo List
            </button>
            <button
              onClick={() => handleNavigation('profile')}
              className={`py-3 px-1 ${
                currentView === 'profile'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Profile
            </button>
          </nav>
        </div>
        
        {/* Content based on selected view */}
        {currentView === 'todos' ? (
          <section>
            <AddTodo todoList={todoList} setTodoList={setTodoList} />
            <TodoList todoList={todoList} setTodoList={setTodoList} />
          </section>
        ) : (
          <ProfilePage />
        )}
      </CombinedDataProvider>
    </div>
  );
}

export default App;