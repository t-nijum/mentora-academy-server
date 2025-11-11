const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://mentoraDBUser:bppiDOlddPvObAq4@cluster0.xr2sv5h.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// normal get
app.get('/', (req, res) => {
    res.send('Mentora Academy server is running')
})

async function run() {
    try { 
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // Send the info to the db
        const db = client.db('mentora_db');
        const coursesCollection = db.collection('courses');
        // login users
        const usersCollection = db.collection('users')
        const addNewCoursesCollection = db.collection('add_new_courses')

        // login users API from login 
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const email = req.body.email;
            const query = { email: email }
            const existingUser = await usersCollection.findOne(query);

            if (existingUser) {
                res.send({ message: 'user already exits. do not need to insert again' })
            }
            else {
                const result = await usersCollection.insertOne(newUser);
                res.send(result);
            }
        })


         // Read-search or find data from db
        app.get('/courses', async (req, res) => {
            // const projectFields = {_id: 0, title: 1,category: 1,description:1 }
            // sort 1 or -1, limit(5), 
            // const cursor = productCollection.find().sort({price_min: -1}).skip(2).limit(5).project(projectFields);

            console.log(req.query);
            // const email = req.query.email;
            // const query = {};
            // if (email) {
            //     query.email = email;
            // }
            // const cursor = productCollection.find(query);
            const cursor = coursesCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        // Top Courses API
        app.get('/top-courses', async (req, res) => {
            // const cursor = coursesCollection.find().sort({ created_at: -1 }).limit(6);
            // const cursor = coursesCollection.find().sort({ ratingAvg: -1 }).limit(6);
            const cursor = coursesCollection.find().sort({ ratingAvg: -1 }).limit(8);
            const result = await cursor.toArray();
            res.send(result);
        })

        // Read Read-search or find by ID
        app.get('/courses/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }  
            const result = await coursesCollection.findOne(query);
            res.send(result);
        })

        // Post--send data to db 
        app.post('/courses', async (req, res) => {
            const newCourse = req.body;
            const result = await coursesCollection.insertOne(newCourse);
            res.send(result)
        })
        // Update db data
        app.patch('/courses/:id', async (req, res) => {
            const id = req.params.id;
            const updatedCourse = req.body;
            const query = { _id: new ObjectId(id) }
            const update = { $set: { name: updatedCourse.name, price: updatedCourse.price } }
            const result = await coursesCollection.updateOne(query, update)
            res.send(result)
        })
        // MY ADDED COURSES RELATED API
        // add new course related API
        app.post('/add_new_courses', async (req, res) => {
            const addNewCourse = req.body;
            const result = await addNewCoursesCollection.insertOne(addNewCourse);
            res.send(result)
        })
        // add new course related API
        app.get('/add_new_courses', async (req, res) => {
            const cursor = addNewCoursesCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })


        // Delete db data
        app.delete('/courses/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await coursesCollection.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
// call the upper function 
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Mentora Academy server is running on port: ${port}`);

})