const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());
app.use(cors());

const supabaseUrl = "https://bqmmtapststrhhvjprvo.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbW10YXBzdHN0cmhodmpwcnZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjgyNDgxMCwiZXhwIjoyMDYyNDAwODEwfQ.FK4fGTUvOMHBjJIWB3-06L2VtnvvEAsB97CkUT6n7Ek";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Register route (auth only)
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const { data: user, error: authError } = await supabase.auth.admin.createUser(
    {
      email,
      password,
      email_confirm: true,
    }
  );

  if (authError) {
    return res
      .status(500)
      .json({ error: "Error creating auth user", details: authError.message });
  }

  res.status(201).json({ message: "User created successfully", user });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data: session, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginError) {
    return res
      .status(401)
      .json({ error: "Invalid credentials", details: loginError.message });
  }

  res.status(200).json({ message: "Login successful", session });
});

app.post("/trips", async (req, res) => {
  const { user_id, destination, startDate, endDate } = req.body; 

  const { data, error } = await supabase
    .from("trips")
    .insert([{ user_id, destination, startDate, endDate }]) 
    .select();

  if (error) {
    console.error(error); // Log error for debugging
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ trip: data[0] });
});

app.get("/trips/:user_id", async (req, res) => {
  const { user_id } = req.params;

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", user_id);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
  res.json({ trips: data });
});

app.post("/documents", async (req, res) => {
  const { trip_id, user_id, name, type, file_url } = req.body;

  const { data, error } = await supabase
    .from("documents")
    .insert([{ trip_id, user_id, name, type, file_url }])
    .select();

  if (error) {
    console.error(error); // Log error for debugging
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json({ document: data[0] });
});

app.get("/documents/:trip_id", async (req, res) => {
  const { trip_id } = req.params;

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("trip_id", trip_id);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ documents: data });
});

app.delete('/documents/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Received document ID for deletion:', id); // Log the ID for debugging

  const { error } = await supabase.from('documents').delete().eq('id', id);

  if (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({ error: error.message });
  }

  res.status(204).send();
});

app.post("/attractions", async (req, res) => {
  const { trip_id, type, desc, startDate, time } = req.body;

  // Validate required fields
  if (!trip_id || !type || !desc || !startDate || !time) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const { data, error } = await supabase
    .from("attractions")
    .insert([{ trip_id, type, desc, startDate, time }])
    .select();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ attraction: data[0] });
});

app.get("/attractions/:trip_id", async (req, res) => {
  const { trip_id } = req.params;

  const { data, error } = await supabase
    .from("attractions")
    .select("*")
    .eq("trip_id", trip_id);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ attractions: data });
});

app.delete('/attractions/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Received attraction ID for deletion:', id); // Log the ID for debugging

  const { error } = await supabase.from('attractions').delete().eq('id', id);

  if (error) {
    console.error('Error deleting attraction:', error);
    return res.status(500).json({ error: error.message });
  }

  res.status(204).send();
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});