import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Briefcase, ArrowLeft, Plus, MapPin, Clock, DollarSign, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function JobBoard() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    department: "operations",
    location: "Detroit, MI",
    job_type: "full_time",
    description: "",
    requirements: "",
    salary_range: ""
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

  const { data: jobPostings } = useQuery({
    queryKey: ['job-postings'],
    queryFn: () => base44.entities.JobPosting.list("-created_date"),
    initialData: []
  });

  const createJobMutation = useMutation({
    mutationFn: (data) => base44.entities.JobPosting.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['job-postings']);
      setShowForm(false);
      setFormData({
        title: "",
        department: "operations",
        location: "Detroit, MI",
        job_type: "full_time",
        description: "",
        requirements: "",
        salary_range: ""
      });
    }
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.JobPosting.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['job-postings'])
  });

  const deleteJobMutation = useMutation({
    mutationFn: (id) => base44.entities.JobPosting.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['job-postings'])
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
    createJobMutation.mutate(formData);
  };

  const activeJobs = jobPostings.filter(j => j.status === 'active');
  const draftJobs = jobPostings.filter(j => j.status === 'draft');
  const closedJobs = jobPostings.filter(j => j.status === 'closed');

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
              Job Board Management
            </h1>
            <p className="text-gray-400">Post and manage career opportunities</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Post New Job
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Postings</p>
            <p className="text-3xl font-bold text-white">{jobPostings.length}</p>
          </Card>
          <Card className="p-6 bg-green-900 border-green-700">
            <p className="text-green-200 text-sm mb-1">Active Jobs</p>
            <p className="text-3xl font-bold text-green-400">{activeJobs.length}</p>
          </Card>
          <Card className="p-6 bg-yellow-900 border-yellow-700">
            <p className="text-yellow-200 text-sm mb-1">Drafts</p>
            <p className="text-3xl font-bold text-yellow-400">{draftJobs.length}</p>
          </Card>
          <Card className="p-6 bg-gray-700 border-gray-600">
            <p className="text-gray-300 text-sm mb-1">Total Applications</p>
            <p className="text-3xl font-bold text-white">
              {jobPostings.reduce((sum, job) => sum + (job.applications_count || 0), 0)}
            </p>
          </Card>
        </div>

        {/* Create Form */}
        {showForm && (
          <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Create Job Posting</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Job Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    placeholder="e.g., Senior Operations Manager"
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
                    <option value="other">Other</option>
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
                    <option value="temporary">Temporary</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-gray-300 text-sm mb-2 block">Salary Range</label>
                  <Input
                    value={formData.salary_range}
                    onChange={(e) => setFormData({...formData, salary_range: e.target.value})}
                    placeholder="$50,000 - $70,000"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-gray-300 text-sm mb-2 block">Job Description *</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    placeholder="Describe the role, responsibilities, and what the candidate will do..."
                    className="bg-gray-700 border-gray-600 text-white h-32"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-gray-300 text-sm mb-2 block">Requirements</label>
                  <Textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                    placeholder="List qualifications, skills, and experience needed..."
                    className="bg-gray-700 border-gray-600 text-white h-24"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Post Job
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Active Jobs */}
        <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Active Job Postings</h2>
          
          {activeJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">No active job postings</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Job Title</TableHead>
                  <TableHead className="text-gray-300">Department</TableHead>
                  <TableHead className="text-gray-300">Location</TableHead>
                  <TableHead className="text-gray-300">Type</TableHead>
                  <TableHead className="text-gray-300">Applications</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeJobs.map((job) => (
                  <TableRow key={job.id} className="border-gray-700">
                    <TableCell className="text-white font-semibold">{job.title}</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-600">{job.department}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-400 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-purple-600">{job.job_type.replace('_', '-')}</Badge>
                    </TableCell>
                    <TableCell className="text-green-400 font-bold">
                      {job.applications_count || 0}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateJobMutation.mutate({ id: job.id, data: { status: 'closed' } })}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          Close
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm('Delete this job posting?')) {
                              deleteJobMutation.mutate(job.id);
                            }
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Closed Jobs */}
        {closedJobs.length > 0 && (
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Closed Positions</h2>
            <div className="space-y-3">
              {closedJobs.map((job) => (
                <div key={job.id} className="p-4 bg-gray-700 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{job.title}</p>
                    <p className="text-sm text-gray-400">{job.department} • {job.applications_count || 0} applications</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => updateJobMutation.mutate({ id: job.id, data: { status: 'active' } })}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Reopen
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}