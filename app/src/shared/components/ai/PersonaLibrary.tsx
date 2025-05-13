import React, { useState, useEffect } from 'react';
import { useAgentPersonas } from '@src/shared/hooks/ai/useAgentPersonas';
import { PersonaCategory, TraitCategory } from '@src/shared/types/entities/agentPersona';
import { Spinner } from '@src/shared/components/ui/Spinner';
import { Badge } from '@src/shared/components/ui/Badge';
import { Button } from '@src/shared/components/ui/Button';
import { Card } from '@src/shared/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/components/ui/Tabs';
import { Input } from '@src/shared/components/ui/Input';
import { Search, Plus, GitFork, Star, User, Users, Tag, Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface PersonaLibraryProps {
  onSelectPersona?: (personaId: string) => void;
  onCreatePersona?: () => void;
}

export const PersonaLibrary: React.FC<PersonaLibraryProps> = ({
  onSelectPersona,
  onCreatePersona,
}) => {
  const {
    personas,
    isLoadingPersonas,
    getPersonasByCategory,
    getPublicPersonas,
    getUserPersonas,
  } = useAgentPersonas();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Filter personas based on search term and category
  const filteredPersonas = React.useMemo(() => {
    if (!personas) return [];
    
    let filtered = personas;
    
    // Filter by tab
    if (activeTab === 'public') {
      filtered = getPublicPersonas();
    } else if (activeTab === 'my') {
      filtered = getUserPersonas();
    }
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(persona => persona.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        persona => 
          persona.name.toLowerCase().includes(term) ||
          persona.description.toLowerCase().includes(term) ||
          persona.role.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [personas, searchTerm, selectedCategory, activeTab, getPublicPersonas, getUserPersonas]);

  // Group personas by category
  const personasByCategory = React.useMemo(() => {
    const categories: Record<string, typeof personas> = {};
    
    if (filteredPersonas) {
      filteredPersonas.forEach(persona => {
        if (!categories[persona.category]) {
          categories[persona.category] = [];
        }
        categories[persona.category].push(persona);
      });
    }
    
    return categories;
  }, [filteredPersonas]);

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Initialize expanded categories
  useEffect(() => {
    if (personasByCategory) {
      const initialExpanded: Record<string, boolean> = {};
      Object.keys(personasByCategory).forEach(category => {
        initialExpanded[category] = true;
      });
      setExpandedCategories(initialExpanded);
    }
  }, [personasByCategory]);

  // Handle persona selection
  const handleSelectPersona = (personaId: string) => {
    if (onSelectPersona) {
      onSelectPersona(personaId);
    }
  };

  // Handle create persona
  const handleCreatePersona = () => {
    if (onCreatePersona) {
      onCreatePersona();
    }
  };

  // Render category badges
  const renderCategoryBadges = () => {
    return Object.values(PersonaCategory).map(category => (
      <Badge
        key={category}
        variant={selectedCategory === category ? 'default' : 'outline'}
        className="cursor-pointer mr-2 mb-2"
        onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
      >
        {category.replace('_', ' ')}
      </Badge>
    ));
  };

  // Render persona card
  const renderPersonaCard = (persona: any) => (
    <Card 
      key={persona.id} 
      className="p-4 mb-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
      onClick={() => handleSelectPersona(persona.id)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{persona.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{persona.role}</p>
        </div>
        <div className="flex items-center space-x-2">
          {persona.isPublic && (
            <Badge variant="secondary" className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              Public
            </Badge>
          )}
          {persona.isVerified && (
            <Badge variant="success" className="flex items-center">
              <Star className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </div>
      <p className="mt-2 text-sm line-clamp-2">{persona.description}</p>
      <div className="mt-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {persona.category}
          </Badge>
          {persona.traits && (
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <Tag className="h-3 w-3 mr-1" />
              {persona.traits.length} traits
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {persona._count?.forks > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <GitFork className="h-3 w-3 mr-1" />
              {persona._count.forks}
            </span>
          )}
          {persona._count?.agents > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <User className="h-3 w-3 mr-1" />
              {persona._count.agents}
            </span>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Agent Personas Library</h2>
        <Button onClick={handleCreatePersona} className="flex items-center">
          <Plus className="h-4 w-4 mr-1" />
          Create Persona
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search personas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center mb-2">
          <Filter className="h-4 w-4 mr-2 text-gray-500" />
          <span className="text-sm font-medium">Filter by category:</span>
        </div>
        <div className="flex flex-wrap">
          {renderCategoryBadges()}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Personas</TabsTrigger>
          <TabsTrigger value="public">Public Library</TabsTrigger>
          <TabsTrigger value="my">My Personas</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoadingPersonas ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : filteredPersonas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No personas found. Try adjusting your filters or create a new persona.
            </div>
          ) : (
            Object.entries(personasByCategory).map(([category, categoryPersonas]) => (
              <div key={category} className="mb-6">
                <div 
                  className="flex items-center justify-between cursor-pointer mb-2"
                  onClick={() => toggleCategory(category)}
                >
                  <h3 className="text-lg font-medium capitalize">{category.replace('_', ' ')}</h3>
                  {expandedCategories[category] ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
                {expandedCategories[category] && (
                  <div>
                    {categoryPersonas.map(renderPersonaCard)}
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="public" className="space-y-4">
          {isLoadingPersonas ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : getPublicPersonas().length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No public personas found.
            </div>
          ) : (
            Object.entries(personasByCategory).map(([category, categoryPersonas]) => (
              <div key={category} className="mb-6">
                <div 
                  className="flex items-center justify-between cursor-pointer mb-2"
                  onClick={() => toggleCategory(category)}
                >
                  <h3 className="text-lg font-medium capitalize">{category.replace('_', ' ')}</h3>
                  {expandedCategories[category] ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
                {expandedCategories[category] && (
                  <div>
                    {categoryPersonas.map(renderPersonaCard)}
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="my" className="space-y-4">
          {isLoadingPersonas ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : getUserPersonas().length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              You haven't created any personas yet. Create your first persona to get started.
            </div>
          ) : (
            Object.entries(personasByCategory).map(([category, categoryPersonas]) => (
              <div key={category} className="mb-6">
                <div 
                  className="flex items-center justify-between cursor-pointer mb-2"
                  onClick={() => toggleCategory(category)}
                >
                  <h3 className="text-lg font-medium capitalize">{category.replace('_', ' ')}</h3>
                  {expandedCategories[category] ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
                {expandedCategories[category] && (
                  <div>
                    {categoryPersonas.map(renderPersonaCard)}
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
