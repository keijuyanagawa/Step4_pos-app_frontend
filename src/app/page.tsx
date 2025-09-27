async function getData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  // ローカル開発では常にこのURLが使われる

  try {
	const res = await fetch(`${apiUrl}/api/pos`, { cache: 'no-store' });
	if (!res.ok) throw new Error("Failed to fetch data");
	return res.json();
  } catch (error) {
	console.error(error);
	return { message: "Error: Could not connect to the API." };
  }
}

export default async function Home() {
  const data = await getData();

  return (
	<main className="flex min-h-screen flex-col items-center justify-center p-24">
	  <div className="text-center">
		<h1 className="text-4xl font-bold mb-4">Welcome to Next.js POS App</h1>
		<div className="mt-8 p-6 border rounded-lg bg-gray-50">
		  <h2 className="text-2xl font-semibold">Data from FastAPI:</h2>
		  <pre className="mt-4 text-left bg-gray-100 p-4 rounded">
			<code>{JSON.stringify(data, null, 2)}</code>
		  </pre>
		</div>
	  </div>
	</main>
  )
}