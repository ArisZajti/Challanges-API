export const fetchPokemonData = async () => {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10');
    const data = await response.json();
    const pokemonPromises = data.results.map(pokemon => fetch(pokemon.url).then(res => res.json()));
    return Promise.all(pokemonPromises);
};

export const fetchPokemonByName = async (name) => {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
        if (!response.ok) {
            throw new Error('Pokemon not found');
        }
        const pokemon = await response.json();
        const speciesResponse = await fetch(pokemon.species.url);
        const speciesData = await speciesResponse.json();

        const evolutionChainResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionChainData = await evolutionChainResponse.json();

        return { pokemon, speciesData, evolutionChainData };
    } catch (error) {
        console.error('Error fetching Pokemon data:', error);
        throw error;
    }
};

export const getEvolutionDetails = (evolutionChainData, name) => {
    let previous = null;
    let next = null;

    const traverse = (node, prevName) => {
        if (node.species.name === name) {
            if (node.evolves_to.length > 0) {
                next = node.evolves_to[0].species.name;
            }
            return true;
        }
        for (let i = 0; i < node.evolves_to.length; i++) {
            if (traverse(node.evolves_to[i], node.species.name)) {
                if (!previous) {
                    previous = prevName;
                }
                return true;
            }
        }
        return false;
    };

    traverse(evolutionChainData.chain, null);
    return { previous, next };
};

export const fetchPokemonByGeneration = async (generation) => {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/generation/${generation}`);
        const data = await response.json();
        const pokemonPromises = data.pokemon_species.map(species =>
            fetch(species.url.replace('pokemon-species', 'pokemon')).then(res => res.json())
        );
        return Promise.all(pokemonPromises);
    } catch (error) {
        console.error('Error fetching generation data:', error);
        throw error;
    }
};
