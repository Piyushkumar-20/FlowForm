
import { api } from "~/trpc/server";


export default async function Home() {
  const {message} = await api.chai.query({email: "piyush@gmail.com"});
  
  return (
    <main className="min-h-screen min-w-screen flex justify-center items-center">
      <div>
        <h1 className="text-3xl">Streamyst - Stream in Style</h1>
        <h2>Server Message: {message}</h2>
      </div>
    </main>
  );
}
