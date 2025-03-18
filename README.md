# Solid Todo App

A modern, decentralized todo application built using React and [Solid](https://solidproject.org/) - the web decentralization project focused on true data ownership.

**Live Demo:** [https://mbalhakim.github.io/solid-todo-app/](https://mbalhakim.github.io/solid-todo-app/)

## 🌟 Features

- **User authentication** with multiple Solid identity providers
- **Complete data ownership** - Your todo data is stored in your personal Solid Pod, not on our servers
- **Add, edit, and delete to-do items** with real-time updates to your Pod
- **Mark to-dos as completed** with status tracking
- **Profile management** - View and manage your Solid profile information
- **Modern UI** built with Tailwind CSS for a responsive, clean interface

## What is Solid?

Solid (Social Linked Data) is a web decentralization project led by Sir Tim Berners-Lee, the inventor of the World Wide Web. It aims to radically change the way web applications work, giving users control over their data.

In this Todo app:
- Your data is stored in your personal Solid Pod, not in a centralized database
- You explicitly grant and revoke access to your data
- Your data can be reused across different applications

##  What Makes This Project Special

1. **True Data Ownership** - Unlike traditional todo apps that store your data on their servers, your todo items are stored in your personal Solid Pod.
2. **Decentralized Authentication** - We use Solid OIDC authentication, allowing you to login with any Solid identity provider.
3. **Profile Integration** - We've built a comprehensive profile view that displays your Solid Pod information, demonstrating the power of having your identity data under your control.
4. **Modern Development Practices** - The project uses React with hooks, custom components, and modern JavaScript features.

## 🛠️ Technologies Used

-   **React** - Frontend framework
-   **Solid Libraries:**
    -   `@inrupt/solid-client` - To read and write data in Solid Pods
    -   `@inrupt/solid-ui-react` - UI components for Solid integration
-   **Tailwind CSS** - Utility-first CSS framework for styling
-   **GitHub Pages** - For hosting the live demo

## 📝 Key Implementation Details

-   **Solid Authentication Flow** - Implements the Solid OIDC authentication flow
-   **Data Storage** - Uses `@inrupt/solid-client` to read from and write to Solid Pods
-   **Dynamic Provider Selection** - UI for selecting different Solid providers
-   **Profile Data Extraction** - Reading various RDF predicates from a Solid profile
-   **Responsive Design** - Layouts that work across devices
## Prerequisites

- Basic knowledge of React
- A Solid Pod Account (you can create one at [solidweb.org](https://solidweb.org), [pod.inrupt.com](https://pod.inrupt.com/), or [solidcommunity.net](https://solidcommunity.net/))

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

## Resources

-   [Solid Project](https://solidproject.org)
-   [Solid UI React Docs](https://www.npmjs.com/package/@inrupt/solid-ui-react)
-   [Solid Client Libraries Docs](https://www.npmjs.com/package/@inrupt/solid-client)
-   [Solid Community Forum](https://forum.solidproject.org/)

## License

This project is licensed under the MIT License.
