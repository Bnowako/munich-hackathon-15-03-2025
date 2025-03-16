"use client"

import { useEffect, useState } from "react";
import { CompanyResponse } from "@/lib/apiTypes";
import { updateCompany, getCurrentCompany, updateCompanyWithRunningText } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, Save, Trash, Pencil, X, RefreshCw, Bot, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function CompanyPage() {
  const [selectedCompany, setSelectedCompany] = useState<CompanyResponse | null>(null);
  const [newFact, setNewFact] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [selectedFactIndex, setSelectedFactIndex] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  useEffect(() => {
    loadCurrentCompany();
  }, []);

  const loadCurrentCompany = async () => {
    try {
      const currentCompany = await getCurrentCompany();
      if (currentCompany) {
        setSelectedCompany(currentCompany);
      }
    } catch (error) {
      toast.error("Failed to load current company");
    }
  };

  const handleAddFact = () => {
    if (!newFact.trim()) return;
    
    if (selectedCompany) {
      const updatedCompany = {
        ...selectedCompany,
        facts: [...selectedCompany.facts, newFact]
      };
      handleSaveCompany(updatedCompany);
    }
    setNewFact("");
    setSelectedFactIndex(null);
  };

  const handleUpdateWithAI = async () => {
    if (!selectedCompany || !newFact.trim()) return;
    
    try {
      setIsUpdating(true);
      await updateCompanyWithRunningText(selectedCompany.id, newFact);
      await loadCurrentCompany();
      setNewFact("");
      setSelectedFactIndex(null);
      toast.success("AI update triggered successfully");
    } catch (error) {
      toast.error("Failed to trigger AI update");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateSelectedFact = () => {
    if (!selectedCompany || selectedFactIndex === null || !newFact.trim()) return;
    
    const updatedFacts = [...selectedCompany.facts];
    updatedFacts[selectedFactIndex] = newFact;
    
    const updatedCompany = {
      ...selectedCompany,
      facts: updatedFacts
    };
    handleSaveCompany(updatedCompany);
    setNewFact("");
    setSelectedFactIndex(null);
  };

  const handleDeleteFact = (index: number) => {
    if (!selectedCompany) return;
    
    const updatedFacts = selectedCompany.facts.filter((_, i) => i !== index);
    const updatedCompany = {
      ...selectedCompany,
      facts: updatedFacts
    };
    handleSaveCompany(updatedCompany);
    if (selectedFactIndex === index) {
      setSelectedFactIndex(null);
      setNewFact("");
    }
  };

  const handleEditFact = (index: number) => {
    if (!selectedCompany) return;
    setEditingIndex(index);
    setEditingValue(selectedCompany.facts[index]);
  };

  const handleSelectFact = (index: number) => {
    if (!selectedCompany) return;
    setSelectedFactIndex(index);
    setNewFact(selectedCompany.facts[index]);
  };

  const handleSaveEdit = () => {
    if (!selectedCompany || editingIndex === null || !editingValue.trim()) return;
    
    const updatedFacts = [...selectedCompany.facts];
    updatedFacts[editingIndex] = editingValue;
    
    const updatedCompany = {
      ...selectedCompany,
      facts: updatedFacts
    };
    handleSaveCompany(updatedCompany);
    setEditingIndex(null);
    setEditingValue("");
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  const handleSaveCompany = async (company: CompanyResponse) => {
    try {
      const updated = await updateCompany(company.id, {
        name: company.name,
        facts: company.facts
      });
      setSelectedCompany(updated);
      await loadCurrentCompany();
      toast.success("Company updated successfully");
    } catch (error) {
      toast.error("Failed to update company");
    }
  };

  const filteredFacts = selectedCompany?.facts.filter(fact =>
    fact.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const totalPages = Math.ceil(filteredFacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFacts = filteredFacts.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {selectedCompany ? `Company Profile` : "Loading..."}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">TenderPilot bases it's evalation on the facts saved in this profile.</p>
      </div>

      {selectedCompany && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{selectedCompany.name}</h2>
          
          <div className="mb-4 flex gap-2">
            <Input
              placeholder={selectedFactIndex !== null ? "Update selected fact" : "Add new fact or enter text for AI update"}
              value={newFact}
              onChange={(e) => setNewFact(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  selectedFactIndex !== null ? handleUpdateSelectedFact() : handleAddFact();
                }
              }}
            />
            {selectedFactIndex !== null ? (
              <>
                <Button onClick={handleUpdateSelectedFact} variant="secondary">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button onClick={() => {
                  setSelectedFactIndex(null);
                  setNewFact("");
                }} variant="ghost">
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleAddFact}
                  disabled={!newFact.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={handleUpdateWithAI} 
                  variant="secondary"
                  disabled={isUpdating || !newFact.trim()}
                >
                  <Bot className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search facts..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fact</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedFacts.map((fact, index) => (
                <TableRow 
                  key={startIndex + index} 
                  className={selectedFactIndex === (startIndex + index) ? "bg-muted" : ""}
                  onClick={() => handleSelectFact(startIndex + index)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    {editingIndex === (startIndex + index) ? (
                      <Input
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
                        className="w-full"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      fact
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {editingIndex === (startIndex + index) ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEdit();
                            }}
                          >
                            <Save className="w-4 h-4 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEdit();
                            }}
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditFact(startIndex + index);
                            }}
                          >
                            <Pencil className="w-4 h-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFact(startIndex + index);
                            }}
                          >
                            <Trash className="w-4 h-4 text-red-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 