"use client"

import { useEffect, useState } from "react";
import { CompanyResponse } from "@/lib/apiTypes";
import { updateCompany, getCurrentCompany } from "@/lib/api";
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
import { Plus, Save, Trash } from "lucide-react";
import { toast } from "sonner";

export default function CompanyPage() {
  const [selectedCompany, setSelectedCompany] = useState<CompanyResponse | null>(null);
  const [newFact, setNewFact] = useState("");
  
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
  };

  const handleDeleteFact = (index: number) => {
    if (!selectedCompany) return;
    
    const updatedFacts = selectedCompany.facts.filter((_, i) => i !== index);
    const updatedCompany = {
      ...selectedCompany,
      facts: updatedFacts
    };
    handleSaveCompany(updatedCompany);
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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {selectedCompany ? `Company Profile` : "Loading..."}
        </h1>
      </div>

      {selectedCompany && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{selectedCompany.name}</h2>
          
          <div className="mb-4 flex gap-2">
            <Input
              placeholder="Add new fact"
              value={newFact}
              onChange={(e) => setNewFact(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddFact()}
            />
            <Button onClick={handleAddFact}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fact</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedCompany.facts.map((fact, index) => (
                <TableRow key={index}>
                  <TableCell>{fact}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFact(index)}
                    >
                      <Trash className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 