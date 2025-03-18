import React, { useState } from 'react';
import { LoginButton } from "@inrupt/solid-ui-react";

// Authentication options
const authOptions = {
  clientName: "Solid Todo App",
};

// Provider-specific colors and configurations
const providers = {
  "https://solidweb.org": {
    name: "SolidWeb",
    colors: "from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800",
    icon: "🌐",
  },
  "https://inrupt.net": {
    name: "Inrupt",
    colors: "from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800",
    icon: "🔒",
  },
  "https://solidcommunity.net": {
    name: "Solid Community",
    colors: "from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800",
    icon: "👥",
  }
};

function LoginPage() {
  const [selectedProvider, setSelectedProvider] = useState("https://solidweb.org");

  const handleProviderChange = (e) => {
    setSelectedProvider(e.target.value);
  };

  const providerConfig = providers[selectedProvider];

  return (
    <div className="min-h-[70vh] flex flex-col md:flex-row items-center justify-center p-4 md:p-0">
      {/* Left side - Illustrations and intro */}
      <div className="w-full md:w-1/2 mb-8 md:mb-0 p-4 md:p-8 flex flex-col items-center md:items-start text-center md:text-left">
        <div className="mb-6 transform transition-transform hover:scale-105 duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Welcome to <span className="text-blue-600">Solid Todo</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-md mb-8">
          Manage your tasks with complete ownership and privacy using your personal data pod.
        </p>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md mb-8 w-full max-w-md shadow-sm">
          <h3 className="font-medium text-blue-800 mb-2">What is Solid?</h3>
          <p className="text-blue-700 text-sm">
            Solid is an open specification that lets people store their data securely in decentralized data stores called Pods. 
            You control access to your data and choose which apps can use it.
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 transform transition-all hover:shadow-xl duration-300">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign In</h2>
            <p className="text-gray-600">Access your tasks with your Solid identity</p>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="provider">
              Select your identity provider
            </label>
            <div className="relative">
              <select 
                id="provider" 
                className="block appearance-none w-full bg-gray-50 border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                value={selectedProvider}
                onChange={handleProviderChange}
              >
                {Object.keys(providers).map(key => (
                  <option key={key} value={key}>{providers[key].name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <LoginButton
              oidcIssuer={selectedProvider}
              redirectUrl={window.location.href}
              authOptions={authOptions}
              className={`w-full bg-gradient-to-r ${providerConfig.colors} text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg transition-all duration-300 flex justify-center items-center`}
            >
              <span className="mr-2 text-lg">{providerConfig.icon}</span>
              <span>Login with {providerConfig.name}</span>
            </LoginButton>
          </div>
          
          <div className="mt-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-sm text-gray-500">or try these</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>
          
          <div className="mt-6 grid grid-cols-3 gap-3">
            {Object.keys(providers).map(key => (
              <LoginButton
                key={key}
                oidcIssuer={key}
                redirectUrl={window.location.href}
                authOptions={authOptions}
                className={`w-full bg-gradient-to-r ${providers[key].colors} text-white font-medium py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 shadow-sm hover:shadow transition-all duration-300 flex flex-col justify-center items-center text-xs`}
              >
                <span className="text-lg mb-1">{providers[key].icon}</span>
                <span>{providers[key].name}</span>
              </LoginButton>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Don't have a Solid identity yet?
            </p>
            <a 
              href="https://solidproject.org/users/get-a-pod" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
            >
              Get a free Solid Pod
            </a>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            This application respects your privacy and only accesses the data you authorize.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;