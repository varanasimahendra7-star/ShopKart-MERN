import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from "cookie-parser";
import customerRoutes from './routes/customer.routes.js'
import productRoutes from './routes/product.routes.js'
import wishlistRoutes from './routes/wishlist.routes.js'
import cartRoutes from './routes/cart.routes.js'
import orderRoutes from './routes/order.routes.js'

dotenv.config()

if (!process.env.JWT_SECRET || !process.env.dburl) {
    throw new Error("Missing required environment variables (JWT_SECRET, dburl)")
}

const app = express()
const PORT = 8085

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use(cookieParser())
app.use(express.json())

app.use('/customers', customerRoutes)
app.use('/products', productRoutes)
app.use('/wishlist', wishlistRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', orderRoutes)

mongoose.connect(process.env.dburl)
    .then(() => {
        console.log('Database Connected')
    })
    .catch((err) => {
        console.log('Database Not Connected')
        console.log(err)
    })

app.get('/', (req, res) => {
    res.send('Server On Hellllooooo...')
})

app.listen(PORT, () => {
    console.log(`Server Started at ${PORT}`)
})