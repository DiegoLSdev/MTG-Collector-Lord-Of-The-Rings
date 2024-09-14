import React, { useEffect, useState } from 'react';
import CardGrid from './components/CardGrid';
import TextFilter from './components/filters/TextFilter';
import RarityFilter from './components/filters/RarityFilter';
import TypeFilter from './components/filters/TypeFilter';
import ColorFilter from './components/filters/ColorFilter';
import PriceToggle from './components/filters/PriceToggle';
import CollectionPercent from './components/CollectionPercent';
import CollectionPercent2 from './components/CollectionPercent2';
import CardStatistics from './components/CardStatistics';
import titleBg from './assets/icons/bg.png';

const CardList = () => {
  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [combinedFilter, setCombinedFilter] = useState({
    color: '',
    name: '',
    rarity: '',
    type: '',
  });
  const [showPrices, setShowPrices] = useState(false); // Default to hide prices

  const fetchCards = async () => {
    try {
      const set = 'lotr'; // Set code for the Lord of the Rings set
      let allCards = [];
      let page = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const response = await fetch(
          `https://api.scryfall.com/cards/search?q=set:${set}&include_extras=true&page=${page}`
        );
        const data = await response.json();

        // Filter out Alchemy cards and include special cards like Art Cards
        const filteredCards = data.data.filter(card =>
          !Array.isArray(card.promo_types) || !card.promo_types.includes('alchemy')
        );

        allCards = [...allCards, ...filteredCards];
        
        if (!data.has_more) {
          hasMorePages = false;
        } else {
          page++;
        }
      }

      setCards(allCards);
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
  };
    
  const handleSelectedCard = (e, cardName) => {
    const updatedSelectedCards = selectedCards.includes(cardName)
      ? selectedCards.filter((name) => name !== cardName)
      : [...selectedCards, cardName];
    setSelectedCards(updatedSelectedCards);
    // Save selected cards to local storage
    localStorage.setItem('selectedCards', JSON.stringify(updatedSelectedCards));
  };

  const handleColorFilter = (selectedColor) => {
    setCombinedFilter({ ...combinedFilter, color: selectedColor });
  };

  const handleNameFilter = (filterValue) => {
    setCombinedFilter({ ...combinedFilter, name: filterValue });
  };

  const handleRarityFilter = (selectedRarity) => {
    setCombinedFilter({ ...combinedFilter, rarity: selectedRarity });
  };

  const handleTypeFilter = (selectedType) => {
    setCombinedFilter({ ...combinedFilter, type: selectedType });
  };

  useEffect(() => {
    const storedSelectedCards = JSON.parse(localStorage.getItem('selectedCards'));
    if (storedSelectedCards) {
      setSelectedCards(storedSelectedCards);
    }
 
    fetchCards();
 
    const { color, name, rarity, type } = combinedFilter;
    let filtered = cards;
 
    if (color) {
      filtered = filtered.filter((card) => card.colors.includes(color));
    }
    if (name) {
      filtered = filtered.filter((card) =>
        card.name.toLowerCase().includes(name.toLowerCase())
      );
    }
    if (rarity) {
      filtered = filtered.filter((card) => card.rarity === rarity);
    }
    if (type) {
      filtered = filtered.filter((card) => card.type_line === type);
    }
 
    // Filter out Alchemy cards here as well
    filtered = filtered.filter(card =>
      !Array.isArray(card.promo_types) || !card.promo_types.includes('alchemy')
    );
 
    setFilteredCards(filtered);
  }, [cards, combinedFilter]);

  return (
    <div className='p-4'>
      <div className="">
        {/* <CardStatistics cards={cards} /> */}
        <CollectionPercent2
          selectedCards={selectedCards}
          totalCards={cards.length}
          allCards={cards}
        />
        <CollectionPercent
          selectedCards={selectedCards}
          totalCards={cards.length}
          allCards={cards}
        />
      </div>
      <div className="p-4 bg-gray-900 rounded-lg shadow-md text-white">
        <div className="flex justify-evenly gap-4 mb-4 flex-wrap items-center pb-12">
          <TextFilter cards={cards} handleFilter={handleNameFilter} />
          <RarityFilter cards={cards} handleFilter={handleRarityFilter} />
          <PriceToggle showPrices={showPrices} setShowPrices={setShowPrices} />
          <ColorFilter cards={cards} handleFilter={handleColorFilter} />
          <TypeFilter cards={cards} handleFilter={handleTypeFilter} />
        </div>
        <CardGrid
          cards={filteredCards.length > 0 ? filteredCards : cards}
          selectedCards={selectedCards}
          handleSelectedCard={handleSelectedCard}
          showPrices={showPrices}
        />
      </div>
    </div>
  );
};

export default CardList;
