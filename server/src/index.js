import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { supabase } from './lib/supabase.js'
import postsRouter  from './routes/posts.js'
import usersRouter  from './routes/users.js'
import profileRouter from './routes/profile.js'
import searchRouter  from './routes/search.js'
import tagsRouter    from './routes/tags.js'
import feedRouter    from './routes/feed.js'
import { apiLimiter } from './middleware/rateLimit.js'

const app  = express()
const PORT = process.env.PORT || 3001

// Render sits one reverse proxy in front of the app — trust exactly that hop
// so req.ip (and therefore rate limiting) reflects the real client, not
// Render's proxy IP for every request.
app.set('trust proxy', 1)

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',').map(s => s.trim())

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error('CORS: origin not allowed'))
  },
}))

app.use(express.json({ limit: '1mb' }))
app.use(apiLimiter)

app.use('/api/posts',   postsRouter)
app.use('/api',         usersRouter)
app.use('/api/profile', profileRouter)
app.use('/api/search',  searchRouter)
app.use('/api/tags',    tagsRouter)
app.use(feedRouter)

app.get('/health', async (_req, res) => {
  try {
    await supabase.from('profiles').select('id').limit(1)
    res.json({ status: 'ok' })
  } catch {
    res.status(503).json({ status: 'error' })
  }
})

app.listen(PORT, () => console.log(`Verso server → http://localhost:${PORT}`))
