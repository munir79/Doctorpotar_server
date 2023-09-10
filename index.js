const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;




// middleware

app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9b6ho97.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const appoinmentOption = client.db('doctorportal').collection('appoinmentoption');
    const bookingCollection = client.db('doctorportal').collection('bookings');
    app.get('/appoinment', async (req, res) => {
      const date = req.query.date;
      console.log(date);
      const bookingQuery = { appointmentDate: date }
      const alreadyBooked = await bookingCollection.find(bookingQuery).toArray();
      console.log(alreadyBooked);
      const query = {};
      const cursor = appoinmentOption.find(query);
      const option = await cursor.toArray();
      option.forEach(option => {
        const optionBooked = alreadyBooked.filter(book => book.treatmentName == option.name);
        const bookslot = optionBooked.map(book => book.slot);
        const remainningSlots = option?.slots?.filter(slot => !bookslot.includes(slot));
       option.slots=remainningSlots;
        console.log(date,option.name ,remainningSlots?.length);
   

      })
      res.send(option);
    })

    /*
 app.get('/read all from database ')
app.get('/readone from database/:id')
app.post('/post a data to database')
app.patch('/update/:id');
app.delete('/delete/:id);
    */

    app.post('/bookings', async (req, res) => {
      const booking = req.body
      const query={
         appointmentDate:booking.appointmentDate,
         email:booking.email,
         treatmentName:booking.treatmentName

      }
    const booked=await bookingCollection.find(query).toArray();

    if(booked.length){
    const messege=`you have already booked ${booking.appointmentDate} on this date`
    return res.send({acknowledged:false,messege});
    }


     
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    })
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('hello from node mongo server ');
})


app.listen(port, () => {
  console.log(`listening to port ${port} `);
})
