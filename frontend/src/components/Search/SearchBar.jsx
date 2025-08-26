// Caminho: olympus-frontend/src/components/Search/SearchBar.jsx

import { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Search, MapPin, Building, ChevronRight, X } from "lucide-react";
import { workspacesAPI } from '@/lib/api/workspaces';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ placeholder = "Buscar...", className = "" }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ cities: [], neighborhoods: [], workspaces: [] });
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchBarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions({ cities: [], neighborhoods: [], workspaces: [] });
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await workspacesAPI.getSearchSuggestions(query);
        setSuggestions(response.data);
      } catch (error) {
        console.error("Erro ao buscar sugestões:", error);
        setSuggestions({ cities: [], neighborhoods: [], workspaces: [] });
      } finally {
        setLoading(false);
      }
    };

    const handler = setTimeout(() => {
      fetchSuggestions();
    }, 300); // Debounce

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/workspaces?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (type, value) => {
    let path = "";
    if (type === 'city') {
      path = `/workspaces?city=${encodeURIComponent(value.split(',')[0].trim())}&state=${encodeURIComponent(value.split(',')[1].trim())}`;
    } else if (type === 'neighborhood') {
      const parts = value.split(' - ');
      const neighborhood = parts[0].trim();
      const cityState = parts[1].trim().split(', ');
      path = `/workspaces?neighborhood=${encodeURIComponent(neighborhood)}&city=${encodeURIComponent(cityState[0])}&state=${encodeURIComponent(cityState[1])}`;
    } else if (type === 'workspace') {
      path = `/workspaces/${value}`;
    }
    navigate(path);
    setShowSuggestions(false);
    setQuery('');
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'city':
        return <MapPin className="h-4 w-4 text-muted-foreground" />;
      case 'neighborhood':
        return <MapPin className="h-4 w-4 text-muted-foreground" />;
      case 'workspace':
        return <Building className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`} ref={searchBarRef}>
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        className="pl-8 pr-8"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
      />
      {query && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground"
          onClick={() => setQuery('')}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {showSuggestions && (suggestions.cities.length > 0 || suggestions.neighborhoods.length > 0 || suggestions.workspaces.length > 0 || loading) && (
        <div className="absolute z-10 w-full bg-popover border rounded-md shadow-lg mt-1 max-h-80 overflow-y-auto">
          {loading && query.length >= 2 && (
            <div className="p-2 text-center text-muted-foreground">Carregando...</div>
          )}
          {!loading && query.length >= 2 && suggestions.cities.length === 0 && suggestions.neighborhoods.length === 0 && suggestions.workspaces.length === 0 && (
            <div className="p-2 text-center text-muted-foreground">Nenhum resultado encontrado.</div>
          )}

          {suggestions.cities.length > 0 && (
            <div className="py-2">
              <h4 className="px-3 text-sm font-semibold text-muted-foreground">Cidades</h4>
              {suggestions.cities.map((item, index) => (
                <div
                  key={item.name + index}
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent"
                  onClick={() => handleSuggestionClick('city', item.name)}
                >
                  <div className="flex items-center gap-2">
                    {getSuggestionIcon('city')}
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}

          {suggestions.neighborhoods.length > 0 && (
            <div className="py-2 border-t">
              <h4 className="px-3 text-sm font-semibold text-muted-foreground">Bairros</h4>
              {suggestions.neighborhoods.map((item, index) => (
                <div
                  key={item.name + index}
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent"
                  onClick={() => handleSuggestionClick('neighborhood', item.name)}
                >
                  <div className="flex items-center gap-2">
                    {getSuggestionIcon('neighborhood')}
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}

          {suggestions.workspaces.length > 0 && (
            <div className="py-2 border-t">
              <h4 className="px-3 text-sm font-semibold text-muted-foreground">Espaços</h4>
              {suggestions.workspaces.map((item, index) => (
                <div
                  key={item.slug + index}
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent"
                  onClick={() => handleSuggestionClick('workspace', item.slug)}
                >
                  <div className="flex items-center gap-2">
                    {getSuggestionIcon('workspace')}
                    <span>{item.name}</span>
                    <span className="text-xs text-muted-foreground">({item.location})</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </form>
  );
};

export default SearchBar;

