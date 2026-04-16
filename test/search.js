import { MongoClient } from "mongodb";
import { OllamaEmbeddings } from "@langchain/ollama";

// 1. Connection Details
const uri = "mongodb://test:Test@ac-givou8z-shard-00-00.wpeshpm.mongodb.net:27017,ac-givou8z-shard-00-01.wpeshpm.mongodb.net:27017,ac-givou8z-shard-00-02.wpeshpm.mongodb.net:27017/?ssl=true&replicaSet=atlas-drci19-shard-0&authSource=admin&appName=Cluster0";

const embeddings = new OllamaEmbeddings({
    model: "llama3.1:8b",
    baseUrl: "http://localhost:11434",
});

async function runSearch(queryText) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("sample_mflix");
    const collection = db.collection("llama_movies");

    console.log(`\n🧠 Local Llama is processing your query: "${queryText}"`);
    
    // 2. Convert search text to a 4096-dim vector
    const queryVector = await embeddings.embedQuery(queryText);

    // 3. The Vector Search Pipeline
    const pipeline = [
      {
        "$vectorSearch": {
          "index": "vector_index",      // The name of the index you created in Atlas
          "path": "embedding",         // The field where we stored the 4096-dim arrays
          "queryVector": queryVector,
          "numCandidates": 10,         // Search depth
          "limit": 2                   // How many results to return
        }
      },
      {
        "$project": {
          "_id": 0,
          "title": 1,
          "plot": 1,
          "score": { "$meta": "vectorSearchScore" } // 1.0 is a perfect match
        }
      }
    ];

    console.log("⚡ Fetching matches from Atlas...");
    const results = await collection.aggregate(pipeline).toArray();

    console.log("\n--- Top Results ---");
    if (results.length === 0) {
        console.log("No matches found. Check if your index is 'Active' in Atlas.");
    }

    results.forEach((res, i) => {
      console.log(`${i + 1}. ${res.title} (Score: ${res.score.toFixed(4)})`);
      console.log(`   Plot: ${res.plot}\n`);
    });

  } catch (err) {
    console.error("Search Error:", err);
  } finally {
    await client.close();
  }
}

// 4. Run the test
runSearch("I want a movie about hackers or artificial intelligence.");