export const fetchPokemonData = async () => {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10');
    const data = await response.json();
    const pokemonPromises = data.results.map(pokemon => fetch(pokemon.url).then(res => res.json()));
    return Promise.all(pokemonPromises);
};

import { fetchPokemonByName, getEvolutionDetails, fetchPokemonByGeneration } from './api.js';

const generationMap = {
    'generation-i': 1,
    'generation-ii': 2,
    'generation-iii': 3,
    'generation-iv': 4,
    'generation-v': 5,
    'generation-vi': 6,
    'generation-vii': 7,
    'generation-viii': 8,
};

document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const pokemonList = document.getElementById('pokemon-list');
    const menuButton = document.getElementById('menu-button');
    const dropdownMenu = document.getElementById('dropdown-menu');

    menuButton.addEventListener('click', () => {
        dropdownMenu.classList.toggle('hidden');
    });

    searchButton.addEventListener('click', async () => {
        const pokemonName = searchInput.value.trim();
        if (pokemonName === '') return;

        try {
            pokemonList.innerHTML = ''; // Clear previous results
            const { pokemon, speciesData, evolutionChainData } = await fetchPokemonByName(pokemonName);
            const { previous, next } = getEvolutionDetails(evolutionChainData, pokemon.name);

            const generationNumber = generationMap[speciesData.generation.name];

            const pokemonCard = createPokemonCard(pokemon, generationNumber, previous, next);
            pokemonList.appendChild(pokemonCard);
        } catch (error) {
            pokemonList.innerHTML = '<p class="text-red-500">Failed to load Pokemon data. Please try a different name.</p>';
        }
    });

    document.querySelectorAll('[data-gen]').forEach(button => {
        button.addEventListener('click', async (e) => {
            const generation = e.target.getAttribute('data-gen');
            console.log('Clicked generation:', generation); // Debugging output

            try {
                pokemonList.innerHTML = ''; // Clear previous results
                const pokemonArray = await fetchPokemonByGeneration(generation);
                console.log('Fetched Pokémon array:', pokemonArray); // Debugging output

                pokemonArray.forEach(pokemon => {
                    const pokemonCard = createPokemonImageCard(pokemon);
                    pokemonList.appendChild(pokemonCard);
                });
            } catch (error) {
                pokemonList.innerHTML = `<p class="text-red-500">Failed to load Pokémon data for ${generation}. Please try a different generation.</p>`;
            }
            dropdownMenu.classList.add('hidden'); // Hide dropdown menu after selection
        });
    });

    // Handle click on Pokémon image to show details
    pokemonList.addEventListener('click', async (e) => {
        const pokemonName = e.target.getAttribute('data-name');
        if (pokemonName) {
            try {
                pokemonList.innerHTML = ''; // Clear previous results
                const { pokemon, speciesData, evolutionChainData } = await fetchPokemonByName(pokemonName);
                const { previous, next } = getEvolutionDetails(evolutionChainData, pokemon.name);

                const generationNumber = generationMap[speciesData.generation.name];

                const pokemonCard = createPokemonCard(pokemon, generationNumber, previous, next);
                pokemonList.appendChild(pokemonCard);
            } catch (error) {
                pokemonList.innerHTML = '<p class="text-red-500">Failed to load Pokemon data. Please try a different name.</p>';
            }
        }
    });

});

// function to create a Pokemon card with detailed information
function createPokemonCard(pokemon, generationNumber, previous, next) {
    const pokemonCard = document.createElement('div');
    pokemonCard.classList.add('p-4', 'bg-gray-200', 'rounded', 'shadow-md', 'mx-auto', 'mt-8');
    pokemonCard.innerHTML = `
        <h3 class="text-xl capitalize">${pokemon.name}</h3>
        <p>ID: ${pokemon.id}</p>
        <p>Generation: ${generationNumber}</p>
        <p>Previous Evolution: ${previous || 'None'}</p>
        <p>Next Evolution: ${next || 'None'}</p>
        <p>Height: ${(pokemon.height / 10).toFixed(1)} meters</p>
        <p>Weight: ${(pokemon.weight / 10).toFixed(1)} kg</p>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    `;
    return pokemonCard;
}

// Helper function to create a Pokemon card with image and name
function createPokemonImageCard(pokemon) {
    const pokemonCard = document.createElement('div');
    pokemonCard.classList.add('p-4', 'bg-gray-200', 'rounded', 'shadow-md', 'cursor-pointer');
    pokemonCard.setAttribute('data-name', pokemon.name);
    pokemonCard.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="mx-auto">
        <p class="text-center mt-2">${pokemon.name}</p>
    `;
    return pokemonCard;
}

