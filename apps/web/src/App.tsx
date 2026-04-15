import { Button } from "./components/ui/button";

function App() {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center">
			<h1 className="text-gray-500 text-lg">Time Task</h1>
			<Button className="cursor-pointer">New Task</Button>
		</div>
	);
}

export default App;
