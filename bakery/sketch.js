let json = {};
let recipes = [];
let allIngredients = [];
let population = [];
let populationSize = 100;//only set even

let recipe_number = 0;
let history = [];



const color1Themes = {
  "ivory": ["ivory","pearl"],
  "white": ["creamy-white", "soft white", "white", "fluffy white", "milky white", "pure white","off-white","creamy white","snow white", "sugar white"],
  "yellow": ["golden-yellow", "buttery yellow", "sunny yellow","warm yellow","pale yellow"],
  "green": ["vibrant green", "bright green", "zesty green", "emerald green"],
  "brown": ["rich brown", "cinnamon brown", "earthy brown", "deep brown", "dark amber", "charcoal black"],
  "beige": ["sandy beige", "pale beige"],
  "black": ["charcoal black"],
  "dark": ["dark brown","dark caramel"],
  "cream": ["creamy yellow"],
  "gold": ["golden yellow", "golden brown","golden amber", "golden"],
  "pink": ["blush pink", "lavender purple","rich mahogany"]
};

const colorThemes = {
  "ivory": ["Fiery Inferno", "Blushing Sunset", "Crimson Tide", "Classic Elegance", "Soft Serenity", "Ivory Dreams"],
  "white": ["Snowy Peak", "Pearly Gates", "Ivory Cloud", "Pure Tranquility", "Silken Whisper", "Frosted Gleam"],
  "green": ["Emerald Garden", "Verdant Plains", "Leafy Bower", "Forest Haven", "Jade Oasis", "Nature's Embrace"],
  "blue": ["Azure Sky", "Oceanic Depths", "Sapphire Dreams"],
  "yellow": ["Golden Sunrise", "Sunny Fields", "Amber Waves"],
  "orange": ["Zesty Citrus", "Vibrant Autumn", "Tangerine Dreams"],
  "purple": ["Royal Velvet", "Lavender Mist", "Mauve Shadows"],
  "brown": ["Rustic Earth", "Cocoa Bliss", "Autumn Leaves", "Woodland Retreat", "Coffee Bean", "Sandy Dunes", "Maple Grove", "Chocolate Delight", "Chestnut Grove", "Amber Harvest"],
  "pink": ["Rosy Glow", "Blush Petals", "Coral Sunset", "Pink Blossom", "Cotton Candy", "Peachy Bloom", "Flamingo Dream"],
  "black": ["Midnight Shadow", "Onyx Realm", "Eclipse Darkness", "Mystic Obsidian", "Shadowy Depths", "Elegant Noir"],
  "dark": ["Eerie Abyss", "Shadowed Depths", "Twilight Veil", "Deep Night", "Gloomy Echoes"],
  "cream": ["Vanilla Dream", "Buttercream Delight", "Soft Almond", "Luxe Cream", "Milky Way"],
  "gold": ["Golden Horizon", "Sunset Gold", "Radiant Luxe", "Midas Touch", "Dazzling Gleam"],
  "beige": ["Sandy Shore", "Soft Taupe", "Desert Dune", "Wheat Fields", "Chic Neutral"]
};



let currentTheme = 'all';
let filteredRecipes = [];

function preload() {
  json = loadJSON("data/recipes.json");
}


function setup() {
  let canvas = createCanvas(800, 300);
  canvas.parent('canvas-container');
  recipes = json.recipes;
  createDOM();
  createColorButtons();
  // extract all of the ingredients from the inspiring set
  for (const r of recipes) {
    for (const i of r.ingredients) {
      allIngredients.push(i);
    }
  }

  // create an initial population
  for (let i = 0; i < populationSize; i++) {
    population.push(random(recipes));
  }
  evaluateRecipes(population);
  population.sort((a, b) => b.fitness - a.fitness);
  // lastGeneratedRecipes = population.slice(); // 只存储最后一次迭代出来的种群
  frameRate(2);
  updateDOMWithRecipes(population);
}

function calculateNutrition(recipe) {
  let nutrition = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0
  };

  recipe.ingredients.forEach(ing => {
      let multiplier = ing.amount / 100; 
      nutrition.calories += ing.nutrition.calories * multiplier;
      nutrition.protein += ing.nutrition.protein * multiplier;
      nutrition.carbohydrates += ing.nutrition.carbohydrates * multiplier;
      nutrition.fat += ing.nutrition.fat * multiplier;
  });

  recipe.nutrition = nutrition;
}



function evaluateRecipes(recipes) {
  // for (const r of recipes) {
  //   // fitness is the number of ingredients
  //   r.fitness = r.ingredients.length;
  // }
  const targetCalories = 700; 
  const targetProtein = 20;    
  const targetFat = 20;        

  recipes.forEach(r => {
      calculateNutrition(r);
      let fitness = 0;

      fitness += 1000 - Math.abs(r.nutrition.calories - targetCalories);
      const proteinPenalty = Math.abs(r.nutrition.protein - targetProtein);
      fitness += proteinPenalty < 10 ? 100 - (proteinPenalty * 10) : 0; 
      const fatPenalty = Math.abs(r.nutrition.fat - targetFat);
      fitness += fatPenalty < 10 ? 100 - (fatPenalty * 10) : 0; 

      r.fitness = fitness;
  });
}

// Implements a roulette wheel selection
function selectRecipe(recipes) {
  let sum = recipes.reduce((a, r) => a + r.fitness, 0);
  // choose a random number less than the sum of fitnesses
  let f = int(random(sum));
  // iterate through all items in the recipes
  for (const r of recipes) {
    // if f is less than a recipe's fitness, return it
    if (f < r.fitness) return r;
    // otherwise subtract the recipe's fitness from f
    f -= r.fitness;
  }
  // if no recipe has been returned, return the last one
  return recipes[recipes.length - 1];
}


function generateRecipes(size, population) {
  let R = [];
  let uniqueRecipes = new Set();
  while (R.length < size) {
    let r1 = selectRecipe(population);
    let r2 = selectRecipe(population);
    let r = crossoverRecipes(r1, r2);
    if (!uniqueRecipes.has(r.name)) {
      uniqueRecipes.add(r.name);
    mutateRecipe(r);
    normaliseRecipe(r);
    R.push(r);
    }
  }
  evaluateRecipes(R);
  
  return R;
}

function selectPopulation(P, R) {
  R.sort((a, b) => b.fitness - a.fitness);
  //sum is population
  P = P.slice(0, P.length/2).concat(R.slice(0, R.length/2));
  P.sort((a, b) => b.fitness - a.fitness);
  return P;
}

let generation = 0;
let maxGenerations = 30;

let lastGeneratedRecipes = []; 

function update() {
  if (generation >= maxGenerations) {
    noLoop(); // stop draw()'s loop
    return;
  }
  
  let R = generateRecipes(populationSize, population);
  population = selectPopulation(population, R);
  updateDOMWithRecipes(population);

  lastGeneratedRecipes = [...population];
  recipes = lastGeneratedRecipes
  generation++; // increase iters 

  console.log(`Generation: ${generation}, Population size: ${population.length}`);
  console.log(`Recipes: `, population);
  console.log(`Last Generated Recipes: `, lastGeneratedRecipes);
  
  const data = {
    recipes: lastGeneratedRecipes 
  };
  console.log(`data: `, data);
  fetch('http://localhost:5000/save-recipes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
}

function draw() {
  background(255, 240, 224);
  
  stroke(202, 65, 18);
  strokeWeight(10);
  noFill();
  rect(5, 5, width - 10, height - 10, 20);
  
  drawFitnessGraph();
  displayBestRecipe();
  update();
}
function drawFitnessGraph() {
  history.push(population[0].fitness);
  let yOffset = -180;
  fill(154, 52, 18);
  noStroke();
  
  textAlign(CENTER, TOP);
  text("max. fitness（Nutrition Score） = " + `${history[history.length - 1]}`, width / 2, height - 10 + yOffset);
  
  textAlign(CENTER, BOTTOM);
  text("Generations", width / 2, height - 10 + yOffset);
}


function displayBestRecipe() {
  if (population.length > 0) {
    let bestRecipe = population[0];
    fill(154, 52, 18);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(16);
    text("Best Recipe:", 50, 50);
    textSize(14);
    text(bestRecipe.name, 50, 70);
    text("Color:"+ bestRecipe.colortheme, 500, 70);
    textSize(12);
    let y = 90;
    for (let i of bestRecipe.ingredients) {
      text(`${i.amount}${i.unit} ${i.ingredient}`, 50, y);
      y += 20;
    }
  }
}

function createColorButtons() {
  let buttonContainer = createDiv();
  buttonContainer.class('button-container');
  buttonContainer.parent('nav-container');
  
  let allButton = createButton('All');
  allButton.class('color-button');
  allButton.mousePressed(() => changeTheme('all'));
  allButton.parent(buttonContainer);
  
  for (let color in colorThemes) {
    let button = createButton(color);
    button.class('color-button');
    button.style('background-color', color);
    button.mousePressed(() => changeTheme(color));
    button.parent(buttonContainer);
  }
}

function changeTheme(theme) {
  currentTheme = theme;
  console.log('Current Theme changed to:', currentTheme);
  updateFilteredRecipes(theme);
}

function updateFilteredRecipes(theme) {
  update(); 
  // 过滤菜谱
  if (theme === 'all') {
    filteredRecipes = population;
  } else {
    filteredRecipes = population.filter(recipe => {
      console.log(`Filtering Recipe: ${recipe.name}, Theme Color: ${recipe.themeColor}, Current Theme: ${theme}`);
      return recipe.colortheme.toLowerCase() === theme.toLowerCase();
    });
  }

  console.log(`Filtering Recipe: ${filteredRecipes.name}, Theme Color: ${filteredRecipes.themeColor}, Current Theme: ${currentTheme}`);  // 此处可以添加逻辑将 filteredRecipes 显示在页面上
  updateDOMWithRecipes(filteredRecipes);  // 假设 displayRecipes 是一个用于展示菜谱的函数
}

// function updateFilteredRecipes() {
//   update(); 
//   let data = {
//     recipes: [...lastGeneratedRecipes] 
//   };
  
//   let themeColor = generateColorThemeName(data.recipes.name)

//   console.log('Updated Recipes:', data.recipes);

//   if (currentTheme === 'all') {
//     filteredRecipes = [...data.recipes];
//     console.log('Filtered Recipes1:', filteredRecipes);
//   } else {
//     filteredRecipes = filteredRecipes.filter(recipe => {
//       console.log(`Filtering Recipe: ${recipe.name}, Theme Color: ${recipe.themeColor}, Current Theme: ${currentTheme}`);
//       return recipe.themeColor && recipe.themeColor.toLowerCase() === currentTheme.toLowerCase();
//     });
//       };
  

//   updateDOMWithRecipes(filteredRecipes);
// }



function crossoverRecipes(r1, r2) {
  // choose crossover point in r1
  let p1 = int(random(r1.ingredients.length));
  // choose crossover point in r2
  let p2 = int(random(r2.ingredients.length));
  // get first ingredient sublist from r1
  let r1a = r1.ingredients.slice(0, p1);
  // get second ingredient sublist from r2
  let r2b = r2.ingredients.slice(p2);
  // create a new recipe
  let r = {};
  let newIngredients = r1a.concat(r2b);
  // Generate the new recipe name based on ingredient colors
  r.name = generateColorThemeName(newIngredients) + ++recipe_number;  // Call the naming function
  r.colortheme = getColorThemeFromTitle(r.name);
  r.ingredients = newIngredients;
  return r;
}

function mutateRecipe(r) {
    switch (int(random(4))) {
        case 0: 
            let i = int(random(r.ingredients.length));
            r.ingredients[i] = Object.assign({}, r.ingredients[i]); // 创建食材副本
            r.ingredients[i].amount += int(r.ingredients[i].amount * 0.1); // 修改数量
            r.ingredients[i].amount = max(1, r.ingredients[i].amount);
            break;
        case 1: 
            let j = int(random(r.ingredients.length));
            let newIngredient = random(allIngredients); // 假设 allIngredients 中的每个元素都有 color 属性
            r.ingredients[j] = Object.assign({}, newIngredient);
            break;
        case 2: 
            let newIng = Object.assign({}, random(allIngredients)); // 选择并复制一个含颜色的食材
            r.ingredients.push(newIng);
            break;
        case 3: 
            if (r.ingredients.length > 1) {
                r.ingredients.splice(int(random(r.ingredients.length)), 1);
            }
            break;
    }
}


function normaliseRecipe(r) {
    // 使用 Map 来合并相同食材的数量，并确保颜色信息的一致性
    let uniqueIngredientMap = new Map();

    for (const i of r.ingredients) {
        const key = i.ingredient; // 假设食材名可以唯一确定食材
        if (uniqueIngredientMap.has(key)) {
            // 累加数量，假设颜色是一致的
            uniqueIngredientMap.get(key).amount += i.amount;
        } else {
            // 将食材及其颜色添加到 Map 中
            uniqueIngredientMap.set(key, { ...i });
        }
    }

    // 从 Map 中提取唯一食材列表
    r.ingredients = Array.from(uniqueIngredientMap.values());

    // 计算所有食材总量，用于标准化比例
    let totalAmount = r.ingredients.reduce((sum, i) => sum + i.amount, 0);
    let scale = 1000 / totalAmount; // 假设我们要将食材总量标准化到1000单位

    // 根据比例调整每个食材的数量
    for (let i of r.ingredients) {
        i.amount = Math.max(1, Math.round(i.amount * scale));
    }
}

//classifer cake/cookie
function determineRecipeType(ingredients) {
  const cakeIngredients = [
    "flour", 
    "sugar", 
    "eggs", 
    "butter", 
    "milk", 
    "baking powder", 
    "vanilla extract", 
    "chai tea", 
    "honey", 
    "coconut milk", 
    "shredded coconut", 
    "rose water", 
    "pistachios", 
    "matcha powder", 
    "lavender buds"
  ];
  
  const cookieIngredients = [
    "flour", 
    "sugar", 
    "butter", 
    "eggs", 
    "chocolate chips", 
    "caramel bits"
  ];

  let cakeCount = 0;
  let cookieCount = 0;

  ingredients.forEach(ing => {
      if (cakeIngredients.includes(ing.ingredient.toLowerCase())) {
          cakeCount++;
      }
      if (cookieIngredients.includes(ing.ingredient.toLowerCase())) {
          cookieCount++;
      }
  });

  if (cakeCount > cookieCount) {
      return "cake";
  } else if (cookieCount > cakeCount) {
      return "cookie";
  } else {
      return "dessert"; // 如果两者数量相同，则返回“甜点”
  }
}


// Genarate Name

function generateColorThemeName(ingredients) {
  let colorCounts = {};
  let ingredientMass = {};

  // Count the occurrence of each color in the ingredients and track mass
  ingredients.forEach(ing => {
      const color = ing.color.toLowerCase(); // 确保颜色是小写字母

      // 更新颜色计数
      colorCounts[color] = (colorCounts[color] || 0) + 1;

      // 初始化每种颜色的食材质量对象
      if (!ingredientMass[color]) {
          ingredientMass[color] = [];
      }

      // 添加食材及其数量
      ingredientMass[color].push({ name: ing.ingredient, amount: ing.amount });
  });

  // 检查颜色分布是否均匀
  const totalIngredients = Object.values(colorCounts).reduce((a, b) => a + b, 0);
  const averageCount = totalIngredients / Object.keys(colorCounts).length;
  const isEvenDistribution = Object.values(colorCounts).every(count => count <= averageCount);

  let mostCommonColor;  

  if (isEvenDistribution) {
      // 如果均匀分布，随机选择一个可用颜色
      const availableColors = Object.keys(colorCounts);
      mostCommonColor = availableColors[Math.floor(Math.random() * availableColors.length)];
  } else {
      // 找出出现频率最高的颜色
      mostCommonColor = Object.keys(colorCounts).reduce((a, b) => colorCounts[a] > colorCounts[b] ? a : b);
  }


  // 找出该颜色中数量最多的食材
  let maxIngredient = ingredientMass[mostCommonColor]?.reduce((max, item) => (item.amount > max.amount ? item : max), { name: "", amount: 0 }) || { name: "", amount: 0 };

  // 格式化食材名称
  let formattedIngredientName = maxIngredient.name.charAt(0).toUpperCase() + maxIngredient.name.slice(1);

  // 随机选择主题
  let themeColor = Object.keys(color1Themes).find(key => 
    color1Themes[key].includes(mostCommonColor)
  );
  let themes = colorThemes[themeColor] || ["Mysterious"];
  let theme = themes[Math.floor(Math.random() * themes.length)];
  
  console.log('themeColor of the name:', themeColor);
  let themeColorKey = Object.keys(color1Themes).find(key => color1Themes[key].includes(mostCommonColor));
  let currentColorTheme = themeColor  || ' '

  const themename = [
      'Tiger', 'Dragon', 'Bear', 'Lion', 'Eagle', 'Panda', 'Wolf', 'Forest', 'Tears', 'Princess',
      'Prince', 'Zeus', 'Hera', 'Poseidon', 'Demeter', 'Athena', 'Apollo', 'Artemis', 'Ares', 
      'Aphrodite', 'Hephaestus', 'Hermes', 'Hestia', 'Knight', 'Demon',
      'Amsterdam', 'Rotterdam', 'Utrecht', 'The Hague', 'Eindhoven', 'Leiden',
      'Phoenix', 'Griffin', 'Sphinx', 'Unicorn', 'Mermaid', 'Fairy', 'Elf', 'Vampire', 
      'Werewolf', 'Giant', 'Goblin', 'Wizard', 'Witch', 'Sorcerer', 'Nymph', 'Titan', 
      'Dolphin', 'Whale', 'Shark', 'Falcon', 'Hawk', 'Raven', 'Owl', 'Swan', 'Butterfly',
      'Ladybug', 'Ant', 'Bee', 'Dragonfly', 'Peacock', 'Penguin', 'Koala', 'Sloth', 
      'Cheetah', 'Hedgehog', 'Kangaroo', 'Zebra', 'Turtle', 'Octopus', 'Crab', 'Starfish',
      'Milky Way', 'Nebula', 'Supernova', 'Black Hole', 'Galaxy', 'Planet', 'Asteroid',
      'Comet', 'Meteor', 'Sun', 'Moon', 'Earth', 'Fire', 'Water', 'Air', 'Earthquake',
      'Tsunami', 'Volcano', 'Storm', 'Rainbow', 'Thunder', 'Lightning', 'Blizzard',
      'Winter', 'Spring', 'Summer', 'Autumn', 'Solstice', 'Equinox', 'Hurricane',
      'Desert', 'Ocean', 'Mountain', 'River', 'Valley', 'Canyon', 'Cave', 'Forest',
      'Garden', 'Field', 'Meadow', 'Park', 'Island', 'Coast', 'Harbor', 'Bay',
      'City', 'Town', 'Village', 'Country', 'Continent', 'World',
      'Amsterdam', 'Rotterdam', 'Utrecht', 'The Hague', 'Eindhoven', 'Leiden'
  ];

  const randomTheme = random(themename);
  const recipeTypes = ['cake', 'cookie'];
  const randomRecipeType = recipeTypes[Math.floor(Math.random() * recipeTypes.length)];
  
  return `${theme} ${randomTheme} ${formattedIngredientName} of ${themeColor} ${randomRecipeType}`;

}




// Web
function createDOM() {
  const headerContainer = select('#header-container');
  const headerImage = createImg('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DALL%C2%B7E%202024-10-11%2013.34.02%20-%20A%20vibrant%20and%20colorful%20web%20header%20for%20a%20color-themed%20recipe%20generator.%20The%20design%20should%20feature%20various%20colorful%20ingredients%20such%20as%20bakery%20items%20lik-LCUzM2nIZy2724A66bKwuKxYI4vnF4.webp', 'Colorful food illustration');
  headerImage.parent(headerContainer);

  const container = createDiv();
  container.class('container');


  const title = createElement('h1', 'About Us-Group 20');
  title.parent(container);  

 
  const teamContainer = createDiv();
  teamContainer.class('team-container');
  teamContainer.parent(container);  

  createTeamMember(teamContainer, '/data/1.png', 'Sha Li', 's4294092');
  createTeamMember(teamContainer, '/data/2.png', 'Han-wen Huang', 's4261100');
  createTeamMember(teamContainer, '/data/3.png', 'Zheng-qi Lang', 's4293100');

  const navContainer = createDiv();
  navContainer.id('nav-container');
  navContainer.parent(container);

  const canvasContainer = createDiv();
  canvasContainer.id('canvas-container');
  canvasContainer.parent(container);

  const recipeGrid = createDiv();
  recipeGrid.class('recipe-grid');
  recipeGrid.parent(container);
}

function createTeamMember(parent, imgSrc, nameText, idText) {
  const member = createDiv();
  member.class('team-member');
  member.parent(parent);

  const img = createImg(imgSrc, 'Team Member');
  img.size(150, 150); 
  img.parent(member);

  const name = createElement('p', nameText);
  name.parent(member);
  const id = createElement('p', idText);
  id.parent(member);
}


function getColorThemeFromTitle(recipeTitle) {
  // Convert title to lowercase for case-insensitive comparison
  recipeTitle = recipeTitle.toLowerCase();
  
  // Split title into individual words (assuming words are separated by spaces)
  let words = recipeTitle.split(' ');
  
  // Iterate through each word in the title
  for (let word of words) {
    // Check if the word matches any color theme keyword
    for (let theme in colorThemes) {
      if ((colorThemes[theme].some(adjective => adjective.toLowerCase() === word))||(theme == word)){
        return theme;  // Return the matched color theme
      }
    }
  }

  // If no match is found, return a default color theme
  return 'default';
}


function updateDOMWithRecipes(recipes) {
  const recipeGrid = select('.recipe-grid');
  recipeGrid.html('');  // 清空现有的菜谱

  recipes.forEach((recipe, index) => {
    const card = createDiv().class('recipe-card').parent(recipeGrid);

    // 根据菜谱名称映射颜色主题
    let colorTheme = recipe.colortheme;
    let colorThemeFolder = `images/${colorTheme}/`;  // 使用映射得到的颜色主题作为文件夹
    console.log(`Recipe: ${recipe.name}, colorTheme: ${colorTheme}`);
    // 根据菜谱名称匹配不同的类型，并随机选择相应的图片
    let imageUrl = '';
    if (recipe.name.toLowerCase().includes('cake')) {
      imageUrl = getRandomImage(colorThemeFolder, 'cake'); 
      console.log(`Recipe: ${recipe.name}, colorTheme: ${colorTheme},fold:${imageUrl}`) 
    } else if (recipe.name.toLowerCase().includes('cookie')) {
      imageUrl = getRandomImage(colorThemeFolder, 'cookie'); // 随机选择 cookie 类型的图片
      console.log(`Recipe: ${recipe.name}, colorTheme: ${colorTheme},fold:${imageUrl}`) 
    } else {
      imageUrl = 'images/default.png';  // 如果没有匹配到类型，使用默认图片
    }

    // 创建 image 元素并应用图片路径
    const image = createDiv().class('recipe-image').style('background-image', `url(${imageUrl})`).parent(card);

    // 创建内容部分
    const content = createDiv().class('recipe-content').parent(card);
    const recipeTitle = createElement('h2', recipe.name).class('recipe-title').parent(content);

    // 为每个配料列表创建唯一的 ID
    const ingredientsId = `ingredients-list-${index}`;
    const button = createButton('Ingredients ▼').class('ingredients-button').parent(content);
    button.mousePressed(() => toggleIngredients(ingredientsId, button));

    const ingredientsList = createElement('ul', '').id(ingredientsId).class('ingredients-list').parent(content);
    recipe.ingredients.forEach(ingredient => {
      createElement('li', `${ingredient.amount} ${ingredient.unit} ${ingredient.ingredient}`).class('ingredient-item').parent(ingredientsList);
    });
  });
}

// 随机选择与类型相关的图片
function getRandomImage(folder, type) {
  // 假设每个类型有多个图片，命名为 type1.png, type2.png 等
  const images = {
    'cake': ['cake_1.png', 'cake_2.png', 'cake_3.png', 'cake_4.png'],  // 假设有多张 cake 图片
    'cookie': ['cookie_1.png', 'cookie_2.png', 'cookie_3.png', 'cookie_4.png']  // 假设有多张 cookie 图片
  };

  // 如果指定的类型存在，随机选择一个图片
  if (images[type]) {
    const randomIndex = Math.floor(Math.random() * images[type].length);
    return folder + images[type][randomIndex];
  }

  // 如果类型不存在或找不到图片，返回默认图片路径
  return 'images/default.png';
}

function toggleIngredients(ingredientsId, chevron) {
	const ingredientsList = select('#' + ingredientsId);
	if (ingredientsList.style('display') === 'none') {
		ingredientsList.style('display', 'block');
		chevron.html('Ingredients ▼');
	} else {
		ingredientsList.style('display', 'none');
		chevron.html('▼');
	}
}





