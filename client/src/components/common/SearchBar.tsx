import React, { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import Input from './Input';
import Button from './Button';
import clsx from 'clsx';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialQuery?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = 'Search...', initialQuery = '', className }) => {
  const [query, setQuery] = useState(initialQuery);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSearchClick = () => {
    onSearch(query.trim());
  };

  const handleClearClick = () => {
    setQuery('');
    onSearch(''); 
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  return (
    <div className={clsx("relative flex items-center", className)}>
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        className="pr-10" 
      />
      {query ? (
        <Button
          variant="icon"
          onClick={handleClearClick}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400"
        >
          <FaTimes />
        </Button>
      ) : (
        <Button
          variant="icon"
          onClick={handleSearchClick}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-lime-light hover:text-lime-light/80"
        >
          <FaSearch />
        </Button>
      )}
    </div>
  );
};

export default SearchBar;