
import express from 'express'
import cors from 'cors'
import pkg from 'pg'

const app = express()

app.use(express.json())
app.use(cors())

const {Pool} = pkg;

const pool = new Pool({
   user:'postgres',
   host:'localhost',
   database:'TodoDb',
   password:'karthik8688',
   port:5432,
})

app.get('/',(req,res)=>{
    res.send("THE EXPRESS SERVER IS RUNNING...");
})

app.get('/data',async(req,res)=>{
    try{
      const result = await pool.query('SELECT * FROM todos')
      res.status(200).json(result.rows)
    }
    catch(error){
        console.error("DATA FETCH FAILED : "+error)
        res.status(500).send({error:"DATA FETCH FAILED"})
    }
})

app.get('/data/:id',async(req,res)=>{
    const {id} = req.params;
    try{
    const result = await pool.query('SELECT * FROM todos WHERE id=$1',[id])
    res.status(200).json(result.rows[0]);
    }catch(error){
        console.error(`ERROR NO MATCH WITH THAT ID ${id}`+error);
        res.status(500).send({error:`ERROR NO MATCH WITH THAT ID ${id}`})
    }
})

app.post('/add',async(req,res)=>{

    const {id,des} = req.body;

    if(!id || !des ){
        return res.status(400).send({
            error:'MUST REQUIRED ID AND DES'
        })
    }

   
    try{
         await pool.query('INSERT INTO todos(id,des) VALUES($1,$2)',[id,des])
         res.status(200).send({ message:`{id: ${id} , des: ${des}}`})
    }catch(error){
        console.error("DB INSERTING FAILED ....!"+error)
        res.status(500).send({error:"DB INSERTING FAILED ....!"})
    }
})

app.delete('/delete/:id',async(req,res)=>{
    const {id} = req.params;
    try{
      const rowsEffected = await pool.query('DELETE FROM todos WHERE id=$1',[id])

        if(rowsEffected.rowCount === 0){
        console.error(`NO ROW FOUND WITH id ${id}`);
        return res.status(404).send({error:`NOW ROW FOUND WITH id ${id}`})
        }

        res.status(200).send({message:`ROW WITH ${id} ID IS DELETED SUCESSFULLY`})
    }catch(error){
        console.error("DELETION OF ROW IS FAILED ... : "+error);
        res.status(500).send({error:"DELETION OF ROW IS FAILED..!"})
    }
})

app.put('/update/:id',async(req,res)=>{
    const {id} = req.params;
    const {des} = req.body;
    
    if(!des) return res.status(400).send({error:"des is must required"})

    try{
       const rowsUpdated = await pool.query('UPDATE todos SET des=$1 WHERE id=$2',[des,id]);
       if(rowsUpdated.rowCount === 0){
        console.error(`NO ROW FOUND WITH THAT ID ${id}`);
        return res.status(404).send({error:`NO ROW FOUND WITH THAT ID ${id}`})
       }
       res.status(200).send({message:`The Row with id ${id} successfully updated..!`})
    }catch(error){
        console.error(`UPDATION WITH id ${id} FAILED`+error)
        res.status(500).send({error:`UPDATION WITH id ${id} FAILED`})
    }
})

app.listen(5001,()=>{
    console.log("THE EXPRESS IS RUNNING ON PORT : http://localhost:5001")
})