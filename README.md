# Solid To-Do App

A decentralized to-do application built using Solid, allowing users to manage tasks while maintaining control over their data. This project serves as a learning experience to explore Solid's ecosystem, including `solid-client` and `solid-ui-react`.

## Features
- User authentication with Solid Pods
- Add, edit, and delete to-do items
- Mark to-dos as completed
- Store and retrieve to-do data from the user's Solid Pod

## Prerequisites
- Basic knowledge of React
- A Solid Pod (can be created during the authentication process)

## Getting Started

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Mbalhakim/solid-todo-app
   cd solid-todo-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Available Scripts
In the project directory, you can run:

#### `npm start`
Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
The page will reload when you make changes, and you may see lint errors in the console.

#### `npm run build`
Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

#### `npm test`
Launches the test runner in interactive watch mode.

### Authentication
Users can log in using their Solid identity provider and choose where their data is stored.

## Libraries Used
- `@inrupt/solid-client` – To read and write data in Solid Pods
- `@inrupt/solid-ui-react` – UI components for interacting with Solid data

## Next Steps
- Improve UI/UX
- Implement categories for tasks
- Add sharing functionality to collaborate on to-do lists

## Resources
- [Solid UI React Docs](https://docs.inrupt.com/developer-tools/javascript/solid-ui-react/)
- [Solid Client Libraries Docs](https://docs.inrupt.com/developer-tools/javascript/client-libraries/)
- [Solid Community Forum](https://forum.solidproject.org/)

## License
This project is licensed under the MIT License.

