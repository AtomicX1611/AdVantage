import { MongoClient } from "mongodb";
// Notice the new import path below
import { OllamaEmbeddings } from "@langchain/ollama";

const uri = "mongodb://test:Test@ac-givou8z-shard-00-00.wpeshpm.mongodb.net:27017,ac-givou8z-shard-00-01.wpeshpm.mongodb.net:27017,ac-givou8z-shard-00-02.wpeshpm.mongodb.net:27017/?ssl=true&replicaSet=atlas-drci19-shard-0&authSource=admin&appName=Cluster0";

const embeddings = new OllamaEmbeddings({
    model: "llama3.1:8b",
    baseUrl: "http://localhost:11434",
});

async function seedDatabase() {
  const client = new MongoClient(uri);

  const myMovies = [
    { title: "Cyber Core", plot: "A rogue AI takes over the global financial system, forcing a hacker to upload his mind to stop it." },
    { title: "The Last Oasis", plot: "In a desert wasteland, a group of survivors search for a mythical city that still has water." },
    { title: "Laughing Gas", plot: "A stand-up comedian accidentally inhales a chemical that makes him physically incapable of telling a bad joke." }
  ];

  try {
    await client.connect();
    // We are creating a NEW collection for your local 4096-dimension vectors
    const collection = client.db("sample_mflix").collection("llama_movies");

    console.log("🧠 Sending plots to local Llama 3.1 for embedding...");

    for (const movie of myMovies) {
        // This generates the 4096 dimensions
        const vector = await embeddings.embedQuery(movie.plot);
        movie.embedding = vector;
        console.log(`✅ Embedded: ${movie.title}`);
    }

    console.log("\n💾 Saving to MongoDB Atlas...");
    const result = await collection.insertMany(myMovies);
    console.log(`🎉 Success! Inserted ${result.insertedCount} movies into 'llama_movies'.`);

  } catch (error) {
      console.error("Insertion Failed:", error);
  } finally {
    await client.close();
  }
}

seedDatabase();