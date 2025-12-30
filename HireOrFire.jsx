import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  UserCheck, UserX, ArrowLeft, Eye, Download, Calendar,
  CheckCircle, X, Clock, AlertTriangle, Briefcase
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function HireOrFire() {
  const [user, setUser] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
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

  const { data: applications } = useQuery({
    queryKey: ['career-applications'],
    queryFn: () => base44.entities.CareerApplication.list("-created_date"),
    initialData: []
  });

  const { data: activityLogs } = useQuery({
    queryKey: ['hiring-activity'],
    queryFn: () => base44.entities.ActivityLog.filter({ 
      action_type: { $in: ["hire", "reject_candidate"] }
    }, "-created_date", 50),
    initialData: []
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CareerApplication.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['career-applications']);
      setSelectedApplication(null);
      setReviewNotes("");
      setRejectionReason("");
    }
  });

  const hireMutation = useMutation({
    mutationFn: async ({ applicationId, application }) => {
      // Update application status
      await base44.entities.CareerApplication.update(applicationId, {
        status: "hired",
        reviewed_by: user.email,
        review_notes: reviewNotes,
        hired_date: new Date().toISOString().split('T')[0]
      });

      // Log activity
      await base44.entities.ActivityLog.create({
        user_email: user.email,
        action_type: "hire",
        action_details: `Hired ${application.applicant_name} for ${application.position_applied}`,
        related_entity_id: applicationId,
        entity_type: "CareerApplication"
      });

      // Send hiring email
      await base44.integrations.Core.SendEmail({
        to: application.applicant_email,
        subject: "Congratulations! You're Hired at STOCRX",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">🎉 Congratulations!</h1>
            </div>
            <div style="padding: 30px; background: white;">
              <p>Dear ${application.applicant_name},</p>
              <p>We are thrilled to offer you the position of <strong>${application.position_applied}</strong> at STOCRX!</p>
              <p><strong>Department:</strong> ${application.department}</p>
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Review and sign the employment contract (attached)</li>
                <li>Complete onboarding paperwork</li>
                <li>Schedule your first day</li>
              </ol>
              <p>We look forward to having you on our team!</p>
              <p><strong>Reviewer Notes:</strong><br/>${reviewNotes || 'Welcome to the team!'}</p>
              <p>Best regards,<br/>STOCRX HR Team</p>
            </div>
          </div>
        `
      });

      // Notify admin
      await base44.integrations.Core.SendEmail({
        to: SUPER_ADMIN_EMAIL,
        subject: `New Hire: ${application.applicant_name}`,
        body: `
          ${application.applicant_name} has been hired for ${application.position_applied}.
          
          Hired by: ${user.email}
          Date: ${new Date().toLocaleDateString()}
          Notes: ${reviewNotes}
          
          Next steps: Onboarding process
        `
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['career-applications']);
      queryClient.invalidateQueries(['hiring-activity']);
      setSelectedApplication(null);
      setReviewNotes("");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ applicationId, application }) => {
      // Update application status
      await base44.entities.CareerApplication.update(applicationId, {
        status: "rejected",
        reviewed_by: user.email,
        review_notes: reviewNotes,
        rejection_reason: rejectionReason
      });

      // Log activity
      await base44.entities.ActivityLog.create({
        user_email: user.email,
        action_type: "reject_candidate",
        action_details: `Rejected ${application.applicant_name} for ${application.position_applied}. Reason: ${rejectionReason}`,
        related_entity_id: applicationId,
        entity_type: "CareerApplication"
      });

      // Send rejection email
      await base44.integrations.Core.SendEmail({
        to: application.applicant_email,
        subject: "STOCRX Application Update",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f3f4f6; padding: 30px; text-align: center;">
              <h1 style="color: #374151; margin: 0;">Application Update</h1>
            </div>
            <div style="padding: 30px; background: white;">
              <p>Dear ${application.applicant_name},</p>
              <p>Thank you for your interest in the <strong>${application.position_applied}</strong> position at STOCRX.</p>
              <p>After careful review, we have decided to move forward with other candidates at this time.</p>
              <p>We appreciate the time you took to apply and wish you the best in your job search.</p>
              <p>Please feel free to apply for future openings that match your qualifications.</p>
              <p>Best regards,<br/>STOCRX HR Team</p>
            </div>
          </div>
        `
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['career-applications']);
      queryClient.invalidateQueries(['hiring-activity']);
      setSelectedApplication(null);
      setReviewNotes("");
      setRejectionReason("");
    }
  });

  const scheduleInterviewMutation = useMutation({
    mutationFn: async ({ applicationId, application }) => {
      await base44.entities.CareerApplication.update(applicationId, {
        status: "interviewed",
        interview_date: interviewDate,
        reviewed_by: user.email,
        review_notes: reviewNotes
      });

      await base44.integrations.Core.SendEmail({
        to: application.applicant_email,
        subject: "Interview Scheduled - STOCRX",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Interview Scheduled</h1>
            </div>
            <div style="padding: 30px; background: white;">
              <p>Dear ${application.applicant_name},</p>
              <p>Great news! We would like to invite you for an interview for the <strong>${application.position_applied}</strong> position.</p>
              <p><strong>Interview Date:</strong> ${new Date(interviewDate).toLocaleDateString()}</p>
              <p><strong>Department:</strong> ${application.department}</p>
              <p>We'll send you more details (time, location, format) shortly.</p>
              <p>Please confirm your availability by replying to this email.</p>
              <p>Best regards,<br/>STOCRX HR Team</p>
            </div>
          </div>
        `
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['career-applications']);
      setSelectedApplication(null);
      setInterviewDate("");
      setReviewNotes("");
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pendingApps = applications.filter(a => a.status === 'pending');
  const underReviewApps = applications.filter(a => a.status === 'under_review');
  const interviewedApps = applications.filter(a => a.status === 'interviewed');
  const hiredApps = applications.filter(a => a.status === 'hired');
  const rejectedApps = applications.filter(a => a.status === 'rejected');

  // Calculate days remaining until auto-deletion
  const getDaysRemaining = (application) => {
    if (!application.created_date) return application.days_until_deletion || 30;
    const created = new Date(application.created_date);
    const deleteDate = new Date(created);
    deleteDate.setDate(deleteDate.getDate() + (application.days_until_deletion || 30));
    const today = new Date();
    const daysLeft = Math.ceil((deleteDate - today) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
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

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Briefcase className="w-10 h-10 text-blue-400" />
            Hire or Fire - Application Review
          </h1>
          <p className="text-gray-400">Review career applications and make hiring decisions</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-400">{pendingApps.length}</p>
          </Card>
          <Card className="p-6 bg-gray-800 border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Under Review</p>
            <p className="text-3xl font-bold text-blue-400">{underReviewApps.length}</p>
          </Card>
          <Card className="p-6 bg-gray-800 border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Interviewed</p>
            <p className="text-3xl font-bold text-purple-400">{interviewedApps.length}</p>
          </Card>
          <Card className="p-6 bg-green-900 border-green-700">
            <p className="text-green-200 text-sm mb-1">Hired</p>
            <p className="text-3xl font-bold text-green-400">{hiredApps.length}</p>
          </Card>
          <Card className="p-6 bg-red-900 border-red-700">
            <p className="text-red-200 text-sm mb-1">Rejected</p>
            <p className="text-3xl font-bold text-red-400">{rejectedApps.length}</p>
          </Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800 mb-8">
            <TabsTrigger value="pending">Pending ({pendingApps.length})</TabsTrigger>
            <TabsTrigger value="review">Review ({underReviewApps.length})</TabsTrigger>
            <TabsTrigger value="interview">Interview ({interviewedApps.length})</TabsTrigger>
            <TabsTrigger value="hired">Hired ({hiredApps.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedApps.length})</TabsTrigger>
          </TabsList>

          {/* Pending Applications */}
          <TabsContent value="pending">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Pending Applications</h2>
              
              {pendingApps.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">No pending applications</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Applicant</TableHead>
                      <TableHead className="text-gray-300">Position</TableHead>
                      <TableHead className="text-gray-300">Department</TableHead>
                      <TableHead className="text-gray-300">Experience</TableHead>
                      <TableHead className="text-gray-300">Applied</TableHead>
                      <TableHead className="text-gray-300">Auto-Delete</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingApps.map((app) => {
                      const daysLeft = getDaysRemaining(app);
                      return (
                        <TableRow key={app.id} className="border-gray-700">
                          <TableCell className="text-white">
                            <p className="font-semibold">{app.applicant_name}</p>
                            <p className="text-sm text-gray-400">{app.applicant_email}</p>
                          </TableCell>
                          <TableCell className="text-gray-300">{app.position_applied}</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-600">{app.department}</Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">{app.years_experience || 'N/A'}</TableCell>
                          <TableCell className="text-gray-400 text-sm">
                            {app.created_date && new Date(app.created_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              daysLeft <= 3 ? 'bg-red-600' :
                              daysLeft <= 7 ? 'bg-yellow-600' : 'bg-green-600'
                            }>
                              {daysLeft} days
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedApplication(app);
                                  updateStatusMutation.mutate({
                                    id: app.id,
                                    data: { status: 'under_review', reviewed_by: user.email }
                                  });
                                }}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Review
                              </Button>
                              {app.resume_url && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(app.resume_url, '_blank')}
                                  className="border-gray-600"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          {/* Under Review */}
          <TabsContent value="review">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Under Review</h2>

              {selectedApplication && selectedApplication.status === 'under_review' && (
                <Card className="p-6 bg-gray-700 border-gray-600 mb-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Review: {selectedApplication.applicant_name}
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-gray-400 text-sm">Position</p>
                      <p className="text-white font-semibold">{selectedApplication.position_applied}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Department</p>
                      <Badge className="bg-blue-600">{selectedApplication.department}</Badge>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Experience</p>
                      <p className="text-white">{selectedApplication.years_experience || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Availability</p>
                      <p className="text-white">{selectedApplication.availability || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-gray-400 text-sm mb-2">Why Join STOCRX</p>
                    <p className="text-white bg-gray-800 p-3 rounded">{selectedApplication.why_join}</p>
                  </div>

                  <div className="mb-6">
                    <label className="text-gray-300 text-sm mb-2 block">Review Notes</label>
                    <Textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add your notes about this candidate..."
                      className="bg-gray-800 border-gray-600 text-white h-24"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        if (!reviewNotes) {
                          alert('Please add review notes');
                          return;
                        }
                        hireMutation.mutate({ 
                          applicationId: selectedApplication.id,
                          application: selectedApplication
                        });
                      }}
                      disabled={hireMutation.isLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Hire Candidate
                    </Button>

                    <Button
                      onClick={() => {
                        setInterviewDate("");
                        // Show interview form
                              }}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Interview
                    </Button>

                    <Button
                      onClick={() => {
                        const reason = prompt('Reason for rejection:');
                        if (reason) {
                          setRejectionReason(reason);
                          rejectMutation.mutate({
                            applicationId: selectedApplication.id,
                            application: selectedApplication
                          });
                        }
                      }}
                      disabled={rejectMutation.isLoading}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <UserX className="w-4 h-4 mr-2" />
                      Reject
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setSelectedApplication(null)}
                      className="border-gray-600 text-gray-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>
              )}

              {underReviewApps.length === 0 ? (
                <div className="text-center py-12">
                  <Eye className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">No applications under review</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {underReviewApps.map((app) => (
                    <Card key={app.id} className="p-4 bg-gray-700 border-gray-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">{app.applicant_name}</p>
                          <p className="text-sm text-gray-400">{app.position_applied} - {app.department}</p>
                          <p className="text-xs text-gray-500 mt-1">Reviewed by: {app.reviewed_by || 'N/A'}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setSelectedApplication(app)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Review
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Interviewed */}
          <TabsContent value="interview">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Interviewed Candidates</h2>
              
              {interviewedApps.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">No interviewed candidates yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {interviewedApps.map((app) => (
                    <Card key={app.id} className="p-4 bg-purple-900/30 border-purple-700">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-white">{app.applicant_name}</p>
                          <p className="text-sm text-gray-400">{app.position_applied}</p>
                        </div>
                        <Badge className="bg-purple-600">Interviewed</Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        Interview Date: {app.interview_date ? new Date(app.interview_date).toLocaleDateString() : 'N/A'}
                      </p>
                      {app.review_notes && (
                        <p className="text-sm text-gray-300 bg-gray-800 p-2 rounded mb-3">
                          {app.review_notes}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(app);
                            setReviewNotes(app.review_notes || '');
                            hireMutation.mutate({
                              applicationId: app.id,
                              application: app
                            });
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Hire
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            const reason = prompt('Reason for rejection:');
                            if (reason) {
                              setRejectionReason(reason);
                              rejectMutation.mutate({
                                applicationId: app.id,
                                application: app
                              });
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Hired */}
          <TabsContent value="hired">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Hired Employees</h2>
              
              {hiredApps.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">No hires yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Position</TableHead>
                      <TableHead className="text-gray-300">Department</TableHead>
                      <TableHead className="text-gray-300">Hired Date</TableHead>
                      <TableHead className="text-gray-300">Hired By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hiredApps.map((app) => (
                      <TableRow key={app.id} className="border-gray-700">
                        <TableCell className="text-white font-semibold">{app.applicant_name}</TableCell>
                        <TableCell className="text-gray-300">{app.position_applied}</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-600">{app.department}</Badge>
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {app.hired_date ? new Date(app.hired_date).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">{app.reviewed_by}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          {/* Rejected */}
          <TabsContent value="rejected">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Rejected Applications</h2>
              
              {rejectedApps.length === 0 ? (
                <div className="text-center py-12">
                  <UserX className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">No rejections yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Position</TableHead>
                      <TableHead className="text-gray-300">Reason</TableHead>
                      <TableHead className="text-gray-300">Rejected By</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rejectedApps.map((app) => (
                      <TableRow key={app.id} className="border-gray-700">
                        <TableCell className="text-white">{app.applicant_name}</TableCell>
                        <TableCell className="text-gray-300">{app.position_applied}</TableCell>
                        <TableCell className="text-gray-400 text-sm">{app.rejection_reason || 'N/A'}</TableCell>
                        <TableCell className="text-gray-400 text-sm">{app.reviewed_by}</TableCell>
                        <TableCell className="text-gray-400 text-sm">
                          {app.updated_date && new Date(app.updated_date).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Activity Log */}
        <Card className="p-6 bg-gray-800 border-gray-700 mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Hiring Activity Log</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={
                    log.action_type === 'hire' ? 'bg-green-600' : 'bg-red-600'
                  }>
                    {log.action_type === 'hire' ? 'HIRED' : 'REJECTED'}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {log.created_date && new Date(log.created_date).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-300 mb-1">{log.action_details}</p>
                <p className="text-sm text-gray-500">By: {log.user_email}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}