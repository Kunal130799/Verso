import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { supabase } from './lib/supabase.js'
import postsRouter  from './routes/posts.js'
import usersRouter  from './routes/users.js'
import profileRouter from './routes/profile.js'
import searchRouter  from './routes/search.js'
import tagsRouter    from './routes/tags.js'

const app  = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',').map(s => s.trim())

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error('CORS: origin not allowed'))
  },
}))

app.use(express.json({ limit: '1mb' }))

app.use('/api/posts',   postsRouter)
app.use('/api',         usersRouter)
app.use('/api/profile', profileRouter)
app.use('/api/search',  searchRouter)
app.use('/api/tags',    tagsRouter)

app.get('/health', async (_req, res) => {
  try {
    await supabase.from('profiles').select('id').limit(1)
    res.json({ status: 'ok' })
  } catch {
    res.status(503).json({ status: 'error' })
  }
})

app.listen(PORT, () => console.log(`Verso server → http://localhost:${PORT}`))
