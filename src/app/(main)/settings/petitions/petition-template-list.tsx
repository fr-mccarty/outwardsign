"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { FileText, Edit, Plus } from "lucide-react";
import { deletePetitionTemplate, PetitionContextTemplate } from '@/lib/actions/petition-templates';
import { PETITION_MODULE_VALUES, PETITION_MODULE_LABELS, PETITION_LANGUAGE_VALUES, PETITION_LANGUAGE_LABELS } from '@/lib/constants';
import { toast } from 'sonner';
import { useRouter } from "next/navigation";
import { useBreadcrumbs } from '@/components/breadcrumb-context';
import {
  DataTable,
  DataTableColumn,
  DataTableHeader,
  DataTableRowActions,
} from '@/components/data-table';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PetitionTemplateListProps {
  templates: PetitionContextTemplate[];
}

export default function PetitionTemplateList({ templates }: PetitionTemplateListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("");
  const [languageFilter, setLanguageFilter] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const router = useRouter();
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Settings", href: "/settings" },
      { label: "Petition Templates" }
    ]);
  }, [setBreadcrumbs]);

  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (template.description || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by module
    if (moduleFilter) {
      filtered = filtered.filter(template => template.module === moduleFilter);
    }

    // Filter by language
    if (languageFilter) {
      filtered = filtered.filter(template => template.language === languageFilter);
    }

    return filtered;
  }, [templates, searchTerm, moduleFilter, languageFilter]);

  const openDeleteDialog = (templateId: string) => {
    setTemplateToDelete(templateId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;
    
    try {
      await deletePetitionTemplate(templateToDelete);
      toast.success("Template deleted successfully");
      router.refresh();
      setTemplateToDelete(null);
    } catch (error) {
      toast.error("Failed to delete template. Please try again.");
      throw error; // Re-throw so the dialog can handle the loading state
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getTemplateByTitle = (templateId: string) => {
    return templates.find(t => t.id === templateId);
  };

  const columns: DataTableColumn<PetitionContextTemplate>[] = [
    {
      key: "title",
      header: "Title",
      sortable: true,
      accessorFn: (template) => template.title,
      cell: (template) => (
        <span className="font-medium">{template.title}</span>
      ),
    },
    {
      key: "description",
      header: "Description",
      hiddenOn: "md",
      cell: (template) => (
        <span className="text-sm text-muted-foreground">
          {template.description || "No description"}
        </span>
      ),
    },
    {
      key: "module",
      header: "Module",
      hiddenOn: "lg",
      sortable: true,
      accessorFn: (template) => template.module || '',
      cell: (template) => (
        template.module ? (
          <Badge variant="outline">
            {PETITION_MODULE_LABELS[template.module as keyof typeof PETITION_MODULE_LABELS]?.en || template.module}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">All modules</span>
        )
      ),
    },
    {
      key: "language",
      header: "Language",
      hiddenOn: "lg",
      sortable: true,
      accessorFn: (template) => template.language || '',
      cell: (template) => (
        template.language ? (
          <Badge variant="secondary">
            {PETITION_LANGUAGE_LABELS[template.language as keyof typeof PETITION_LANGUAGE_LABELS]?.en || template.language}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )
      ),
    },
    {
      key: "created_at",
      header: "Created",
      hiddenOn: "xl",
      sortable: true,
      accessorFn: (template) => new Date(template.created_at),
      cell: (template) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(template.created_at)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-center",
      className: "text-center",
      cell: (template) => (
        <DataTableRowActions
          row={template}
          variant="hybrid"
          customActions={[
            {
              label: "Edit",
              icon: <Edit className="h-4 w-4" />,
              onClick: (row) => router.push(`/settings/petitions/${row.id}`)
            }
          ]}
          onDelete={(row) => openDeleteDialog(row.id)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTableHeader
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search templates..."
        actions={
          <div className="flex gap-2">
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All modules</SelectItem>
                {PETITION_MODULE_VALUES.map(module => (
                  <SelectItem key={module} value={module}>
                    {PETITION_MODULE_LABELS[module].en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All languages</SelectItem>
                {PETITION_LANGUAGE_VALUES.map(lang => (
                  <SelectItem key={lang} value={lang}>
                    {PETITION_LANGUAGE_LABELS[lang].en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button asChild size="sm">
              <Link href="/settings/petitions/create">
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Link>
            </Button>
          </div>
        }
      />

      <DataTable
        data={filteredTemplates}
        columns={columns}
        keyExtractor={(template) => template.id}
        emptyState={{
          icon: <FileText className="h-12 w-12 text-muted-foreground" />,
          title: searchTerm ? "No templates found" : "No templates yet",
          description: searchTerm
            ? "No templates found matching your search."
            : "No templates yet. Create your first template!",
          action: !searchTerm && (
            <Button asChild>
              <Link href="/settings/petitions/create">Create Template</Link>
            </Button>
          ),
        }}
      />
    
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Template"
        itemName={getTemplateByTitle(templateToDelete || '')?.title}
      />
    </div>
  );
}