import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CheckCircle, Clock, AlertTriangle, List, Plus, 
  Trash2, Edit, Calendar, User, TrendingUp
} from "lucide-react";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function AITaskManager() {
  const [user, setUser] = useState(null);
  const [taskList, setTaskList] = useState([]);
  const [completedList, setCompletedList] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("medium");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.email !== SUPER_ADMIN_EMAIL && currentUser.role !== 'admin') {
          window.location.href = '/';
          return;
        }
        setUser(currentUser);

        // Load tasks from localStorage
        const savedTasks = localStorage.getItem(`ai-tasks-${currentUser.email}`);
        if (savedTasks) {
          const allTasks = JSON.parse(savedTasks);
          setTaskList(allTasks.filter(t => t.status === "incomplete"));
          setCompletedList(allTasks.filter(t => t.status === "complete"));
        }
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  const saveTasks = (incomplete, completed) => {
    const allTasks = [...incomplete, ...completed];
    localStorage.setItem(`ai-tasks-${user.email}`, JSON.stringify(allTasks));
    setTaskList(incomplete);
    setCompletedList(completed);
  };

  const addTask = () => {
    if (!newTask.trim()) return;

    const task = {
      id: Date.now(),
      task: newTask,
      priority: selectedPriority,
      status: "incomplete",
      createdAt: new Date().toISOString(),
      createdBy: user.email
    };

    const updated = [task, ...taskList];
    saveTasks(updated, completedList);
    setNewTask("");
  };

  const toggleTask = (taskId) => {
    const task = taskList.find(t => t.id === taskId) || completedList.find(t => t.id === taskId);
    if (!task) return;

    if (task.status === "incomplete") {
      const updated = taskList.filter(t => t.id !== taskId);
      const completed = [{ ...task, status: "complete", completedAt: new Date().toISOString() }, ...completedList];
      saveTasks(updated, completed);
    } else {
      const updated = completedList.filter(t => t.id !== taskId);
      const incomplete = [{ ...task, status: "incomplete", completedAt: null }, ...taskList];
      saveTasks(incomplete, updated);
    }
  };

  const deleteTask = (taskId) => {
    if (!confirm("Delete this task?")) return;
    const updated = taskList.filter(t => t.id !== taskId);
    const completed = completedList.filter(t => t.id !== taskId);
    saveTasks(updated, completed);
  };

  const clearCompleted = () => {
    if (!confirm("Clear all completed tasks?")) return;
    saveTasks(taskList, []);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const overdueCount = taskList.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length;
  const highPriorityCount = taskList.filter(t => t.priority === "high" || t.priority === "urgent").length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <List className="w-10 h-10 text-blue-400" />
            AI Task Manager
          </h1>
          <p className="text-gray-400">Track tasks, assignments, and AI-generated action items</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-yellow-900 border-yellow-700">
            <Clock className="w-8 h-8 text-yellow-400 mb-2" />
            <p className="text-yellow-200 text-sm mb-1">Pending Tasks</p>
            <p className="text-3xl font-bold text-yellow-400">{taskList.length}</p>
          </Card>
          <Card className="p-6 bg-green-900 border-green-700">
            <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-green-200 text-sm mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-400">{completedList.length}</p>
          </Card>
          <Card className="p-6 bg-red-900 border-red-700">
            <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
            <p className="text-red-200 text-sm mb-1">High Priority</p>
            <p className="text-3xl font-bold text-red-400">{highPriorityCount}</p>
          </Card>
          <Card className="p-6 bg-purple-900 border-purple-700">
            <TrendingUp className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-purple-200 text-sm mb-1">Completion Rate</p>
            <p className="text-3xl font-bold text-purple-400">
              {taskList.length + completedList.length > 0 
                ? Math.round((completedList.length / (taskList.length + completedList.length)) * 100)
                : 0}%
            </p>
          </Card>
        </div>

        {/* Add New Task */}
        <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-6 h-6 text-green-400" />
            Add New Task
          </h2>
          <div className="flex gap-4">
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="Enter task description..."
              className="flex-1 bg-gray-700 border-gray-600 text-white"
            />
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="p-2 rounded-lg bg-gray-700 border-gray-600 text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">🚨 Urgent</option>
            </select>
            <Button onClick={addTask} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </Card>

        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-800">
            <TabsTrigger value="pending">
              Pending ({taskList.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedList.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Tasks */}
          <TabsContent value="pending">
            <Card className="p-6 bg-gray-800 border-gray-700">
              {taskList.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">No pending tasks! 🎉</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {taskList.map((task) => (
                    <Card key={task.id} className={`p-4 ${
                      task.priority === "urgent" ? "bg-red-900/30 border-red-700" :
                      task.priority === "high" ? "bg-orange-900/30 border-orange-700" :
                      task.priority === "medium" ? "bg-yellow-900/30 border-yellow-700" :
                      "bg-gray-700 border-gray-600"
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleTask(task.id)}
                            className="text-gray-400 hover:text-green-400"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </Button>
                          <div className="flex-1">
                            <p className="text-white font-semibold mb-2">{task.task}</p>
                            <div className="flex items-center gap-3 text-xs">
                              <Badge className={
                                task.priority === "urgent" ? "bg-red-600" :
                                task.priority === "high" ? "bg-orange-600" :
                                task.priority === "medium" ? "bg-yellow-600" :
                                "bg-blue-600"
                              }>
                                {task.priority.toUpperCase()}
                              </Badge>
                              <span className="text-gray-400">
                                <Calendar className="w-3 h-3 inline mr-1" />
                                {new Date(task.createdAt).toLocaleDateString()}
                              </span>
                              <span className="text-gray-400">
                                <User className="w-3 h-3 inline mr-1" />
                                {task.createdBy}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteTask(task.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Completed Tasks */}
          <TabsContent value="completed">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Completed Tasks</h3>
                {completedList.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearCompleted}
                    className="border-red-600 text-red-400 hover:bg-red-900/30"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {completedList.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">No completed tasks yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {completedList.map((task) => (
                    <Card key={task.id} className="p-4 bg-green-900/20 border-green-700">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleTask(task.id)}
                            className="text-green-400"
                          >
                            <CheckCircle className="w-5 h-5 fill-current" />
                          </Button>
                          <div className="flex-1">
                            <p className="text-white line-through opacity-75">{task.task}</p>
                            <div className="flex items-center gap-3 text-xs mt-2">
                              <span className="text-green-400">
                                ✅ Completed: {task.completedAt && new Date(task.completedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteTask(task.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}