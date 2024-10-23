// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const app = express();
// const PORT = 3000;

// // app.use(cors()); // 启用 CORS
// app.use(cors({
//     origin: 'http://127.0.0.1:5500'
// }));

// app.use(bodyParser.json());
// let lastRecipe = null;

// app.post('/api/last-recipe', (req, res) => {
//     const recipe = req.body;
//     console.log('Received recipe:', recipe);
//     lastRecipe = recipe;

//     fs.writeFile('lastRecipe.json', JSON.stringify(lastRecipe, null, 2), (err) => {
//         if (err) {
//             console.error('Error saving recipe to file:', err);
//             res.status(500).send('Error saving recipe');
//         } else {
//             res.status(200).send('Recipe received and saved successfully');
//         }
//     });
// });



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
