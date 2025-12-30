import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, Plus, ArrowLeft, Edit, Trash2, DollarSign,
  MapPin, Clock, Users, CheckCircle, X
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function JobManagement() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    department: "operations",
    location: "Detroit, MI",
    job_type: "full_time",
    description: "",
    requirements: "",
    salary_range: "",
    approval_limit: 0,
    max_applications: 0
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.email !== SUPER_ADMIN_EMAIL && currentUser.role !== 'admin') {
          window.location.href = '/';
          return;
        }
        setUser(currentUser);
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  const { data: jobs } = useQuery({
    queryKey: ['job-postings-management'],
    queryFn: () => base44.entities.JobPosting.list("-created_date"),
    initialData: []
  });

  const { data: applications } = useQuery({
    queryKey: ['applications-count'],
    queryFn: () => base44.entities.CareerApplication.list(),
    initialData: []
  });

  const createJobMutation = useMutation({
    mutationFn: (data) => base44.entities.JobPosting.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['job-postings-management']);
      setShowForm(false);
      setEditingJob(null);
      setFormData({
        title: "",
        department: "operations",
        location: "Detroit, MI",
        job_type: "full_time",
        description: "",
        requirements: "",
        salary_range: "",
        approval_limit: 0,
        max_applications: 0
      });
    }
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.JobPosting.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['job-postings-management']);
      setShowForm(false);
      setEditingJob(null);
    }
  });

  const deleteJobMutation = useMutation({
    mutationFn: (id) => base44.entities.JobPosting.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['job-postings-management'])
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.JobPosting.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries(['job-postings-management'])
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingJob) {
      updateJobMutation.mutate({ id: editingJob.id, data: formData });
    } else {
      createJobMutation.mutate(formData);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      department: job.department,
      location: job.location,
      job_type: job.job_type,
      description: job.description,
      requirements: job.requirements,
      salary_range: job.salary_range,
      approval_limit: job.approval_limit || 0,
      max_applications: job.max_applications || 0
    });
    setShowForm(true);
  };

  const activeJobs = jobs.filter(j => j.status === 'active');
  const draftJobs = jobs.filter(j => j.status === 'draft');

  // Count applications per job
  const getApplicationCount = (jobTitle) => {
    return applications.filter(a => a.position_applied === jobTitle).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Briefcase className="w-10 h-10 text-blue-400" />
              Job Management System
            </h1>
            <p className="text-gray-400">Create, edit, and manage job postings with limits</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingJob(null);
              setFormData({
                title: "",
                department: "operations",
                location: "Detroit, MI",
                job_type: "full_time",
                description: "",
                requirements: "",
                salary_range: "",
                approval_limit: 0,
                max_applications: 0
              });
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Job
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Jobs</p>
            <p className="text-3xl font-bold text-white">{jobs.length}</p>
          </Card>
          <Card className="p-6 bg-green-900 border-green-700">
            <p className="text-green-200 text-sm mb-1">Active</p>
            <p className="text-3xl font-bold text-green-400">{activeJobs.length}</p>
          </Card>
          <Card className="p-6 bg-yellow-900 border-yellow-700">
            <p className="text-yellow-200 text-sm mb-1">Drafts</p>
            <p className="text-3xl font-bold text-yellow-400">{draftJobs.length}</p>
          </Card>
          <Card className="p-6 bg-blue-900 border-blue-700">
            <p className="text-blue-200 text-sm mb-1">Total Applications</p>
            <p className="text-3xl font-bold text-blue-400">{applications.length}</p>
          </Card>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Job Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    placeholder="e.g., Fleet Coordinator"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full p-2 rounded-lg bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="incidents">Incidents & Roadside</option>
                    <option value="operations">Operations & E-commerce</option>
                    <option value="fleet">Fleet & Logistics</option>
                    <option value="finance">Finance & HR</option>
                    <option value="support">Customer Support</option>
                    <option value="marketing">Marketing</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Detroit, MI"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Job Type</label>
                  <select
                    value={formData.job_type}
                    onChange={(e) => setFormData({...formData, job_type: e.target.value})}
                    className="w-full p-2 rounded-lg bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="full_time">Full-Time</option>
                    <option value="part_time">Part-Time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Salary Range</label>
                  <Input
                    value={formData.salary_range}
                    onChange={(e) => setFormData({...formData, salary_range: e.target.value})}
                    placeholder="$40,000 - $60,000"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">
                    Approval Limit (Spending Authority)
                  </label>
                  <Input
                    type="number"
                    value={formData.approval_limit}
                    onChange={(e) => setFormData({...formData, approval_limit: parseFloat(e.target.value)})}
                    placeholder="5000"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">Max amount employee can approve</p>
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">
                    Max Applications (0 = unlimited)
                  </label>
                  <Input
                    type="number"
                    value={formData.max_applications}
                    onChange={(e) => setFormData({...formData, max_applications: parseInt(e.target.value)})}
                    placeholder="0"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">Limit number of applicants</p>
                </div>

                <div className="md:col-span-2">
                  <label className="text-gray-300 text-sm mb-2 block">Job Description *</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    placeholder="Describe the role and responsibilities..."
                    className="bg-gray-700 border-gray-600 text-white h-32"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-gray-300 text-sm mb-2 block">Requirements</label>
                  <Textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                    placeholder="List qualifications, skills, experience..."
                    className="bg-gray-700 border-gray-600 text-white h-24"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingJob(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {editingJob ? 'Update Job' : 'Create Job'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Active Jobs Table */}
        <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Active Job Postings</h2>
          
          {activeJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">No active jobs</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Job Title</TableHead>
                  <TableHead className="text-gray-300">Department</TableHead>
                  <TableHead className="text-gray-300">Type</TableHead>
                  <TableHead className="text-gray-300">Applications</TableHead>
                  <TableHead className="text-gray-300">Approval Limit</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeJobs.map((job) => {
                  const appCount = getApplicationCount(job.title);
                  const maxApps = job.max_applications || 0;
                  const isLimitReached = maxApps > 0 && appCount >= maxApps;
                  
                  return (
                    <TableRow key={job.id} className="border-gray-700">
                      <TableCell className="text-white font-semibold">{job.title}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-600">{job.department}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-purple-600">{job.job_type.replace('_', '-')}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isLimitReached ? 'text-red-400' : 'text-green-400'}`}>
                            {appCount}
                          </span>
                          {maxApps > 0 && (
                            <span className="text-gray-400 text-sm">/ {maxApps}</span>
                          )}
                          {isLimitReached && (
                            <Badge className="bg-red-600 text-xs">FULL</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {job.approval_limit ? `$${job.approval_limit.toLocaleString()}` : 'None'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEdit(job)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => toggleStatusMutation.mutate({ id: job.id, status: 'closed' })}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            Close
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              if (confirm('Delete this job?')) {
                                deleteJobMutation.mutate(job.id);
                              }
                            }}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}