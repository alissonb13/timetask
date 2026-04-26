import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GroupProvider } from "./contexts/group-context.tsx";
import { TaskProvider } from "./contexts/task-context.tsx";

const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error("Root element not found");
}

createRoot(rootElement).render(
	<StrictMode>
		<TaskProvider>
			<GroupProvider>
				<App />
			</GroupProvider>
		</TaskProvider>
	</StrictMode>,
);
