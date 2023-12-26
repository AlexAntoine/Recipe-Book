const express = require('express');
// const boostrap = require('bootstrap');
const path = require('path');
const cons = require('consolidate');
const dust = require('dustjs-helpers');
const pg = require('pg');

const bodyParser = require('body-parser');

const app  = express();

// const config = {
//     user:"postgres",
//     database:'recipebookdb',
//     password:'admin',
//     port:5432
// }
const contrString= 'postgres://postgres:admin@localhost:5432/recipebookdb';

const pool =new pg.Pool({
    connectionString:contrString,
});

// Assign Dust Engine to .dust Files
app.engine('dust',cons.dust);

app.set('view engine', 'dust');
app.set('views', __dirname+'/views');

// Set Public Folder
app.use(express.static(path.join(__dirname,'public')));

// Body-Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.get('/',async(req, res)=>{
    //PG Connect
    const client = await pool.connect();

    const result = await client.query('SELECT * FROM recipes');

    res.render('index', {recipes:result.rows});
    
    client.end();

});

app.post('/add', async(req, res)=>{

    const {name,ingredients, directions} = req.body;

    const client = await pool.connect();

    const result = await client.query('INSERT INTO recipes(name, ingredients, directions) VALUES($1, $2, $3)',[name, ingredients, directions]);

    client.end();

    res.redirect('/');

});

app.delete('/delete/:id', async(req, res)=>{

    const {id} = req.params;
    
    const client = await pool.connect();

    const result = await client.query('DELETE FROM recipes WHERE id = $1',[id]);

    client.end();

    res.send(200);

});

app.post('/edit',async(req, res)=>{

  
    const {name, ingredients,directions,id} = req.body;
    
    const client = await pool.connect();

    const result = await client.query('UPDATE recipes SET name=$1, ingredients=$2, directions=$3 WHERE id=$4',[name, ingredients, directions, id]);

    client.end();

    res.redirect('/');
})


// Server
app.listen(3000,()=>{
    console.log('server is listening on port 3000');
});

