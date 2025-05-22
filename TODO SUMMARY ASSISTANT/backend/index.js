import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';


const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, });



app.get('/todo', async (req, res) => {
  const { data, error } = await supabase.from('todos').select('*').order('created_at');
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.post('/todos', async (req, res) => {
  const { title } = req.body;
  const { data, error } = await supabase.from('todos').insert([{ title }]).select();
  if (error) return res.status(500).json({ error });
  res.json(data[0]);
});

app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('todos').delete().eq('id', id);
  if (error) return res.status(500).json({ error });
  res.json({ success: true });
});

app.post('/summarize', async (req, res) => {
  const { data: todos, error } = await supabase.from('todos').select('*');
  if (error) return res.status(500).json({ error });

  const list = todos.map((t, i) => `${i + 1}. ${t.title}`).join('\n');
  const prompt = `Summarize these todo items in a helpful, concise way:\n\n${list}`;
  try{
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  });
}catch (error){
  if(error.code === 'insufficient quot'){
    console.error("Quota exceeded. Please check your OpenAI plan");
  }else{
    console.error("OpenAI error: ",error);
  }
}
  const summary = response.data.choices[0].message.content;

  const slackRes = await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: summary }),
  });

  if (!slackRes.ok) return res.status(500).json({ error: 'Failed to post to Slack' });
  res.json({ success: true });
});

app.listen(4000, () => console.log('Server running on http://localhost:4000'));
