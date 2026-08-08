import React, { useState } from 'react';
import { X, Plus, Trash2, Palette, Check } from 'lucide-react';
import type { CategoryConfig } from '../types/timetable';
import { generateCategoryColors } from '../constants/categories';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryConfig[];
  onSaveCategories: (newCategories: CategoryConfig[]) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategories,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [newCatHex, setNewCatHex] = useState('#3B82F6');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editHex, setEditHex] = useState('#3B82F6');

  if (!isOpen) return null;

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    // Check duplicate
    if (categories.some((c) => c.name.toLowerCase() === newCatName.trim().toLowerCase())) {
      alert('A category with this name already exists.');
      return;
    }

    const { color, borderColor, textColor } = generateCategoryColors(newCatHex);
    const newCategory: CategoryConfig = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      color,
      borderColor,
      textColor,
    };

    onSaveCategories([...categories, newCategory]);
    setNewCatName('');
    setNewCatHex('#3B82F6');
  };

  const handleStartEdit = (cat: CategoryConfig) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditHex(cat.borderColor || '#3B82F6');
  };

  const handleSaveEdit = (catId: string) => {
    if (!editName.trim()) return;

    const { color, borderColor, textColor } = generateCategoryColors(editHex);
    const updated = categories.map((cat) => {
      if (cat.id === catId) {
        return {
          ...cat,
          name: editName.trim(),
          color,
          borderColor,
          textColor,
        };
      }
      return cat;
    });

    onSaveCategories(updated);
    setEditingId(null);
  };

  const handleDeleteCategory = (catId: string) => {
    if (categories.length <= 1) {
      alert('You must have at least one category.');
      return;
    }
    onSaveCategories(categories.filter((c) => c.id !== catId));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content category-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <Palette className="icon-sm" /> Manage Categories & Colors
          </h3>
          <button className="btn-modal-close" onClick={onClose}>
            <X className="icon-sm" />
          </button>
        </div>

        <div className="modal-body">
          {/* Add New Category Form */}
          <form onSubmit={handleAddCategory} className="add-category-box">
            <h4 className="box-section-title">Add New Category</h4>
            <div className="add-category-row">
              <input
                type="text"
                className="form-input flex-1"
                placeholder="Category Name (e.g. Aptitude, ML)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
              />

              <div className="color-picker-wrapper" title="Pick Accent Color">
                <input
                  type="color"
                  className="color-input"
                  value={newCatHex}
                  onChange={(e) => setNewCatHex(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary">
                <Plus className="icon-xs" />
                <span>Add</span>
              </button>
            </div>
          </form>

          {/* List of Existing Categories */}
          <div className="existing-categories-box">
            <h4 className="box-section-title">Your Categories</h4>
            <div className="categories-manage-list">
              {categories.map((cat) => {
                const isEditing = editingId === cat.id;

                return (
                  <div key={cat.id} className="category-manage-item">
                    {isEditing ? (
                      <div className="category-edit-row">
                        <input
                          type="text"
                          className="form-input flex-1"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          autoFocus
                        />
                        <input
                          type="color"
                          className="color-input"
                          value={editHex}
                          onChange={(e) => setEditHex(e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => handleSaveEdit(cat.id)}
                        >
                          <Check className="icon-xs" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="category-item-preview">
                          <span
                            className="cat-badge-sample"
                            style={{
                              backgroundColor: cat.color,
                              borderColor: cat.borderColor,
                              color: cat.textColor,
                            }}
                          >
                            {cat.name}
                          </span>
                        </div>

                        <div className="category-item-actions">
                          <button
                            type="button"
                            className="btn-secondary-sm"
                            onClick={() => handleStartEdit(cat)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-danger-icon"
                            onClick={() => handleDeleteCategory(cat.id)}
                            title="Delete category"
                          >
                            <Trash2 className="icon-xs" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <div className="spacer" />
          <button type="button" className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
