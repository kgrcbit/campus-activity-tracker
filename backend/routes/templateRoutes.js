const express = require('express');
const router = express.Router();

// NOTE: These controller functions are placeholders.
// Naveen will create the actual logic in a separate file (e.g., backend/controllers/templateController.js)
const templateController = {
    // [GET] /api/templates
    // Used by Rahul's Dynamic Form Renderer and your Admin Template CRUD UI
    getTemplates: (req, res) => {
        // Mock Response: Should return the list of 20 templates from the DB
        res.status(200).json({ message: "Mock: Returning list of all activity templates." });
    },
    // [POST] /api/templates
    // Used by Admin to create a new template
    createTemplate: (req, res) => {
        // Mock: Should save the new template structure to the DB
        res.status(201).json({ message: "Mock: Activity template created successfully.", template: req.body });
    },
    // [PUT] /api/templates/:id
    // Used by Admin to edit an existing template
    updateTemplate: (req, res) => {
        // Mock: Should update the template in the DB
        res.status(200).json({ message: `Mock: Template ${req.params.id} updated successfully.`, updates: req.body });
    },
    // [DELETE] /api/templates/:id
    // Used by Admin to delete a template
    deleteTemplate: (req, res) => {
        // Mock: Should delete the template from the DB
        res.status(200).json({ message: `Mock: Template ${req.params.id} deleted successfully.` });
    },
};

// --- Route Definitions ---

// Base route for fetching all and creating new templates
router.route('/')
    .get(templateController.getTemplates) // GET /api/templates (Task 3: Provide data to Rahul)
    .post(templateController.createTemplate); // POST /api/templates (Task 2: CRUD - Add)

// Route for specific template operations
router.route('/:id')
    .put(templateController.updateTemplate) // PUT /api/templates/:id (Task 2: CRUD - Edit)
    .delete(templateController.deleteTemplate); // DELETE /api/templates/:id (Task 2: CRUD - Delete)

module.exports = router;
