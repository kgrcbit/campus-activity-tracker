import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit2, Trash2, X, Save, FileText, List } from 'lucide-react'; // Using lucide-react for icons

// --- MOCK DATA AND API SIMULATION ---
// This mock data simulates the templates you defined in your seeder.
const MOCK_TEMPLATES = [
    { id: '1', templateName: 'National_Hackathon', templateCategory: 'Technical', departmentId: 'CSE', 
      fields: [
          { fieldId: 'event_name', label: 'Event Name', type: 'text', required: true, placeholder: 'Hackathon Name' },
          { fieldId: 'date_start', label: 'Start Date', type: 'date', required: true },
          { fieldId: 'position_achieved', label: 'Position Achieved', type: 'select', required: false, options: ["Winner", "Participant"] },
      ] 
    },
    { id: '2', templateName: 'Industry_Internship', templateCategory: 'Professional', departmentId: 'General', 
      fields: [
          { fieldId: 'company_name', label: 'Company Name', type: 'text', required: true, placeholder: 'Company' },
          { fieldId: 'date_start', label: 'Start Date', type: 'date', required: true },
          { fieldId: 'proof_upload', label: 'Offer Letter', type: 'file', required: true },
      ]
    },
    { id: '3', templateName: 'Cultural_Festival_Participation', templateCategory: 'Cultural', departmentId: 'General', 
      fields: [
          { fieldId: 'activity_type', label: 'Activity Type', type: 'select', required: true, options: ["Dance", "Music", "Drama"] },
          { fieldId: 'position_achieved', label: 'Position Achieved', type: 'select', required: false, options: ["1st Place", "Participant"] },
      ]
    },
    // Include 17 more mock templates here...
];

// Mock API calls to simulate interaction with Naveen's backend
const mockAPI = {
    fetchTemplates: () => new Promise(resolve => setTimeout(() => resolve(MOCK_TEMPLATES), 500)),
    addTemplate: (newTemplate) => new Promise(resolve => setTimeout(() => resolve({ ...newTemplate, id: Date.now().toString() }), 500)),
    updateTemplate: (updatedTemplate) => new Promise(resolve => setTimeout(() => resolve(updatedTemplate), 500)),
    deleteTemplate: (id) => new Promise(resolve => setTimeout(() => resolve({ success: true, id }), 500)),
};
// --- END MOCK DATA ---


// Component to handle field definition within the template form
const FieldEditor = ({ field, index, updateField, removeField }) => {
    // Defines all possible field types based on your Mongoose schema
    const FIELD_TYPES = ['text', 'number', 'date', 'select', 'file', 'textarea'];

    return (
        <div className="border border-indigo-200 p-4 mb-3 rounded-lg bg-indigo-50 shadow-inner">
            <h4 className="font-semibold text-sm mb-2 text-indigo-700">Field #{index + 1}</h4>
            
            <div className="grid grid-cols-4 gap-3">
                {/* Field Label */}
                <input
                    type="text"
                    value={field.label || ''}
                    onChange={(e) => updateField(index, 'label', e.target.value)}
                    placeholder="Field Label (e.g., Company Name)"
                    className="p-2 border rounded-md col-span-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
                {/* Field Type */}
                <select
                    value={field.type || 'text'}
                    onChange={(e) => updateField(index, 'type', e.target.value)}
                    className="p-2 border rounded-md text-sm"
                    required
                >
                    {FIELD_TYPES.map(type => (
                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                </select>
                {/* Required Checkbox */}
                <div className="flex items-center justify-center border border-indigo-200 rounded-md bg-white">
                    <label className="text-xs text-gray-700 flex items-center p-2">
                        <input
                            type="checkbox"
                            checked={field.required || false}
                            onChange={(e) => updateField(index, 'required', e.target.checked)}
                            className="mr-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        Required
                    </label>
                </div>
            </div>

            <div className="mt-3">
                {/* Options for Select Type */}
                {(field.type === 'select') && (
                    <input
                        type="text"
                        value={field.options ? field.options.join(', ') : ''}
                        onChange={(e) => updateField(index, 'options', e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0))}
                        placeholder="Select Options (e.g., Option A, Option B, Option C)"
                        className="p-2 border rounded-md w-full text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                )}
            </div>

            <div className="text-right mt-3">
                <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="text-xs text-red-600 hover:text-red-800 transition duration-150"
                >
                    <Trash2 size={14} className="inline mr-1" /> Remove Field
                </button>
            </div>
        </div>
    );
};


// Main Admin Component
const AdminTemplateCRUD = () => {
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTemplateId, setCurrentTemplateId] = useState(null);

    // Form state for new/edited template
    const [formData, setFormData] = useState({
        templateName: '',
        templateCategory: 'Technical',
        fields: [],
    });

    // Fetches templates on load (Task 3: Integration for Reading Templates)
    const loadTemplates = async () => {
        setIsLoading(true);
        try {
            // MOCK CALL: Replace with actual axios.get('/api/templates') when Naveen is ready
            const data = await mockAPI.fetchTemplates();
            setTemplates(data);
        } catch (error) {
            console.error("Failed to fetch templates:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTemplates();
    }, []);

    // --- Template Management Logic ---
    
    // Opens the modal for adding a new template
    const handleAddTemplateClick = () => {
        setIsEditing(false);
        setCurrentTemplateId(null);
        setFormData({ templateName: '', templateCategory: 'Technical', fields: [] });
        setIsModalOpen(true);
    };

    // Opens the modal for editing an existing template
    const handleEditTemplateClick = (template) => {
        setIsEditing(true);
        setCurrentTemplateId(template.id);
        setFormData({
            templateName: template.templateName,
            templateCategory: template.templateCategory,
            fields: template.fields,
        });
        setIsModalOpen(true);
    };

    // Submits the form (Add or Edit)
    const handleSaveTemplate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (isEditing) {
                // MOCK CALL: Replace with actual axios.put(`/api/templates/${currentTemplateId}`, formData)
                await mockAPI.updateTemplate({ id: currentTemplateId, ...formData });
            } else {
                // MOCK CALL: Replace with actual axios.post('/api/templates', formData)
                await mockAPI.addTemplate(formData);
            }
            // Reload data and close modal
            await loadTemplates();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save template:", error);
        } finally {
            setIsSaving(false);
        }
    };
    
    // Handles deleting a template
    const handleDeleteTemplate = async (id) => {
        if (!window.confirm("Are you sure you want to delete this template? This cannot be undone.")) return;
        setIsLoading(true);
        try {
            // MOCK CALL: Replace with actual axios.delete(`/api/templates/${id}`)
            await mockAPI.deleteTemplate(id);
            await loadTemplates(); // Refresh the list
        } catch (error) {
            console.error("Failed to delete template:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Field Management Logic (Nested in Form) ---
    
    // Adds a new blank field to the form
    const handleAddField = () => {
        setFormData(prev => ({
            ...prev,
            fields: [
                ...prev.fields,
                { fieldId: `field_${prev.fields.length + 1}`, label: '', type: 'text', required: false, options: [] }
            ]
        }));
    };

    // Updates a specific property of a field
    const updateField = (index, key, value) => {
        const newFields = [...formData.fields];
        // Ensure fieldId is updated if label is changed (sanitized version of label)
        if (key === 'label') {
            newFields[index]['fieldId'] = value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        }
        newFields[index][key] = value;
        setFormData(prev => ({ ...prev, fields: newFields }));
    };

    // Removes a field by index
    const removeField = (index) => {
        setFormData(prev => ({
            ...prev,
            fields: prev.fields.filter((_, i) => i !== index)
        }));
    };

    // --- Component Rendering ---

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <List size={28} className="mr-3 text-indigo-600" />
                    Activity Template Manager
                </h1>
                <button
                    onClick={handleAddTemplateClick}
                    className="flex items-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
                >
                    <PlusCircle size={20} className="mr-2" />
                    New Template
                </button>
            </header>
            
            <p className="mb-6 text-gray-600">
                Manage the dynamic form schemas. Changes here provide template data to Rahul for the Dynamic Form Renderer.
            </p>

            {/* Template List Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fields Count</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr>
                                <td colSpan="4" className="text-center py-4 text-gray-500">Loading templates...</td>
                            </tr>
                        ) : templates.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-4 text-gray-500">No templates found. Add a new one!</td>
                            </tr>
                        ) : (
                            templates.map((template) => (
                                <tr key={template.id} className="hover:bg-gray-50 transition duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{template.templateName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.templateCategory}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.fields.length}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            type="button"
                                            onClick={() => handleEditTemplateClick(template)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                                        >
                                            <Edit2 size={18} className="inline mr-1" /> Edit
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => handleDeleteTemplate(template.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 size={18} className="inline mr-1" /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>


            {/* Template Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        
                        <header className="p-5 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800">
                                {isEditing ? 'Edit Template' : 'Create New Template'}
                            </h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </header>

                        <form onSubmit={handleSaveTemplate} className="p-6 space-y-6">
                            
                            {/* Template Metadata */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                                    <input
                                        id="templateName"
                                        type="text"
                                        value={formData.templateName}
                                        onChange={(e) => setFormData({...formData, templateName: e.target.value})}
                                        placeholder="e.g., National_Hackathon"
                                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="templateCategory" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        id="templateCategory"
                                        value={formData.templateCategory}
                                        onChange={(e) => setFormData({...formData, templateCategory: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    >
                                        <option value="Technical">Technical</option>
                                        <option value="Cultural">Cultural</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Research">Research</option>
                                        <option value="Professional">Professional Development</option>
                                        <option value="Community">Community/Volunteering</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* Dynamic Fields Section */}
                            <div className="space-y-4 pt-4 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <FileText size={20} className="mr-2 text-indigo-600" />
                                    Dynamic Form Fields ({formData.fields.length})
                                </h3>

                                <div className="space-y-4">
                                    {formData.fields.map((field, index) => (
                                        <FieldEditor
                                            key={field.fieldId || index}
                                            field={field}
                                            index={index}
                                            updateField={updateField}
                                            removeField={removeField}
                                        />
                                    ))}
                                </div>
                                
                                <button
                                    type="button"
                                    onClick={handleAddField}
                                    className="w-full flex items-center justify-center border border-dashed border-indigo-400 text-indigo-600 hover:bg-indigo-50 py-2 rounded-lg transition duration-200"
                                >
                                    <PlusCircle size={20} className="mr-2" /> Add New Field
                                </button>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end pt-4 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex items-center bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-green-700 transition duration-300 disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : <><Save size={20} className="mr-2" /> Save Template</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTemplateCRUD;