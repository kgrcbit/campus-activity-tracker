import React, { useState, useEffect } from 'react';
import { Filter, Download, User, Calendar, Table2 } from 'lucide-react';

// --- MOCK DATA ---
const MOCK_SUBMISSIONS = [
    { id: 'sub001', studentName: 'Priya Sharma', studentDept: 'CSE', templateName: 'National_Hackathon', submissionDate: '2025-10-22', status: 'Approved', positionAchieved: 'Winner', verificationStatus: { facultyVerified: true, adminApproved: true } },
    { id: 'sub002', studentName: 'Vikas Reddy', studentDept: 'ECE', templateName: 'Technical_Workshop', submissionDate: '2025-10-23', status: 'Pending', positionAchieved: 'Participant', verificationStatus: { facultyVerified: false, adminApproved: false } },
    { id: 'sub003', studentName: 'Aisha Khan', studentDept: 'IT', templateName: 'Industry_Internship', submissionDate: '2025-10-20', status: 'Rejected', positionAchieved: 'SDE Intern', verificationStatus: { facultyVerified: true, adminApproved: false } },
    { id: 'sub004', studentName: 'Gopi Krishna', studentDept: 'Mech', templateName: 'Inter_College_Sports', submissionDate: '2025-10-18', status: 'Verified by Faculty', positionAchieved: '1st Place (Badminton)', verificationStatus: { facultyVerified: true, adminApproved: false } },
];

const mockAPI = {
    // Mocks Naveen's filtered GET API
    fetchSubmissions: (filters) => {
        console.log("Fetching submissions with filters:", filters);
        return new Promise(resolve => setTimeout(() => resolve(MOCK_SUBMISSIONS), 500));
    },
    // Mocks Shravan's export API
    exportReport: (format, filters) => {
        console.log(`Exporting ${format} report with filters:`, filters);
        // Simulate a file download link return
        return Promise.resolve(`api/reports/download?format=${format}&...`);
    }
};
// --- END MOCK DATA ---


const AdminSubmissionsView = () => {
    const [submissions, setSubmissions] = useState([]);
    const [filters, setFilters] = useState({
        studentName: '',
        templateId: '', 
        dateRangeFrom: '', 
        dateRangeTo: '',
        department: '',
        status: 'All'
    });
    const [isLoading, setIsLoading] = useState(false);

    // Filter Logic
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const loadSubmissions = async () => {
        setIsLoading(true);
        try {
            // INTEGRATION POINT: Replace with actual axios.get('/api/submissions', { params: filters })
            const data = await mockAPI.fetchSubmissions(filters);
            setSubmissions(data);
        } catch (error) {
            console.error("Failed to fetch submissions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Export Logic (Task 2 & 3: Integrate export buttons using Shravan's API)
    const handleExport = async (format) => {
        alert(`Generating ${format} Report... This will use Shravan's /api/reports endpoint.`);
        try {
            // INTEGRATION POINT: Replace with actual axios call to Shravan's endpoint
            const downloadLink = await mockAPI.exportReport(format, filters);
            console.log("Download URL generated:", downloadLink);
        } catch (error) {
            console.error(`Failed to export ${format} report.`, error);
        }
    };

    useEffect(() => {
        loadSubmissions();
        // Dependency on filters state to auto-refetch when filters change
    }, [filters.studentName, filters.templateId, filters.department, filters.status, filters.dateRangeFrom, filters.dateRangeTo]); 

    // Define table columns
    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Student', accessor: 'studentName' },
        { header: 'Dept.', accessor: 'studentDept' },
        { header: 'Activity', accessor: 'templateName' },
        { header: 'Position/Role', accessor: 'positionAchieved' },
        { header: 'Date', accessor: 'submissionDate' },
        { header: 'Status', accessor: 'status', render: (status) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                status === 'Approved' ? 'bg-green-100 text-green-800' :
                status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                status === 'Verified by Faculty' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
            }`}>
                {status}
            </span>
        )},
        { header: 'Actions', accessor: 'actions', render: (row) => (
            // Button to open a detailed view modal
            <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                View Details / Verify
            </button>
        )},
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <Table2 size={28} className="mr-3 text-indigo-600" />
                Admin Submissions & Reporting
            </h1>
            
            <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <Filter size={20} className="mr-2 text-indigo-600" />
                    Report Filters
                </h2>
                
                {/* Filter Section (Using inputs as placeholders for Shiva's UI components) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2 border border-gray-300 rounded-lg p-2 bg-white">
                        <User size={18} className="text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Student Name/ID" 
                            value={filters.studentName}
                            onChange={(e) => handleFilterChange('studentName', e.target.value)}
                            className="p-1 w-full focus:outline-none"
                        />
                    </div>
                    
                    <select
                        value={filters.department}
                        onChange={(e) => handleFilterChange('department', e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">All Departments</option>
                        <option value="CSE">CSE</option>
                        <option value="ECE">ECE</option>
                        <option value="Mech">Mechanical</option>
                        <option value="IT">IT</option>
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Verified by Faculty">Verified by Faculty</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                    <select
                        value={filters.templateId}
                        onChange={(e) => handleFilterChange('templateId', e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">All Activity Types</option>
                        <option value="Hackathon">Hackathon</option>
                        <option value="Internship">Internship</option>
                        <option value="Workshop">Workshop</option>
                    </select>
                </div>
                
                {/* Date Range Filters */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2 border border-gray-300 rounded-lg p-2 bg-white col-span-2">
                        <Calendar size={18} className="text-gray-400" />
                        <label className="text-sm text-gray-600 mr-2">From:</label>
                        <input 
                            type="date" 
                            value={filters.dateRangeFrom}
                            onChange={(e) => handleFilterChange('dateRangeFrom', e.target.value)}
                            className="p-1 w-full focus:outline-none" 
                        />
                    </div>
                    <div className="flex items-center space-x-2 border border-gray-300 rounded-lg p-2 bg-white col-span-2">
                        <Calendar size={18} className="text-gray-400" />
                        <label className="text-sm text-gray-600 mr-2">To:</label>
                        <input 
                            type="date" 
                            value={filters.dateRangeTo}
                            onChange={(e) => handleFilterChange('dateRangeTo', e.target.value)}
                            className="p-1 w-full focus:outline-none" 
                        />
                    </div>
                </div>


                <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-200">
                    <button 
                        onClick={loadSubmissions} 
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Searching...' : 'Search Submissions'}
                    </button>
                    
                    {/* Export Buttons (Task 2: Integrate export buttons) */}
                    <div className="flex gap-3">
                        <button 
                            onClick={() => handleExport('CSV')} 
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                        >
                            <Download size={18} className="mr-2" /> Export CSV
                        </button>
                        <button 
                            onClick={() => handleExport('PDF')} 
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                        >
                            <Download size={18} className="mr-2" /> Export PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Submission Table */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Submission Results ({submissions.length})</h2>
                {isLoading ? (
                    <p className="text-center py-10 text-gray-500">Fetching data...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {columns.map(col => (
                                        <th key={col.header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {col.header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {submissions.map((row) => (
                                    <tr key={row.id}>
                                        {columns.map(col => (
                                            <td key={col.header} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {/* Use render function if provided, otherwise use accessor */}
                                                {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSubmissionsView;