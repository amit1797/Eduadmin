import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { ApiError } from '@/types';

interface UseCRUDOptions<T> {
  queryKey: string[];
  fetchFn: () => Promise<T[]>;
  createFn: (data: any) => Promise<T>;
  updateFn: (id: string, data: any) => Promise<T>;
  deleteFn: (id: string) => Promise<void>;
  onSuccess?: {
    create?: (data: T) => void;
    update?: (data: T) => void;
    delete?: (id: string) => void;
  };
  onError?: {
    create?: (error: ApiError) => void;
    update?: (error: ApiError) => void;
    delete?: (error: ApiError) => void;
  };
}

export function useCRUD<T extends { id: string }>({
  queryKey,
  fetchFn,
  createFn,
  updateFn,
  deleteFn,
  onSuccess,
  onError
}: UseCRUDOptions<T>) {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Fetch data
  const {
    data: items = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: fetchFn,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createFn,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: 'Success', description: 'Item created successfully' });
      setIsModalOpen(false);
      onSuccess?.create?.(data);
    },
    onError: (error: ApiError) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to create item' });
      onError?.create?.(error);
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateFn(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: 'Success', description: 'Item updated successfully' });
      setIsModalOpen(false);
      setSelectedItem(null);
      onSuccess?.update?.(data);
    },
    onError: (error: ApiError) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to update item' });
      onError?.update?.(error);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteFn,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: 'Success', description: 'Item deleted successfully' });
      onSuccess?.delete?.(id);
    },
    onError: (error: ApiError) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete item' });
      onError?.delete?.(error);
    }
  });

  // Actions
  const openCreateModal = useCallback(() => {
    setModalMode('create');
    setSelectedItem(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((item: T) => {
    setModalMode('edit');
    setSelectedItem(item);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedItem(null);
  }, []);

  const handleCreate = useCallback((data: any) => {
    createMutation.mutate(data);
  }, [createMutation]);

  const handleUpdate = useCallback((data: any) => {
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data });
    }
  }, [selectedItem, updateMutation]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  return {
    // Data
    items,
    selectedItem,
    isLoading,
    error,
    
    // Modal state
    isModalOpen,
    modalMode,
    
    // Actions
    openCreateModal,
    openEditModal,
    closeModal,
    handleCreate,
    handleUpdate,
    handleDelete,
    refetch,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
