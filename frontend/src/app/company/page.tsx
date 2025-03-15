"use client"

import { useEffect, useState } from "react";
import { CompanyResponse } from "@/lib/apiTypes";
import { getCompanies, createCompany, updateCompany } from "@/lib/api";
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
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyResponse | null>(null);
  const [newFact, setNewFact] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await getCompanies();
      setCompanies(data);
      if (data.length > 0 && !selectedCompany) {
        setSelectedCompany(data[0]);
      }
    } catch (error) {
      toast.error("Failed to load companies");
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
      await loadCompanies();
      toast.success("Company updated successfully");
    } catch (error) {
      toast.error("Failed to update company");
    }
  };

  const handleCreateNewCompany = async () => {
    if (!companyName.trim()) {
      toast.error("Please enter a company name");
      return;
    }

    try {
      await createCompany({
        name: companyName,
        facts: []
      });
      setCompanyName("");
      setIsCreatingNew(false);
      await loadCompanies();
      toast.success("Company created successfully");
    } catch (error) {
      toast.error("Failed to create company");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Company Information</h1>
        <Button
          onClick={() => setIsCreatingNew(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Company
        </Button>
      </div>

      {isCreatingNew && (
        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Create New Company</h2>
          <div className="flex gap-4">
            <Input
              placeholder="Enter company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <Button onClick={handleCreateNewCompany}>Create</Button>
            <Button variant="outline" onClick={() => setIsCreatingNew(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {companies.length > 0 && (
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-1">
            <div className="space-y-2">
              {companies.map((company) => (
                <Button
                  key={company.id}
                  variant={selectedCompany?.id === company.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCompany(company)}
                >
                  {company.name}
                </Button>
              ))}
            </div>
          </div>

          {selectedCompany && (
            <div className="col-span-3">
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
      )}
    </div>
  );
} 