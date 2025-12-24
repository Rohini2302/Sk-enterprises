import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, Trash2, Shield, Briefcase, Users, Mail, Phone, MapPin, UserCog } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { database } from "@/lib/firebase";
import { ref, set, push, get, update, remove, onValue } from "firebase/database";
import { useRole } from "../../context/RoleContext";

// Types
interface User {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'supervisor' | 'employee';
  department: string;
  site: string;
  phone: string;
  status: 'active' | 'inactive';
  joinDate: string;
  createdAt?: string;
  createdBy?: string; // Superadmin UID who created this user
}

const departments = ['IT', 'HR', 'Finance', 'Operations', 'Marketing', 'Sales', 'Admin'];
const sites = ['Mumbai Office', 'Delhi Branch', 'Bangalore Tech Park', 'Chennai Center', 'Hyderabad Campus'];
const roles = ['admin', 'manager', 'supervisor', 'employee'];

// Firebase service functions
class UserService {
  static async getAllUsers(superadminUid: string): Promise<User[]> {
    try {
      const snapshot = await get(ref(database, `users/${superadminUid}`));
      const users: User[] = [];
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach(role => {
          Object.keys(data[role]).forEach(uid => {
            const user = data[role][uid];
            users.push({
              ...user,
              id: uid,
              uid,
              role: role as User['role']
            });
          });
        });
      }
      
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      return [];
    }
  }

  static async getUsersByRole(superadminUid: string, role: User['role']): Promise<User[]> {
    try {
      const snapshot = await get(ref(database, `users/${superadminUid}/${role}`));
      const users: User[] = [];
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach(uid => {
          users.push({
            ...data[uid],
            id: uid,
            uid,
            role
          });
        });
      }
      
      return users;
    } catch (error) {
      console.error(`Error fetching ${role}s:`, error);
      toast.error(`Failed to fetch ${role}s`);
      return [];
    }
  }

  static async addUser(superadminUid: string, userData: Omit<User, 'id' | 'uid'>): Promise<boolean> {
    try {
      const { role, ...userInfo } = userData;
      const userRef = push(ref(database, `users/${superadminUid}/${role}`));
      const uid = userRef.key;
      
      if (!uid) {
        throw new Error('Failed to generate user ID');
      }

      const newUser = {
        ...userInfo,
        uid,
        createdBy: superadminUid,
        createdAt: new Date().toISOString()
      };
      
      await set(userRef, newUser);
      toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} added successfully`);
      return true;
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Failed to add user');
      return false;
    }
  }

  static async updateUser(
    superadminUid: string, 
    uid: string, 
    currentRole: User['role'], 
    userData: Partial<User>
  ): Promise<boolean> {
    try {
      const { role: newRole, ...updateData } = userData;
      
      // If role hasn't changed, update in place
      if (!newRole || newRole === currentRole) {
        await update(ref(database, `users/${superadminUid}/${currentRole}/${uid}`), updateData);
        toast.success('User updated successfully');
        return true;
      }
      
      // If role changed, move user to new role path
      const currentUserRef = ref(database, `users/${superadminUid}/${currentRole}/${uid}`);
      const newUserRef = ref(database, `users/${superadminUid}/${newRole}/${uid}`);
      
      const snapshot = await get(currentUserRef);
      if (!snapshot.exists()) {
        toast.error('User not found');
        return false;
      }
      
      const userDataToMove = snapshot.val();
      const updatedUser = {
        ...userDataToMove,
        ...updateData,
        role: newRole
      };
      
      // Delete from old location and add to new location
      await set(newUserRef, updatedUser);
      await remove(currentUserRef);
      
      toast.success('User updated and moved successfully');
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
      return false;
    }
  }

  static async deleteUser(
    superadminUid: string, 
    uid: string, 
    role: User['role']
  ): Promise<boolean> {
    try {
      await remove(ref(database, `users/${superadminUid}/${role}/${uid}`));
      toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} deleted successfully`);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
      return false;
    }
  }

  static async toggleUserStatus(
    superadminUid: string,
    uid: string, 
    role: User['role'], 
    currentStatus: 'active' | 'inactive'
  ): Promise<boolean> {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await update(ref(database, `users/${superadminUid}/${role}/${uid}`), { 
        status: newStatus 
      });
      toast.success('Status updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
      return false;
    }
  }

 static async getStats(superadminUid: string) {
  try {
    const snapshot = await get(ref(database, `users/${superadminUid}`));
    const stats = {
      total: 0,
      admins: 0,
      managers: 0,
      supervisors: 0,
      employees: 0,
      active: 0
    };
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      
      // Count users in each role
      const roles = ['admin', 'manager', 'supervisor', 'employee'];
      roles.forEach(role => {
        if (data[role]) {
          const roleUsers = data[role];
          Object.keys(roleUsers).forEach(uid => {
            const user = roleUsers[uid];
            stats.total++;
            
            if (user.status === 'active') {
              stats.active++;
            }
            
            switch (role) {
              case 'admin':
                stats.admins++;
                break;
              case 'manager':
                stats.managers++;
                break;
              case 'supervisor':
                stats.supervisors++;
                break;
              case 'employee':
                stats.employees++;
                break;
            }
          });
        }
      });
    }
    
    return stats;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return null;
  }
}
}

// User Form Component
const UserForm = ({ onSubmit, isEditing = false, user = null, role, superadminUid }: any) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || role || 'employee',
    department: user?.department || '',
    site: user?.site || '',
    phone: user?.phone || '',
    status: user?.status || 'active',
    joinDate: user?.joinDate || new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Enter full name"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="Enter email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="Enter password"
            required={!isEditing}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Role</Label>
          <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map(role => (
                <SelectItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Department</Label>
          <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Site</Label>
          <Select value={formData.site} onValueChange={(value) => setFormData({...formData, site: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent>
              {sites.map(site => (
                <SelectItem key={site} value={site}>{site}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Join Date</Label>
          <Input
            type="date"
            value={formData.joinDate}
            onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="Enter phone number"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full">
        {isEditing ? 'Update User' : 'Add User'}
      </Button>
    </form>
  );
};

// Reusable User List Component
const UserList = ({ 
  title, 
  icon: Icon, 
  roleFilter,
  description 
}: { 
  title: string;
  icon: React.ElementType;
  roleFilter: User['role'][];
  description: string;
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useRole();

  const superadminUid = currentUser?.id || '';

  useEffect(() => {
    if (!superadminUid) return;

    loadUsers();
    
    // Set up real-time listener for this role
    const rolePath = roleFilter[0];
    const usersRef = ref(database, `users/${superadminUid}/${rolePath}`);
    const unsubscribe = onValue(usersRef, () => {
      loadUsers();
    });

    return () => unsubscribe();
  }, [superadminUid, roleFilter]);

  const loadUsers = async () => {
    if (!superadminUid) return;
    
    setLoading(true);
    try {
      const allUsers = await UserService.getAllUsers(superadminUid);
      const filtered = allUsers.filter(user => roleFilter.includes(user.role));
      setUsers(filtered);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.site.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = async (formData: any) => {
    if (!superadminUid) {
      toast.error('Superadmin UID not found');
      return;
    }
    
    const success = await UserService.addUser(superadminUid, formData);
    if (success) {
      setDialogOpen(false);
    }
  };

  const handleEditUser = async (formData: any, userId: string) => {
    if (!superadminUid) {
      toast.error('Superadmin UID not found');
      return;
    }
    
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const success = await UserService.updateUser(superadminUid, userId, user.role, formData);
    if (success) {
      // User list will update via real-time listener
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!superadminUid) {
      toast.error('Superadmin UID not found');
      return;
    }
    
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const confirmDelete = window.confirm(`Are you sure you want to delete ${user.name}?`);
    if (!confirmDelete) return;
    
    await UserService.deleteUser(superadminUid, userId, user.role);
  };

  const handleToggleStatus = async (userId: string) => {
    if (!superadminUid) {
      toast.error('Superadmin UID not found');
      return;
    }
    
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    await UserService.toggleUserStatus(superadminUid, userId, user.role, user.status);
  };

  const getRoleColor = (role: User['role']) => {
    const colors = {
      admin: 'destructive',
      manager: 'default',
      supervisor: 'secondary',
      employee: 'outline'
    };
    return colors[role];
  };

  const getStatusColor = (status: User['status']) => {
    return status === 'active' ? 'default' : 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Icon className="h-6 w-6" />
              {title} ({filteredUsers.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add {title.slice(0, -1)}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New {title.slice(0, -1)}</DialogTitle>
              </DialogHeader>
              <UserForm 
                onSubmit={handleAddUser}
                role={roleFilter[0]}
                superadminUid={superadminUid}
              />
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading users...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No {title.toLowerCase()} found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div>{user.name}</div>
                          <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleColor(user.role) as "default" | "destructive" | "outline" | "secondary"}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {user.site}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {user.phone}
                      </div>
                    </TableCell>
                    <TableCell>{user.joinDate}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleStatus(user.id)}
                        >
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit {title.slice(0, -1)}</DialogTitle>
                            </DialogHeader>
                            <UserForm 
                              user={user} 
                              onSubmit={(data: any) => handleEditUser(data, user.id)}
                              isEditing={true}
                              superadminUid={superadminUid}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

// Stats Cards Component
const StatsCards = () => {
  const [stats, setStats] = useState([
  { title: "Total Users", value: 0, icon: Users, description: "All organization users", color: "text-blue-600" },
  { title: "Admins", value: 0, icon: UserCog, description: "System administrators", color: "text-red-600" },
  { title: "Managers", value: 0, icon: Briefcase, description: "Department managers", color: "text-green-600" },
  { title: "Supervisors", value: 0, icon: Shield, description: "Team supervisors", color: "text-purple-600" },
  { title: "Employees", value: 0, icon: Users, description: "Regular employees", color: "text-orange-600" },
  { title: "Active Users", value: 0, icon: Users, description: "Currently active", color: "text-green-600" }
]);
  
  const { user: currentUser } = useRole();
  const superadminUid = currentUser?.id || '';
useEffect(() => {
  if (!superadminUid) return;

  const fetchStats = async () => {
    try {
      const statsData = await UserService.getStats(superadminUid);
      
      if (statsData) {
        setStats([
          {
            title: "Total Users",
            value: statsData.total,
            icon: Users,
            description: "All organization users",
            color: "text-blue-600"
          },
          {
            title: "Admins",
            value: statsData.admins,
            icon: UserCog,
            description: "System administrators",
            color: "text-red-600"
          },
          {
            title: "Managers",
            value: statsData.managers,
            icon: Briefcase,
            description: "Department managers",
            color: "text-green-600"
          },
          {
            title: "Supervisors",
            value: statsData.supervisors,
            icon: Shield,
            description: "Team supervisors",
            color: "text-purple-600"
          },
          {
            title: "Employees",
            value: statsData.employees,
            icon: Users,
            description: "Regular employees",
            color: "text-orange-600"
          },
          {
            title: "Active Users",
            value: statsData.active,
            icon: Users,
            description: "Currently active",
            color: "text-green-600"
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  fetchStats();
  
  // Set up real-time listener for stats
  const usersRef = ref(database, `users/${superadminUid}`);
  const unsubscribe = onValue(usersRef, fetchStats);

  return () => unsubscribe();
}, [superadminUid]);
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Main Component
const UsersRolesManagement = () => {
  const { role: userRole } = useRole();

  // Only show this page to superadmin
  if (userRole !== 'superadmin') {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          title="Access Denied" 
          subtitle="You don't have permission to access this page" 
        />
        <div className="p-6 text-center">
          <p className="text-muted-foreground">
            Only Super Admin can access user management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        title="Users & Roles Management" 
        subtitle="Manage all system users, roles and permissions" 
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
      >
        <StatsCards />
        
        <Tabs defaultValue="admins" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Admins
            </TabsTrigger>
            <TabsTrigger value="managers" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Managers
            </TabsTrigger>
            <TabsTrigger value="supervisors" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Supervisors
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Employees
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="admins">
            <UserList 
              title="Admins"
              icon={UserCog}
              roleFilter={['admin']}
              description="System administrators with full access"
            />
          </TabsContent>
          
          <TabsContent value="managers">
            <UserList 
              title="Managers"
              icon={Briefcase}
              roleFilter={['manager']}
              description="Department managers with management privileges"
            />
          </TabsContent>
          
          <TabsContent value="supervisors">
            <UserList 
              title="Supervisors"
              icon={Shield}
              roleFilter={['supervisor']}
              description="Team supervisors with oversight responsibilities"
            />
          </TabsContent>
          
          <TabsContent value="employees">
            <UserList 
              title="Employees"
              icon={Users}
              roleFilter={['employee']}
              description="Regular employees with standard access"
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default UsersRolesManagement;