document.addEventListener('DOMContentLoaded', () => {
    fetch('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/recipes-OzN78gWVpDCi1kUHPmjrGlT4n91ciH.json')
        .then(response => response.json())
        .then(data => {
            const recipeGrid = document.getElementById('recipeGrid');
            data.recipes.forEach(recipe => {
                const card = document.createElement('div');
                card.className = 'recipe-card';
                card.innerHTML = `
                    <h2>${recipe.name}</h2>
                    <ul>
                        ${recipe.ingredients.map(ing => `
                            <li>${ing.amount} ${ing.unit} ${ing.ingredient}</li>
                        `).join('')}
                    </ul>
                `;
                recipeGrid.appendChild(card);
            });
        })
        .catch(error => console.error('Error fetching recipes:', error));
});