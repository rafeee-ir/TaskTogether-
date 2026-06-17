import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckSquare, 
  MessageSquare, 
  User, 
  Plus, 
  Send, 
  LogOut, 
  Check, 
  CheckCheck,
  Copy, 
  Users, 
  AlertCircle, 
  Settings, 
  X, 
  Bell, 
  Globe, 
  Sparkles,
  Wifi,
  Battery,
  Calendar,
  Layers,
  HelpCircle,
  Clock,
  Phone,
  Grid,
  Search,
  PlusCircle,
  Trash2,
  Paperclip,
  Smile,
  Archive,
  RefreshCw,
  Edit2,
  ChevronLeft,
  ExternalLink,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLanguage, AppTheme, SimulatedUser, SimulatedWorkspace, SimulatedTask, TaskAttachment, TaskComment } from '../types';
import { localization } from '../localization';
import { db, auth } from '../firebase';
import { signInAnonymously, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { handleFirestoreError, OperationType } from '../utils/firebaseHelpers';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  getDocs 
} from 'firebase/firestore';

interface AndroidSimulatorProps {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  onCodeInspectNeeded?: (filePath: string) => void;
}

const DEFAULT_MEMBERS = ["Maryam (Mom)", "Ali (Dad)", "Sarah", "TaskBot (AI)"];

// Defined Composable Screens
export type ComposeScreen = 
  | 'Splash'
  | 'Login'
  | 'HomeDashboard'
  | 'TaskList'
  | 'AddTask'
  | 'TaskDetails'
  | 'CompletedTasks'
  | 'FamilyMembers'
  | 'InviteMember'
  | 'GroupChat'
  | 'Settings'
  | 'AboutUs'
  | 'PrivacyPolicy'
  | 'TermsOfService';

export default function AndroidSimulator({ 
  language, 
  setLanguage, 
  theme, 
  setTheme,
  onCodeInspectNeeded 
}: AndroidSimulatorProps) {
  
  const strings = localization[language];
  const isRtl = language === 'Fa';

  const PERSON_LIST = [
    { uid: "usr_99", name: "Wikihadi", avatarUrl: "🧔", role: "owner" as const, email: "wikihadi@gmail.com" },
    { uid: "usr_31", name: "Maryam (Mom)", avatarUrl: "👩", role: "admin" as const, email: "maryam@family.com" },
    { uid: "usr_32", name: "Ali (Dad)", avatarUrl: "👨", role: "member" as const, email: "ali@family.com" },
    { uid: "usr_33", name: "Sarah", avatarUrl: "👧", role: "member" as const, email: "sarah@family.com" }
  ];

  // Core Authentication Context
  const [user, setUser] = useState<SimulatedUser | null>({
    uid: "usr_99",
    name: "Wikihadi",
    email: "wikihadi@gmail.com",
    avatarUrl: "🧔",
    role: "owner",
    workspaceId: "sweet-home"
  });

  const [workspace, setWorkspace] = useState<SimulatedWorkspace | null>({
    id: "sweet-home",
    name: "Sweet Home",
    inviteCode: "FAM-2026",
    memberNames: ["Wikihadi", "Maryam (Mom)", "Ali (Dad)", "Sarah", "TaskBot (AI)"]
  });

  const [workspaces, setWorkspaces] = useState<SimulatedWorkspace[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [joinInviteCode, setJoinInviteCode] = useState('');
  
  // Simulated invite form properties
  const [simInviteName, setSimInviteName] = useState('');
  const [simInviteRole, setSimInviteRole] = useState<'owner' | 'admin' | 'member'>('member');
  const [simInviteAvatar, setSimInviteAvatar] = useState('👩‍🦰');

  // State managed via Firebase Firestore
  const [tasks, setTasks] = useState<SimulatedTask[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Navigation Routing
  const [activeComposeScreen, setActiveComposeScreen] = useState<ComposeScreen>('HomeDashboard');
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<SimulatedTask | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [taskFilter, setTaskFilter] = useState<'all' | 'mine' | 'high' | 'Pending' | 'In Progress' | 'Completed' | 'Archived'>('all');

  // Input states for Creating & Editing
  const [editMode, setEditMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [taskStatus, setTaskStatus] = useState<'Pending' | 'In Progress' | 'Completed'>('Pending');
  const [taskAssignee, setTaskAssignee] = useState('Wikihadi');
  const [taskCreator, setTaskCreator] = useState('Wikihadi');
  const [taskDueDate, setTaskDueDate] = useState('2026-06-25');

  // New Comment & Attachment simulator inputs
  const [commentInput, setCommentInput] = useState('');
  const [attachmentNameInput, setAttachmentNameInput] = useState('');
  const [attachmentUrlInput, setAttachmentUrlInput] = useState('');
  const [showAttachmentForm, setShowAttachmentForm] = useState(false);

  // Chat inputs
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  
  // Real-time Chat Media presets panel
  const [showMediaPane, setShowMediaPane] = useState(false);
  const [mediaPaneTab, setMediaPaneTab] = useState<'image' | 'file'>('image');
  const [customMediaName, setCustomMediaName] = useState('');
  const [customMediaUrl, setCustomMediaUrl] = useState('');

  // General Notification Banner
  const [notification, setNotification] = useState<string | null>(null);
  const [fcmBanner, setFcmBanner] = useState<any | null>(null);
  const [showNotificationsTray, setShowNotificationsTray] = useState(false);
  const lastCheckedNotificationTimeRef = useRef<number>(Date.now());
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [simTime, setSimTime] = useState('22:45');

  // Premium network monitor & Simulated Offline switch
  const [isNetworkOffline, setIsNetworkOffline] = useState(false);
  const [forceOfflineSimulation, setForceOfflineSimulation] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Auto silent anonymous authentic signup on boot to support Secure Rules perfectly
  useEffect(() => {
    const handleSilenceAuth = async () => {
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
          console.log("Firebase Auth anonymous session active UID:", auth.currentUser?.uid);
        }
      } catch (err) {
        console.warn("Silent login fallback initialized safely.");
      }
    };
    handleSilenceAuth();
  }, []);

  // Monitor real-world browser connection events
  useEffect(() => {
    const handleOnline = () => {
      setIsNetworkOffline(false);
      triggerNotification("Network back online! Restoring Firestore sync stream... 📶");
    };
    const handleOffline = () => {
      setIsNetworkOffline(true);
      triggerNotification("Network link detached! Switched to Firestore local offline replica DB 📱");
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if (!navigator.onLine) {
      setIsNetworkOffline(true);
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  const screenToFilePath: Record<ComposeScreen, string> = {
    Splash: 'app/src/main/java/com/karamana/tasktogether/ui/screen/SplashScreen.kt',
    Login: 'app/src/main/java/com/karamana/tasktogether/ui/screen/LoginScreen.kt',
    HomeDashboard: 'app/src/main/java/com/karamana/tasktogether/ui/screen/HomeDashboardScreen.kt',
    TaskList: 'app/src/main/java/com/karamana/tasktogether/ui/screen/TaskListScreen.kt',
    AddTask: 'app/src/main/java/com/karamana/tasktogether/ui/screen/AddTaskScreen.kt',
    TaskDetails: 'app/src/main/java/com/karamana/tasktogether/ui/screen/TaskDetailsScreen.kt',
    CompletedTasks: 'app/src/main/java/com/karamana/tasktogether/ui/screen/CompletedTasksScreen.kt',
    FamilyMembers: 'app/src/main/java/com/karamana/tasktogether/ui/screen/FamilyMembersScreen.kt',
    InviteMember: 'app/src/main/java/com/karamana/tasktogether/ui/screen/InviteMemberScreen.kt',
    GroupChat: 'app/src/main/java/com/karamana/tasktogether/ui/screen/ChatScreen.kt',
    Settings: 'app/src/main/java/com/karamana/tasktogether/ui/screen/SettingsScreen.kt',
    AboutUs: 'app/src/main/java/com/karamana/tasktogether/ui/screen/AboutScreen.kt',
    PrivacyPolicy: 'app/src/main/java/com/karamana/tasktogether/ui/screen/PrivacyPolicyScreen.kt',
    TermsOfService: 'app/src/main/java/com/karamana/tasktogether/ui/screen/TermsOfServiceScreen.kt',
  };

  const triggerScreenChange = (screen: ComposeScreen) => {
    setActiveComposeScreen(screen);
    const filePath = screenToFilePath[screen];
    if (onCodeInspectNeeded && filePath) {
      onCodeInspectNeeded(filePath);
    }
  };

  // Seed default data if database collections are empty
  const seedInitialData = async () => {
    const demoTasks: SimulatedTask[] = [
      {
        id: "t1",
        workspaceId: "sweet-home",
        title: "Change oil in family car",
        description: "Verify engine oil parameters. Check tire pressure and headlights before long trip.",
        priority: "HIGH",
        status: "In Progress",
        creator: "Wikihadi (You)",
        assignedUser: "Ali (Dad)",
        creationDate: Date.now() - 172800000,
        dueDate: "2026-06-25",
        isCompleted: false,
        attachments: [{ name: "Car Warranty Diagram.pdf", url: "https://example.com/warranty" }],
        comments: [
          { id: "c1", author: "Maryam (Mom)", text: "Remember to use premium engine gear lube!", timestamp: Date.now() - 86400000 }
        ],
        isArchived: false
      },
      {
        id: "t2",
        workspaceId: "sweet-home",
        title: "Grocery shopping",
        description: "Fetch fresh fruits, whole wheat breads, organic eggs, skimmed milk, and yogurt.",
        priority: "MEDIUM",
        status: "Completed",
        creator: "Ali (Dad)",
        assignedUser: "Maryam (Mom)",
        creationDate: Date.now() - 345600000,
        dueDate: "2026-06-18",
        isCompleted: true,
        attachments: [],
        comments: [{ id: "c2", author: "Sarah", text: "Please get apples as well!", timestamp: Date.now() - 172800000 }],
        isArchived: false
      },
      {
        id: "t3",
        workspaceId: "sweet-home",
        title: "Water internal houseplants",
        description: "Mist moisture-sensitive lobby bonsai trees. Ensure adequate tray ventilation.",
        priority: "LOW",
        status: "Pending",
        creator: "Maryam (Mom)",
        assignedUser: "Sarah",
        creationDate: Date.now() - 43200000,
        dueDate: "2026-06-20",
        isCompleted: false,
        attachments: [],
        comments: [],
        isArchived: false
      }
    ];

    const demoMessages = [
      {
        id: "m1",
        workspaceId: "sweet-home",
        senderName: "Maryam (Mom)",
        senderRole: "admin",
        avatarUrl: "👩",
        text: "Welcome to our new household workspace everyone! ❤️",
        timestamp: Date.now() - 3600000,
      },
      {
        id: "m2",
        workspaceId: "sweet-home",
        senderName: "Ali (Dad)",
        senderRole: "member",
        avatarUrl: "👨",
        text: "This is great. Can we add a reminder for the car maintenance?",
        timestamp: Date.now() - 1800000,
      },
      {
        id: "m3",
        workspaceId: "sweet-home",
        senderName: "TaskBot (AI)",
        senderRole: "owner",
        avatarUrl: "🤖",
        text: "Master plan active. I am monitoring family duties. Type any request here, or say 'add task [title]' to automatically list a chore!",
        timestamp: Date.now() - 1200000,
        isAi: true
      }
    ];

    try {
      for (const t of demoTasks) {
        await setDoc(doc(db, "tasks", t.id), t);
      }
      for (const m of demoMessages) {
        await setDoc(doc(db, "messages", m.id), m);
      }
      
      // Seed workspaces and default members
      await setDoc(doc(db, "workspaces", "sweet-home"), {
        id: "sweet-home",
        name: "Sweet Home",
        inviteCode: "FAM-2026",
        ownerUid: "usr_99",
        memberNames: ["Wikihadi", "Maryam (Mom)", "Ali (Dad)", "Sarah", "TaskBot (AI)"]
      });

      const defaultMembers = [
        { id: "sweet-home_usr_99", workspaceId: "sweet-home", uid: "usr_99", name: "Wikihadi", email: "wikihadi@gmail.com", avatarUrl: "🧔", role: "owner" },
        { id: "sweet-home_usr_31", workspaceId: "sweet-home", uid: "usr_31", name: "Maryam (Mom)", email: "maryam@family.com", avatarUrl: "👩", role: "admin" },
        { id: "sweet-home_usr_32", workspaceId: "sweet-home", uid: "usr_32", name: "Ali (Dad)", email: "ali@family.com", avatarUrl: "👨", role: "member" },
        { id: "sweet-home_usr_33", workspaceId: "sweet-home", uid: "usr_33", name: "Sarah", email: "sarah@family.com", avatarUrl: "👧", role: "member" },
        { id: "sweet-home_usr_bot", workspaceId: "sweet-home", uid: "usr_bot", name: "TaskBot (AI)", email: "bot@family.com", avatarUrl: "🤖", role: "member" }
      ];

      for (const mb of defaultMembers) {
        await setDoc(doc(db, "members", mb.id), mb);
      }
    } catch (e) {
      console.error("Error seeding default data, rule failure or permission: ", e);
    }
  };

  // Check if seeding is needed at mount
  useEffect(() => {
    const checkAndSeed = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "tasks"));
        if (querySnapshot.empty) {
          await seedInitialData();
        }
      } catch (err) {
        console.error("Failed to query tasks collection for seed check:", err);
      }
    };
    checkAndSeed();
  }, []);

  // Real-time task syncing (isolated per workspace)
  useEffect(() => {
    const activeWsId = user?.workspaceId || "sweet-home";
    const unsub = onSnapshot(collection(db, "tasks"), (snap) => {
      const list: SimulatedTask[] = [];
      snap.forEach((doc) => {
        const item = doc.data() as SimulatedTask;
        if (item.workspaceId === activeWsId) {
          list.push(item);
        }
      });
      // Sort creationDate descending
      list.sort((a, b) => b.creationDate - a.creationDate);
      setTasks(list);
      
      // Also sync selectedTaskDetails if open
      if (selectedTaskForDetails) {
        const fresh = list.find(t => t.id === selectedTaskForDetails.id);
        if (fresh) {
          setSelectedTaskForDetails(fresh);
        }
      }
    }, (err) => {
      console.error("Firestore tasks subscription error:", err);
      // Suppress alert to prevent breaking local offline caches
    });

    return () => unsub();
  }, [user?.workspaceId, selectedTaskForDetails]);

  // Real-time messages syncing (isolated per workspace)
  useEffect(() => {
    const activeWsId = user?.workspaceId || "sweet-home";
    const unsub = onSnapshot(collection(db, "messages"), (snap) => {
      const list: any[] = [];
      snap.forEach((doc) => {
        const item = doc.data();
        if (item.workspaceId === activeWsId) {
          list.push(item);
        }
      });
      // Sort timestamp ascending
      list.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(list);
    }, (err) => {
      console.error("Firestore messages subscription error:", err);
    });

    return () => unsub();
  }, [user?.workspaceId]);

  // Real-time workspaces collection syncing
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "workspaces"), (snap) => {
      const list: SimulatedWorkspace[] = [];
      snap.forEach((doc) => {
        list.push(doc.data() as SimulatedWorkspace);
      });
      setWorkspaces(list);
    }, (err) => {
      console.error("Firestore workspaces subscription error:", err);
    });
    return () => unsub();
  }, []);

  // Real-time workspace members syncing
  useEffect(() => {
    const activeWsId = user?.workspaceId || "sweet-home";
    const unsub = onSnapshot(collection(db, "members"), (snap) => {
      const list: any[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        if (data.workspaceId === activeWsId) {
          list.push(data);
        }
      });
      setWorkspaceMembers(list);
    }, (err) => {
      console.error("Firestore members subscription error:", err);
    });
    return () => unsub();
  }, [user?.workspaceId]);

  // Sync active workspace metadata and dynamic member names
  useEffect(() => {
    const activeWsId = user?.workspaceId || "sweet-home";
    if (workspaces.length === 0) return;
    const currentWS = workspaces.find(w => w.inviteCode === activeWsId || w.id === activeWsId);
    if (currentWS) {
      const memberNames = workspaceMembers.map(m => m.name);
      setWorkspace({
        id: currentWS.id,
        name: currentWS.name,
        inviteCode: currentWS.inviteCode,
        memberNames: memberNames.length > 0 ? memberNames : currentWS.memberNames || ["Wikihadi"]
      });
    }
  }, [user?.workspaceId, workspaces, workspaceMembers]);

  // Workspace Operations implementation
  const handleCreateWorkspace = async (nameInput: string) => {
    if (!nameInput.trim() || !user) {
      triggerNotification("Provide a valid workspace name.");
      return;
    }

    const wsId = "ws_" + Math.random().toString(36).substring(4);
    const inviteCodeNum = Math.floor(1000 + Math.random() * 9000);
    const inviteCode = `FAM-${inviteCodeNum}`;

    try {
      // 1. Create workspace document
      await setDoc(doc(db, "workspaces", wsId), {
        id: wsId,
        name: nameInput.trim(),
        inviteCode,
        ownerUid: user.uid,
        memberNames: [user.name]
      });

      // 2. Add creator to members collection as Owner
      const memberId = `${wsId}_${user.uid}`;
      await setDoc(doc(db, "members", memberId), {
        id: memberId,
        workspaceId: wsId,
        uid: user.uid,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: "owner"
      });

      // 3. Switch current user to this workspace
      setUser(prev => prev ? { ...prev, role: "owner", workspaceId: wsId } : null);
      setNewWorkspaceName('');
      triggerNotification(`Workspace "${nameInput}" created successfully!`);
      triggerScreenChange('HomeDashboard');
      await dispatchNotification('NEW_MEMBER', 'Family Bridge Primed! 🏡', `New family workspace "${nameInput}" has been initialized.`);
    } catch (err) {
      console.error(err);
      triggerNotification("Error creating workspace.");
    }
  };

  const handleJoinWorkspace = async (inviteCodeRaw: string) => {
    const code = inviteCodeRaw.trim().toUpperCase();
    if (!code || !user) {
      triggerNotification("Enter a valid invite code.");
      return;
    }

    try {
      const targetWS = workspaces.find(w => w.inviteCode === code);
      if (!targetWS) {
        triggerNotification("Invalid join code. Verify code and try again.");
        return;
      }

      // Add user to the target workspace members list
      const memberId = `${targetWS.id}_${user.uid}`;
      await setDoc(doc(db, "members", memberId), {
        id: memberId,
        workspaceId: targetWS.id,
        uid: user.uid,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: "member" // default role on join
      });

      // Switch current user workspace
      setUser(prev => prev ? { ...prev, role: "member", workspaceId: targetWS.id } : null);
      setJoinInviteCode('');
      triggerNotification(`Successfully joined "${targetWS.name}"!`);
      triggerScreenChange('HomeDashboard');
      await dispatchNotification('NEW_MEMBER', 'New Member Joined! 🎉', `${user.name} joined the family workspace via code.`);
    } catch (err) {
      console.error(err);
      triggerNotification("Error joining workspace.");
    }
  };

  const handleRemoveMember = async (memberUid: string) => {
    const activeWsId = user?.workspaceId || "sweet-home";
    const targetMember = workspaceMembers.find(m => m.uid === memberUid);
    if (!targetMember) return;

    try {
      const docId = `${activeWsId}_${memberUid}`;
      await deleteDoc(doc(db, "members", docId));
      triggerNotification(`Removed member ${targetMember.name} 📤`);
      await dispatchNotification('NEW_MEMBER', 'Member Removed! 📤', `${targetMember.name} removed from family workspace.`);
    } catch (err) {
      console.error(err);
      triggerNotification("Error removing member.");
    }
  };

  const handleChangeRole = async (memberUid: string, nextRole: 'owner' | 'admin' | 'member') => {
    const activeWsId = user?.workspaceId || "sweet-home";
    const targetMember = workspaceMembers.find(m => m.uid === memberUid);
    if (!targetMember) return;

    try {
      const docId = `${activeWsId}_${memberUid}`;
      await updateDoc(doc(db, "members", docId), {
        role: nextRole
      });
      triggerNotification(`Promoted ${targetMember.name} to ${nextRole}`);
      await dispatchNotification('NEW_MEMBER', 'Role Modified! 🏅', `${targetMember.name} is now a family ${nextRole}.`);
    } catch (err) {
      console.error(err);
      triggerNotification("Error changing role.");
    }
  };

  const handleSimulateInviteJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeWsId = user?.workspaceId || "sweet-home";
    if (!simInviteName.trim()) {
      triggerNotification("Please choose or type a name to invite.");
      return;
    }

    const newUid = "usr_sim_" + Math.random().toString(36).substring(4);
    const memberId = `${activeWsId}_${newUid}`;

    try {
      await setDoc(doc(db, "members", memberId), {
        id: memberId,
        workspaceId: activeWsId,
        uid: newUid,
        name: simInviteName.trim(),
        email: `${simInviteName.trim().toLowerCase().replace(/\s+/g, '')}@family.com`,
        avatarUrl: simInviteAvatar,
        role: simInviteRole
      });

      triggerNotification(`Simulated invite success: ${simInviteName.trim()} joined.`);
      setSimInviteName('');
      triggerScreenChange('FamilyMembers');
      await dispatchNotification('NEW_MEMBER', 'Simulated Member Joined! 👋', `${simInviteName} was added directly to household roster as ${simInviteRole}.`);
    } catch (err) {
      console.error(err);
      triggerNotification("Error simulation-inviting member.");
    }
  };

  // Sync /typing collection in real-time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "typing"), (snap) => {
      const list: any[] = [];
      const now = Date.now();
      snap.forEach((doc) => {
        const data = doc.data();
        // filter out current active user and stale typing statuses (> 6 seconds old)
        if (data.isTyping && data.uid !== user?.uid && now - data.timestamp < 6000) {
          list.push(data);
        }
      });
      setTypingUsers(list);
    }, (err) => {
      console.error("Firestore typing status subscription error:", err);
    });
    return () => unsub();
  }, [user?.uid]);

  // Sync /notifications collection in real-time and trigger FCM banner
  useEffect(() => {
    let initialLoad = true;
    const unsub = onSnapshot(collection(db, "notifications"), (snap) => {
      const list: any[] = [];
      snap.forEach((doc) => {
        list.push(doc.data());
      });
      // Sort timestamp descending
      list.sort((a, b) => b.timestamp - a.timestamp);
      setNotifications(list);

      // Trigger pop-up simulated FCM push banner for other members' triggers
      if (!initialLoad) {
        snap.docChanges().forEach((change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            if (data.senderUid !== user?.uid && Date.now() - data.timestamp < 10000) {
              setFcmBanner(data);
              // Auto dismiss simulated heads-up alert banner after 4.5 seconds
              setTimeout(() => {
                setFcmBanner((prev: any) => prev?.id === data.id ? null : prev);
              }, 4500);
            }
          }
        });
      }
      initialLoad = false;
    }, (err) => {
      console.error("Firestore notifications subscription error:", err);
    });
    return () => unsub();
  }, [user?.uid]);

  // Read Receipts Auto-Marker: mark unread messages as read in real-time when in chat room
  useEffect(() => {
    if (activeComposeScreen === 'GroupChat' && user && messages.length > 0) {
      const updateUnreadReceipts = async () => {
        for (const msg of messages) {
          if (msg.senderName !== user.name && (!msg.readBy || !msg.readBy.includes(user.name))) {
            const currentReadBy = msg.readBy || [];
            try {
              await updateDoc(doc(db, "messages", msg.id), {
                readBy: [...currentReadBy, user.name]
              });
            } catch (err) {
              console.error("Error updating read receipt coordinate: ", err);
            }
          }
        }
      };
      updateUnreadReceipts();
    }
  }, [activeComposeScreen, messages, user]);

  // Sync unread notifications count badge
  useEffect(() => {
    const unread = notifications.filter(n => n.timestamp > lastCheckedNotificationTimeRef.current).length;
    setUnreadNotificationsCount(unread);
  }, [notifications]);

  // Sync clock time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hrs = now.getHours().toString().padStart(2, '0');
      let mins = now.getMinutes().toString().padStart(2, '0');
      setSimTime(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 20000);
    return () => clearInterval(interval);
  }, []);

  // Chat autoscroll
  useEffect(() => {
    if (activeComposeScreen === 'GroupChat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeComposeScreen, isBotTyping]);

  const triggerNotification = (text: string) => {
    setNotification(text);
    setTimeout(() => {
      setNotification(null);
    }, 4505);
  };

  const dispatchNotification = async (type: string, title: string, message: string) => {
    if (!user) return;
    const notificationId = "notif_" + Math.random().toString(36).substring(4);
    const newNotif = {
      id: notificationId,
      type,
      title,
      message,
      timestamp: Date.now(),
      senderUid: user.uid,
      senderName: user.name
    };
    try {
      await setDoc(doc(db, "notifications", notificationId), newNotif);
    } catch (e) {
      console.error("Error dispatching notification:", e);
    }
  };

  const simulateMemberJoin = async () => {
    const candidates = ["Uncle David 👨", "Aunt Emily 👩", "Grandma Ava 👵", "Cousin Leo 👦"];
    const randomGuest = candidates[Math.floor(Math.random() * candidates.length)];
    if (workspace) {
      const hasMember = workspace.memberNames.some(m => m.includes(randomGuest) || randomGuest.includes(m));
      if (!hasMember) {
        const updatedList = [...workspace.memberNames, randomGuest];
        setWorkspace({
          ...workspace,
          memberNames: updatedList
        });
        await dispatchNotification('NEW_MEMBER', 'New Family Member Joined! 🎉', `${randomGuest} joined the family circle.`);
        triggerNotification(`${randomGuest} joined family.`);
      } else {
        triggerNotification(`${randomGuest} is already in the circle.`);
      }
    }
  };

  // Google Sign-In with authentic Firebase Auth promotion
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      
      setUser({
        uid: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || "Wikihadi",
        email: fbUser.email || "wikihadi@gmail.com",
        avatarUrl: fbUser.photoURL || "🧔",
        role: "owner",
        workspaceId: user?.workspaceId || "sweet-home"
      });
      triggerNotification(strings.googleSignInSuccess);
      triggerScreenChange('HomeDashboard');
    } catch (err: any) {
      console.warn("Google sign-in popup blocked or failed (expected in sandboxed iframe environments), using elite simulation setup:", err);
      // Fallback securely so that the preview user experience is always fluid:
      setUser({
        uid: "usr_99_sim",
        name: "Wikihadi",
        email: "wikihadi@gmail.com",
        avatarUrl: "🧔",
        role: "owner",
        workspaceId: "sweet-home"
      });
      triggerNotification("Secured Simulation Session Active!");
      triggerScreenChange('HomeDashboard');
    }
  };

  // Premium Data Backup Export function
  const handleBackupExport = () => {
    try {
      const backupPayload = {
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
        app: "TaskTogether Core Backend",
        workspaceId: user?.workspaceId || "sweet-home",
        workspaceDetails: workspace,
        tasks: tasks,
        messages: messages,
        members: workspaceMembers
      };
      
      const serialized = JSON.stringify(backupPayload, null, 2);
      const blob = new Blob([serialized], { type: 'application/json' });
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = `tasktogether-couch-backup-${user?.workspaceId || "sweet-home"}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(downloadUrl);
      
      triggerNotification("Workspace backup successfully exported! 📥");
    } catch (err) {
      console.error("Backup failed to export:", err);
      triggerNotification("Failed to export family backup. Please try again.");
    }
  };

  // Task database operations
  const handleCreateOrEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict client-side Input Validation
    const titleClean = taskTitle.trim();
    const descClean = taskDesc.trim();
    const assigneeClean = taskAssignee.trim();
    
    if (!titleClean) {
      setValidationError("Chore title is required. Please type a valid task.");
      return;
    }
    if (titleClean.length > 150) {
      setValidationError("Chore title is too long (Max: 150 characters).");
      return;
    }
    if (descClean.length > 1000) {
      setValidationError("Chore description is too long (Max: 1000 characters).");
      return;
    }
    if (!assigneeClean) {
      setValidationError("An assignee is required to synchronize the task.");
      return;
    }
    
    // Success: clear validation error
    setValidationError(null);

    try {
      if (editMode) {
        // EDIT SPECIFIC TASK
        const docRef = doc(db, "tasks", editingTaskId);
        const updated = {
          title: titleClean,
          description: descClean,
          priority: taskPriority,
          status: taskStatus,
          isCompleted: taskStatus === 'Completed',
          assignedUser: assigneeClean,
          creator: taskCreator,
          dueDate: taskDueDate
        };
        await updateDoc(docRef, updated);
        triggerNotification(`Updated Chore: "${titleClean}"`);
        await dispatchNotification('TASK_ASSIGNED', 'Chore Updated! 🔄', `${user?.name || 'Someone'} updated "${titleClean}" details.`);
      } else {
        // CREATE NEW TASK
        const newId = "tsk_" + Math.random().toString(36).substring(4);
        const newTask: SimulatedTask = {
          id: newId,
          workspaceId: user?.workspaceId || "sweet-home",
          title: titleClean,
          description: descClean,
          priority: taskPriority,
          status: taskStatus,
          isCompleted: taskStatus === 'Completed',
          creator: taskCreator || (user?.name || "Wikihadi"),
          assignedUser: assigneeClean || "Anyone",
          dueDate: taskDueDate,
          creationDate: Date.now(),
          attachments: [],
          comments: [],
          isArchived: false
        };
        await setDoc(doc(db, "tasks", newId), newTask);
        triggerNotification(`Created New Chore: "${titleClean}"`);
        await dispatchNotification('NEW_TASK', 'New Chore Posted! 📝', `${user?.name || 'Someone'} added chore "${titleClean}" assigned to ${assigneeClean}.`);
      }

      // Reset Form State
      setTaskTitle('');
      setTaskDesc('');
      setTaskPriority('MEDIUM');
      setTaskStatus('Pending');
      setTaskAssignee(user?.name || 'Wikihadi');
      setTaskDueDate('2026-06-25');
      setEditMode(false);
      setEditingTaskId('');
      triggerScreenChange('TaskList');
    } catch (err) {
      console.error(err);
      triggerNotification("Operation denied. Check network connection or permission boundaries.");
      handleFirestoreError(err, editMode ? OperationType.UPDATE : OperationType.CREATE, "tasks");
    }
  };

  const handleToggleTaskStatusDirectly = async (task: SimulatedTask) => {
    try {
      const docRef = doc(db, "tasks", task.id);
      const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      await updateDoc(docRef, {
        status: nextStatus,
        isCompleted: nextStatus === 'Completed'
      });
      triggerNotification(`Task "${task.title}" updated to ${nextStatus}`);
      if (nextStatus === 'Completed') {
        await dispatchNotification('TASK_COMPLETED', 'Chore Completed! ✅', `${user?.name || 'Someone'} completed "${task.title}". Great effort!`);
      } else {
        await dispatchNotification('TASK_ASSIGNED', 'Chore Restored! 🔄', `${user?.name || 'Someone'} restored "${task.title}" to active board.`);
      }
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${task.id}`);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, "tasks", id));
      triggerNotification("Chore deleted successfully.");
      setSelectedTaskForDetails(null);
      triggerScreenChange('TaskList');
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.DELETE, `tasks/${id}`);
    }
  };

  const handleAssignTaskDirectly = async (taskId: string, assignee: string) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), {
        assignedUser: assignee
      });
      triggerNotification(`Task reassigned to ${assignee}`);
      const t = tasks.find(item => item.id === taskId);
      await dispatchNotification('TASK_ASSIGNED', 'Chore Delegated! 👤', `Chore "${t?.title || 'task'}" delegated to ${assignee}.`);
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  // Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForDetails || !commentInput.trim()) return;

    try {
      const newComment: TaskComment = {
        id: "com_" + Math.random().toString(36).substring(4),
        author: user?.name || "Wikihadi (You)",
        text: commentInput,
        timestamp: Date.now()
      };

      const updatedComments = [...(selectedTaskForDetails.comments || []), newComment];
      await updateDoc(doc(db, "tasks", selectedTaskForDetails.id), {
        comments: updatedComments
      });
      setCommentInput('');
      triggerNotification("Comment published.");
    } catch (err) {
      console.error(err);
    }
  };

  // Add Attachment Link
  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForDetails || !attachmentNameInput.trim()) return;

    try {
      const url = attachmentUrlInput.trim() || "https://example.com/preview";
      const newAttachment: TaskAttachment = {
        name: attachmentNameInput,
        url: url
      };

      const updatedAttachments = [...(selectedTaskForDetails.attachments || []), newAttachment];
      await updateDoc(doc(db, "tasks", selectedTaskForDetails.id), {
        attachments: updatedAttachments
      });

      setAttachmentNameInput('');
      setAttachmentUrlInput('');
      setShowAttachmentForm(false);
      triggerNotification("Attachment linked to task.");
    } catch (err) {
      console.error(err);
    }
  };

  // Archive all Completed Tasks
  const handleArchiveCompletedTasks = async () => {
    try {
      const completedUnarchived = tasks.filter(t => t.status === 'Completed' && !t.isArchived);
      if (completedUnarchived.length === 0) {
        triggerNotification("No completed chores available to archive.");
        return;
      }

      for (const t of completedUnarchived) {
        await updateDoc(doc(db, "tasks", t.id), { isArchived: true });
      }

      triggerNotification(`Archived ${completedUnarchived.length} completed chores.`);
    } catch (err) {
      console.error(err);
    }
  };

  // Restore all Archived Tasks
  const handleRestoreArchivedTasks = async () => {
    try {
      const archivedTasksList = tasks.filter(t => t.isArchived);
      if (archivedTasksList.length === 0) {
        triggerNotification("No archived chores to restore.");
        return;
      }

      for (const t of archivedTasksList) {
        await updateDoc(doc(db, "tasks", t.id), { isArchived: false });
      }

      triggerNotification(`Restored ${archivedTasksList.length} chores to active board.`);
    } catch (err) {
      console.error(err);
    }
  };

  // Send a Chat Message with simulated AI Response
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !user) return;

    const originalInput = chatInput;
    const msgId = "msg_" + Math.random().toString(36).substring(4);
    
    // Construct rich message schema
    const userMsg = {
      id: msgId,
      workspaceId: user?.workspaceId || "sweet-home",
      senderName: user.name,
      senderRole: user.role,
      avatarUrl: user.avatarUrl || "👤",
      text: originalInput,
      timestamp: Date.now(),
      status: "sent" as const,
      readBy: [user.name] // Sender has read by default
    };

    try {
      // Clear current user's typing state immediately on send
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      await setDoc(doc(db, "typing", user.uid), {
        uid: user.uid,
        name: user.name,
        timestamp: Date.now(),
        isTyping: false
      });

      setChatInput('');
      
      // Save message & dispatch notification center entry
      await setDoc(doc(db, "messages", userMsg.id), userMsg);
      await dispatchNotification('NEW_MESSAGE', `New Message from ${user.name} 💬`, originalInput);

      setIsBotTyping(true);
      // Simulate AI Bot typing state on Firestore presence
      await setDoc(doc(db, "typing", "usr_bot"), {
        uid: "usr_bot",
        name: "TaskBot (AI)",
        timestamp: Date.now(),
        isTyping: true
      });

      // Trigger automatic AI parsing agent responses
      setTimeout(async () => {
        let reply = "Your message is recorded on our family sync bridge.";
        let autoTaskToAdd: Partial<SimulatedTask> | null = null;

        const phrase = originalInput.toLowerCase();
        if (phrase.includes("car") || phrase.includes("wash") || phrase.includes("خودرو")) {
          reply = "I identified a chore! Adding 'Wash the family car' for Ali (Dad).";
          autoTaskToAdd = { title: "Wash family car", description: "Ensure clean exterior and clean windows", priority: "HIGH", assignedUser: "Ali (Dad)" };
        } else if (phrase.includes("shop") || phrase.includes("grocery") || phrase.includes("خرید")) {
          reply = "Household stock trigger! Posting grocery task assigned to Maryam (Mom).";
          autoTaskToAdd = { title: "Household Grocery Shopping", description: "Fetch milk, bread, organic veggies", priority: "MEDIUM", assignedUser: "Maryam (Mom)" };
        } else if (phrase.includes("add task") || phrase.includes("تسک جدید")) {
          const titleExtract = originalInput.replace(/add task|تسک جدید/gi, '').trim();
          reply = `Creating on-demand task: "${titleExtract || "Miscellaneous Household Chore"}"`;
          autoTaskToAdd = { title: titleExtract || "AI Requested Chore", description: "Created automatically from family chat trigger.", priority: "MEDIUM", assignedUser: "Everyone" };
        } else if (phrase.includes("hello") || phrase.includes("سلام")) {
          reply = isRtl 
            ? "سلام خدمت اعضای خانواده! من دستیار هوشمند شما تسک‌بات هستم. برای ثبت سریع کار، بنویسید: add task [عنوان]"
            : "Hello family! I am TaskBot. Type 'add task [chore]' and I will list it on the active board in real-time!";
        }

        const botMsg = {
          id: "msg_" + Math.random().toString(36).substring(4),
          workspaceId: user?.workspaceId || "sweet-home",
          senderName: "TaskBot (AI)",
          senderRole: "assistant",
          avatarUrl: "🤖",
          text: reply,
          timestamp: Date.now(),
          isAi: true,
          readBy: ["TaskBot (AI)"]
        };

        // Clear Bot typing state on presence
        await setDoc(doc(db, "typing", "usr_bot"), {
          uid: "usr_bot",
          name: "TaskBot (AI)",
          timestamp: Date.now(),
          isTyping: false
        });

        await setDoc(doc(db, "messages", botMsg.id), botMsg);
        await dispatchNotification('NEW_MESSAGE', 'New Message from TaskBot 🤖', reply);

        if (autoTaskToAdd) {
          const generatedId = "tsk_" + Math.random().toString(36).substring(4);
          const fullTask: SimulatedTask = {
            id: generatedId,
            workspaceId: user?.workspaceId || "sweet-home",
            title: autoTaskToAdd.title!,
            description: autoTaskToAdd.description || "",
            priority: autoTaskToAdd.priority || "MEDIUM",
            status: "Pending",
            creator: "TaskBot (AI)",
            assignedUser: autoTaskToAdd.assignedUser || "Everyone",
            dueDate: "2026-06-25",
            isCompleted: false,
            creationDate: Date.now(),
            attachments: [],
            comments: [],
            isArchived: false
          };
          await setDoc(doc(db, "tasks", generatedId), fullTask);
          triggerNotification(`🤖 TaskBot auto-listed: "${fullTask.title}"`);
          await dispatchNotification('NEW_TASK', 'TaskBot Auto-listed Chore! 📋', `Chore "${fullTask.title}" created & assigned to ${fullTask.assignedUser}.`);
        }
        setIsBotTyping(false);
      }, 1500);

    } catch (e) {
      console.error(e);
    }
  };

  // Realtime typing handler for multiple participants
  const handleChatInputChange = async (value: string) => {
    setChatInput(value);
    if (!user) return;

    try {
      // Set active typing state to true in Firestore
      await setDoc(doc(db, "typing", user.uid), {
        uid: user.uid,
        name: user.name,
        timestamp: Date.now(),
        isTyping: value.trim().length > 0
      });

      // Automatically reset typing status after 3 seconds of inactivity
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(async () => {
        if (user) {
          await setDoc(doc(db, "typing", user.uid), {
            uid: user.uid,
            name: user.name,
            timestamp: Date.now(),
            isTyping: false
          });
        }
      }, 3000);
    } catch (err) {
      console.error("Error setting typing presence:", err);
    }
  };

  // Dispatch image list or file attachment documents into real-time conversation message logs
  const sendChatAttachment = async (type: 'image' | 'file', name: string, url: string) => {
    if (!user) {
      triggerNotification("Please log in first!");
      return;
    }

    const msgId = "msg_" + Math.random().toString(36).substring(4);
    const mediaMsg = {
      id: msgId,
      workspaceId: user?.workspaceId || "sweet-home",
      senderName: user.name,
      senderRole: user.role,
      avatarUrl: user.avatarUrl,
      text: type === 'image' ? `📷 Sent picture: "${name}"` : `📄 Sent document: "${name}"`,
      timestamp: Date.now(),
      imageUrl: type === 'image' ? url : null,
      fileAttachment: type === 'file' ? { name, url } : null,
      status: "sent" as const,
      readBy: [user.name]
    };

    try {
      // Clear self typing status
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      await setDoc(doc(db, "typing", user.uid), {
        uid: user.uid,
        name: user.name,
        timestamp: Date.now(),
        isTyping: false
      });

      await setDoc(doc(db, "messages", msgId), mediaMsg);
      await dispatchNotification('NEW_MESSAGE', `New ${type} shared by ${user.name} 📤`, name);
      triggerNotification(`${type === 'image' ? 'Image' : 'Document'} posted to sync group.`);
      setShowMediaPane(false);
    } catch (err) {
      console.error("Failed to post media chat item: ", err);
      triggerNotification("Transmission error - check DB rules");
    }
  };

  // Searching and advanced filtering computed locally
  const filteredDatabaseTasks = tasks.filter(t => {
    // 1. Search Query
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = 
      t.title.toLowerCase().includes(searchString) || 
      t.description.toLowerCase().includes(searchString) ||
      t.assignedUser.toLowerCase().includes(searchString) ||
      t.creator.toLowerCase().includes(searchString);

    if (!matchesSearch) return false;

    // 2. Archival State
    if (taskFilter === 'Archived') {
      return t.isArchived;
    }
    // Don't show archived items in active tabs
    if (t.isArchived) return false;

    // 3. Status/Priority Filters
    if (taskFilter === 'all') return true;
    if (taskFilter === 'mine') return t.assignedUser.includes('Wikihadi') || t.assignedUser.includes('You');
    if (taskFilter === 'high') return t.priority === 'HIGH';
    if (taskFilter === 'Pending') return t.status === 'Pending';
    if (taskFilter === 'In Progress') return t.status === 'In Progress';
    if (taskFilter === 'Completed') return t.status === 'Completed';

    return true;
  });

  const currentMemberRecord = workspaceMembers.find(m => m.uid === user?.uid);
  const currentUserRole = currentMemberRecord ? currentMemberRecord.role : (user?.role || 'member');
  const canManageTasks = currentUserRole === 'owner' || currentUserRole === 'admin';
  const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin';

  const handleSwitchPersona = (personUid: string) => {
    const selected = PERSON_LIST.find(p => p.uid === personUid);
    if (selected) {
      const activeWs = user?.workspaceId || "sweet-home";
      // Find if this switcher has a registered role in the workspaceMembers list
      const matchedRecord = workspaceMembers.find(m => m.uid === selected.uid);
      const switcherRole = matchedRecord ? matchedRecord.role : selected.role;
      setUser({
        uid: selected.uid,
        name: selected.name,
        email: selected.email,
        avatarUrl: selected.avatarUrl,
        role: switcherRole,
        workspaceId: activeWs
      });
      triggerNotification(`Simulating as ${selected.name} (${selected.avatarUrl})`);
    }
  };

  const activeTasksCount = tasks.filter(t => !t.isCompleted && !t.isArchived).length;
  const completedTasksCount = tasks.filter(t => t.isCompleted && !t.isArchived).length;
  const totalTasksCount = tasks.filter(t => !t.isArchived).length;

  return (
    <div className="flex flex-col items-center justify-center p-2 relative w-full gap-4">
      
      {/* EXPLICIT JETPACK SCREEN ROUTER SELECT PANEL */}
      <div className="w-full bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-left">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-sans">
            Jetpack Compose Native Screen Controller
          </label>
          <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150">
            Realtime DB Connected
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2">
          {(Object.keys(screenToFilePath) as ComposeScreen[]).map((screenName) => (
            <button
              key={screenName}
              id={`screen-btn-${screenName}`}
              onClick={() => {
                setEditMode(false);
                triggerScreenChange(screenName);
              }}
              className={`px-3 py-1.5 text-[10px] font-medium rounded-xl border text-left truncate transition-all flex items-center justify-between ${
                activeComposeScreen === screenName
                  ? 'bg-indigo-600 text-white border-transparent shadow'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{screenName}</span>
              <Layers size={10} className="opacity-60" />
            </button>
          ))}
        </div>

        {/* ACTIVE SIMULATED PERSONA GRID */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block font-sans mb-2">
            Active Persona (Tap to simulate multi-device Firestore sync)
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {PERSON_LIST.map((p) => {
              const isSelected = user?.uid === p.uid;
              return (
                <button
                  key={p.uid}
                  id={`persona-btn-${p.uid}`}
                  onClick={() => handleSwitchPersona(p.uid)}
                  className={`py-1.5 px-1 rounded-xl text-[10px] font-bold border transition-all flex flex-col sm:flex-row items-center justify-center gap-1 leading-none ${
                    isSelected 
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs' 
                      : 'bg-slate-50 border-slate-150 text-slate-650 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-sm">{p.avatarUrl}</span>
                  <span className="truncate text-[9.5px] text-center font-sans font-medium">{p.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Overlay Notification Inside Phone */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 16 }}
            exit={{ opacity: 0, y: -40 }}
            className="absolute top-44 left-6 right-6 z-50 bg-slate-900 border border-indigo-500/40 text-indigo-300 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs"
          >
            <Bell size={14} className="shrink-0 animate-bounce text-amber-400" />
            <span className="font-sans line-clamp-1">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PHONE FRAME HOUSING THE LIVE EMULATOR */}
      <div className="relative w-[345px] h-[690px] bg-slate-950 rounded-[48px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,1)] border-4 border-slate-800">
        
        {/* Speaker Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-950 rounded-full z-40 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 mr-2"></div>
          <div className="w-12 h-1 bg-slate-900 rounded"></div>
        </div>

        {/* Inner Web Screen Wrapper */}
        <div className={`w-full h-full rounded-[38px] overflow-hidden flex flex-col font-sans transition-colors duration-300 relative ${
          theme === 'Dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'
        }`}>
          
          {/* Status Bar with Live Bell */}
          <div className={`px-5 pt-4 pb-1.5 flex items-center justify-between text-[10px] font-medium tracking-tight select-none z-30 relative ${
            theme === 'Dark' ? 'text-slate-400 bg-slate-900' : 'text-slate-600 bg-slate-50'
          }`}>
            <span className="font-mono">{simTime}</span>
            <div className="flex items-center gap-2">
              <span className="text-[7.5px] uppercase font-bold text-indigo-500 tracking-wider">● LiveSync</span>
              
              {/* INTERACTIVE BELL NOTIFICATION TRINKET */}
              <button
                id="live-bell-btn"
                onClick={() => {
                  setShowNotificationsTray(prev => !prev);
                  setUnreadNotificationsCount(0);
                  lastCheckedNotificationTimeRef.current = Date.now();
                }}
                className="relative p-0.5 hover:text-indigo-600 dark:hover:text-amber-400 transition-all cursor-pointer inline-flex items-center"
              >
                <Bell size={12} className={unreadNotificationsCount > 0 ? "text-amber-500 animate-bounce" : ""} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full flex items-center justify-center text-[6px] font-black font-mono text-white px-0.5 shadow-sm">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {isNetworkOffline || forceOfflineSimulation ? (
                <span className="text-rose-500 font-extrabold flex items-center gap-0.5 animate-pulse text-[8.5px]">OFFLINE ⚠️</span>
              ) : (
                <Wifi size={11} className="text-emerald-500 shrink-0" />
              )}
              <Battery size={11} className="text-indigo-600 shrink-0" />
            </div>
          </div>

          {/* SIMULATED LAYOUT CONTAINER */}
          <div className="flex-1 overflow-hidden flex flex-col relative">

            {/* OFFLINE MODE NOTIFICATION BAR */}
            {(isNetworkOffline || forceOfflineSimulation) && (
              <div className="bg-amber-500 text-slate-950 font-black px-4 py-1 text-[8.5px] text-center tracking-wide leading-tight uppercase flex items-center justify-center gap-1 z-40 shadow-sm leading-none">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                <span>Working on Local Offline Storage</span>
              </div>
            )}

            {/* FCM Real-time Push Notification Simulation */}
            <AnimatePresence>
              {fcmBanner && (
                <motion.div
                  initial={{ opacity: 0, y: -80, scale: 0.9 }}
                  animate={{ opacity: 1, y: 12, scale: 1 }}
                  exit={{ opacity: 0, y: -80, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute top-0 left-3 right-3 z-50 bg-slate-900 text-white rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.5)] p-3 border border-indigo-500/30 flex items-start gap-2.5 text-left"
                >
                  <div className="bg-indigo-600 p-2 rounded-xl text-white">
                    <Bell className="animate-bounce" size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">TaskTogether Push</span>
                      <span className="text-[7.5px] text-slate-400 font-mono">Now</span>
                    </div>
                    <h4 className="text-[10px] font-bold mt-0.5 text-white truncate leading-tight select-none">{fcmBanner.title}</h4>
                    <p className="text-[9.5px] text-slate-300 leading-tight mt-0.5 select-none">{fcmBanner.message}</p>
                  </div>
                  <button 
                    onClick={() => setFcmBanner(null)} 
                    className="text-slate-400 hover:text-white shrink-0"
                  >
                    <X size={12} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notifications History Tray Drawer */}
            <AnimatePresence>
              {showNotificationsTray && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs z-40 text-left"
                >
                  <motion.div 
                    initial={{ y: -100 }}
                    animate={{ y: 0 }}
                    exit={{ y: -100 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                    className={`absolute top-0 left-0 right-0 max-h-[85%] rounded-b-[28px] p-4 flex flex-col shadow-2xl border-b z-40 ${
                      theme === 'Dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-205 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 dark:text-white">
                        <Bell size={13} className="text-indigo-500 shrink-0" />
                        <span>Family Sync Logs ({notifications.length})</span>
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            for (const n of notifications) {
                              try {
                                await deleteDoc(doc(db, "notifications", n.id));
                              } catch (e) {
                                console.error(e);
                              }
                            }
                            triggerNotification("Cleared notifications history!");
                          }}
                          className="text-[9px] text-slate-400 hover:text-rose-500 font-bold px-1 py-0.5 active:scale-95"
                        >
                          Clear All
                        </button>
                        <button 
                          onClick={() => {
                            setShowNotificationsTray(false);
                            lastCheckedNotificationTimeRef.current = Date.now();
                            setUnreadNotificationsCount(0);
                          }} 
                          className="text-slate-400 hover:text-slate-650 bg-slate-100 dark:bg-slate-850 p-1 rounded-lg"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto py-2.5 space-y-2 max-h-72">
                      {notifications.length === 0 ? (
                        <p className="text-center text-[10px] text-slate-400 py-8 italic font-sans select-none">
                          No notifications recorded on family bridge.
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            className="p-2 rounded-xl text-[10px] bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 font-sans"
                          >
                            <div className="flex justify-between items-start mb-1 text-[8px]">
                              <span className={`px-1 rounded font-black uppercase tracking-wider scale-95 origin-left ${
                                n.type === 'NEW_TASK' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' :
                                n.type === 'TASK_COMPLETED' ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400' :
                                n.type === 'TASK_ASSIGNED' ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400' :
                                n.type === 'NEW_MEMBER' ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400' :
                                'bg-slate-100 text-slate-700 dark:bg-slate-850 dark:text-slate-350'
                              }`}>
                                {n.type?.replace('_', ' ') || 'Notification'}
                              </span>
                              <span className="text-slate-400 font-mono">
                                {new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 leading-tight block">{n.title}</h4>
                            <p className="text-slate-550 dark:text-slate-400 mt-0.5 leading-snug">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* --- SCREEN 1: SPLASH --- */}
            {activeComposeScreen === 'Splash' && (
              <div className="flex-1 bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-900 flex flex-col items-center justify-center text-white p-6 justify-between h-full py-12 text-center animate-fade-in select-none">
                <div className="text-[9px] font-mono tracking-widest text-indigo-300 uppercase">
                  Production Release Ready
                </div>
                
                <div className="flex flex-col items-center">
                  {/* Adaptive Icon Shape representation */}
                  <div className="relative w-24 h-24 mb-5 group">
                    {/* Circle Background representing Adaptive Icon background element */}
                    <div className="absolute inset-0 bg-indigo-650 dark:bg-indigo-600 rounded-[32%] flex items-center justify-center shadow-xl border border-white/20 transform hover:rotate-12 transition-transform duration-500">
                      {/* Foreground elements */}
                      <CheckSquare size={52} className="text-white drop-shadow-md" />
                    </div>
                    {/* Corner badge for Version 2.1.0 */}
                    <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full border border-emerald-300 shadow-md animate-pulse">
                      BUILD 14
                    </span>
                  </div>
                  
                  <h1 className="text-2xl font-black tracking-wider uppercase leading-none font-sans">
                    TaskTogether
                  </h1>
                  <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest mt-1.5 font-mono">
                    Karamana Mobile Systems LLC
                  </p>
                  
                  <div className="mt-4 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] text-white/80 font-mono tracking-wide">
                    SDK API v2.1.0-Release
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 w-full">
                  {/* Real-time synchronization loader simulated indicator */}
                  <div className="w-full bg-indigo-950/40 p-2 rounded-xl border border-white/5 space-y-1 text-left max-w-xs">
                    <div className="flex items-center justify-between text-[8px] font-mono text-indigo-300">
                      <span>● Firebase Analytics sync...</span>
                      <span className="text-emerald-400">ACTIVE</span>
                    </div>
                    <div className="flex items-center justify-between text-[8px] font-mono text-indigo-300">
                      <span>● Firestore Security rules...</span>
                      <span className="text-emerald-400">VERIFIED</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => triggerScreenChange('Login')}
                    className="w-full max-w-xs py-2 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs uppercase tracking-wide rounded-xl shadow-md cursor-pointer transition-colors"
                  >
                    Enter Workspace
                  </button>
                </div>
              </div>
            )}

            {/* --- SCREEN 2: LOGIN --- */}
            {activeComposeScreen === 'Login' && (
              <div className="flex-1 flex flex-col p-6 text-center justify-between h-full pt-10 select-none animate-fade-in">
                <div className="flex flex-col items-center mt-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md mb-4 text-white">
                    <CheckSquare size={32} />
                  </div>
                  <h1 className="text-xl font-black tracking-tight text-slate-800 dark:text-white uppercase leading-none">
                    TaskTogether
                  </h1>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 dark:text-indigo-400 font-bold mt-1.5">
                    {strings.slogan}
                  </span>
                </div>

                <div className="space-y-3 px-1">
                  <h2 className="text-xs font-bold leading-snug dark:text-slate-200 text-slate-800 uppercase tracking-widest">
                    Google Sign-In Mockup
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Collaborate with family members securely. Sync task workloads in real-time under Firestore layers.
                  </p>
                </div>

                {/* Locale Picker */}
                <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl flex items-center justify-around text-[11px] border border-slate-200 dark:border-slate-800">
                  <button onClick={() => setLanguage('En')} className={`px-4 py-1.5 rounded-lg transition-all ${language === 'En' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>English</button>
                  <button onClick={() => setLanguage('Fa')} className={`px-4 py-1.5 rounded-lg transition-all ${language === 'Fa' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>فارسی</button>
                </div>

                <div className="mb-4">
                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs shadow-md active:scale-95 transition-transform"
                  >
                    <span className="text-base font-extrabold text-indigo-500">G</span>
                    <span>{strings.signInG}</span>
                  </button>
                </div>
              </div>
            )}

            {/* --- SCREEN 3: HOME DASHBOARD --- */}
            {activeComposeScreen === 'HomeDashboard' && (
              <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto animate-fade-in justify-between">
                <div>
                  {/* Dashboard Header */}
                  <div className="flex justify-between items-center mb-1">
                    <h2 className={`font-bold text-lg dark:text-white ${isRtl ? 'text-right' : 'text-left'}`}>
                      {language === 'Fa' ? 'داشبورد خانه' : 'Family Dashboard'}
                    </h2>
                    <span role="img" aria-label="house" className="text-lg">🏡</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-3 block">
                    {language === 'Fa' ? 'خلاصه وضعیت فعالیت‌های خانواده' : 'Quick updates on household duties.'}
                  </p>

                  {/* Circular Statistics metric */}
                  <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between mb-3.5">
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {language === 'Fa' ? 'پیشرفت کارهای فعال' : 'Active Work Progress'}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        {language === 'Fa' ? `${completedTasksCount} کار از ${totalTasksCount} کار هماهنگ شده` : `${completedTasksCount} of ${totalTasksCount} chores completed`}
                      </p>
                    </div>
                    {/* Circle SVGs */}
                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                      <svg className="w-12 h-12 transform -rotate-90">
                        <circle cx="24" cy="24" r="18" strokeWidth="3" stroke={theme === 'Dark' ? "#1e293b" : "#f1f5f9"} fill="transparent" />
                        <circle cx="24" cy="24" r="18" strokeWidth="4" stroke="#4f46e5" fill="transparent" 
                          strokeDasharray={113}
                          strokeDashoffset={113 - (113 * (totalTasksCount ? completedTasksCount / totalTasksCount : 0))}
                        />
                      </svg>
                      <span className="absolute text-[8.5px] font-bold dark:text-white">
                        {Math.round(totalTasksCount ? (completedTasksCount / totalTasksCount) * 100 : 0)}%
                      </span>
                    </div>
                  </div>

                  {/* TaskBot suggestion card */}
                  <div className="bg-indigo-50/70 dark:bg-indigo-950/20 p-3.5 rounded-2xl border border-indigo-100/40 dark:border-indigo-900/10 flex items-start gap-2.5 mb-3.5">
                    <Sparkles size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <h5 className="text-[10.5px] font-extrabold text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">
                        TaskBot Advisory
                      </h5>
                      <p className="text-[10px] text-indigo-650 dark:text-indigo-300/80 leading-relaxed mt-1">
                        {language === 'Fa' 
                          ? `ما در حال حاضر ${activeTasksCount} کار باز در تخته داریم. برای ثبت مستقیم، بگویید «grocery shopping»!` 
                          : `We currently have ${activeTasksCount} active chores pending. Say "wash the family car" in the family chat for instant listing!`
                        }
                      </p>
                    </div>
                  </div>

                  {/* Circle Roster list */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {language === 'Fa' ? 'جمع صمیمی خانواده' : 'Active Family Circle'}
                    </label>
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                      {["🧔 Wikihadi", "👩 Maryam", "👨 Ali", "👧 Sarah"].map((member, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-[10px] font-medium shrink-0 shadow-sm dark:text-slate-200">
                          {member}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <button 
                    onClick={() => triggerScreenChange('TaskList')}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow"
                  >
                    <CheckSquare size={13} />
                    <span>{language === 'Fa' ? 'ورود به بورد خانوادگی' : 'Open Family Task Board'}</span>
                  </button>
                  <button 
                    onClick={() => triggerScreenChange('GroupChat')}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:text-slate-950 font-bold rounded-xl text-xs text-white flex items-center justify-center gap-2 shadow border dark:border-transparent"
                  >
                    <MessageSquare size={13} />
                    <span>{language === 'Fa' ? 'اتاق چت صمیمی خانه' : 'Go to Family Chat'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* --- SCREEN 4: TASK LIST BOARD --- */}
            {activeComposeScreen === 'TaskList' && (
              <div className="flex-1 flex flex-col p-4 overflow-hidden h-full">
                
                {/* Board Header Title */}
                <div className="flex justify-between items-center mb-2 shrink-0">
                  <h3 className="text-sm font-bold dark:text-white">Family Task board</h3>
                  <button 
                    onClick={() => {
                      setEditMode(false);
                      triggerScreenChange('AddTask');
                    }} 
                    className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-1.5 border border-indigo-100 dark:border-indigo-900/10 rounded-xl font-bold flex items-center gap-1.5"
                  >
                    <Plus size={11} />
                    <span>{strings.addTask}</span>
                  </button>
                </div>

                {/* Instant Search Bar */}
                <div className="relative mb-2.5 shrink-0">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search titles, descriptions, assignees..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <Search size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                      <X size={11} />
                    </button>
                  )}
                </div>

                {/* Filter chip selector - Scrollable */}
                <div className="flex items-center gap-1 overflow-x-auto pb-2 shrink-0 select-none">
                  {[
                    { key: 'all', title: strings.allTasks },
                    { key: 'mine', title: strings.myTasks },
                    { key: 'high', title: strings.highPriority },
                    { key: 'Pending', title: 'Pending' },
                    { key: 'In Progress', title: 'In Progress' },
                    { key: 'Completed', title: 'Completed' },
                    { key: 'Archived', title: 'Archived' }
                  ].map(f => (
                    <button
                      key={f.key}
                      onClick={() => setTaskFilter(f.key as any)}
                      className={`text-[9px] px-2.5 py-1 rounded-lg border transition-all font-bold whitespace-nowrap shrink-0 ${
                        taskFilter === f.key
                          ? 'bg-slate-900 border-transparent text-white dark:bg-white dark:text-slate-900'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 bg-transparent'
                      }`}
                    >
                      {f.title}
                    </button>
                  ))}
                </div>

                {/* Main scrollable list of tasks */}
                <div className="space-y-2 flex-grow overflow-y-auto pr-1">
                  {filteredDatabaseTasks.length === 0 ? (
                    <div className="text-center py-12 flex flex-col items-center justify-center">
                      <AlertCircle size={24} className="text-slate-300 dark:text-slate-700 mb-2" />
                      <p className="text-[10px] text-slate-400 ">{strings.noTasks}</p>
                    </div>
                  ) : (
                    filteredDatabaseTasks.map(t => (
                      <div 
                        key={t.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 bg-white dark:bg-slate-850 shadow-sm border-slate-200/60 dark:border-slate-800/80 transition-all ${
                          t.status === 'Completed' ? 'bg-slate-100/40 dark:bg-slate-900/40 border-slate-100 dark:border-slate-900' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          {/* Toggle Task Checkbox status */}
                          <button
                            onClick={() => handleToggleTaskStatusDirectly(t)}
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              t.status === 'Completed'
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'border-slate-350 dark:border-slate-700'
                            }`}
                          >
                            {t.status === 'Completed' && <Check size={11} strokeWidth={4} />}
                          </button>
                          
                          {/* Info Text */}
                          <div 
                            className="min-w-0 flex-1 cursor-pointer text-left"
                            onClick={() => {
                              setSelectedTaskForDetails(t);
                              triggerScreenChange('TaskDetails');
                            }}
                          >
                            <h4 className={`text-xs font-bold leading-snug truncate ${
                              t.status === 'Completed' ? 'line-through text-slate-400 dark:text-slate-500' : 'dark:text-slate-100'
                            }`}>
                              {t.title}
                            </h4>
                            <p className="text-[8.5px] text-slate-400 dark:text-slate-400 mt-0.5 truncate">
                              👤 {t.assignedUser} • Prio: {t.priority}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[7.5px] font-bold px-1.5 py-0.5 rounded ${
                                t.status === 'Completed' 
                                  ? 'bg-green-50 dark:bg-green-950/20 text-green-600'
                                  : t.status === 'In Progress'
                                  ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600'
                                  : 'bg-slate-105 dark:bg-slate-800 text-slate-500'
                              }`}>
                                {t.status}
                              </span>
                              {t.comments && t.comments.length > 0 && (
                                <span className="text-[7.5px] text-indigo-500 dark:text-indigo-400 flex items-center gap-0.5 font-mono">
                                  💬 {t.comments.length}
                                </span>
                              )}
                              {t.attachments && t.attachments.length > 0 && (
                                <span className="text-[7.5px] text-green-500 dark:text-green-400 flex items-center gap-0.5 font-mono">
                                  📎 {t.attachments.length}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Drag indicator/Urgency color */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className={`w-2 h-2 rounded-full ${
                            t.priority === 'HIGH' ? 'bg-amber-500' : t.priority === 'MEDIUM' ? 'bg-indigo-500' : 'bg-slate-400'
                          }`} />
                          
                          {/* Quick Assign Dropdown Simulator */}
                          <select
                            value={t.assignedUser}
                            onChange={(e) => handleAssignTaskDirectly(t.id, e.target.value)}
                            className="bg-transparent dark:text-slate-400 border-none outline-none text-[8.5px] font-mono cursor-pointer"
                          >
                            <option value="Wikihadi (You)">You</option>
                            <option value="Ali (Dad)">Ali</option>
                            <option value="Maryam (Mom)">Maryam</option>
                            <option value="Sarah">Sarah</option>
                            <option value="Everyone">Everyone</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Sub Options Navigation */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0 text-center flex items-center justify-between">
                  <button 
                    onClick={() => triggerScreenChange('CompletedTasks')}
                    className="text-[9px] font-bold text-slate-400 dark:text-slate-500 hover:text-indigo-600"
                  >
                    View Timeline Log →
                  </button>
                  <button 
                    onClick={handleArchiveCompletedTasks}
                    className="text-[9.5px] font-bold text-indigo-500 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                  >
                    <Archive size={11} />
                    <span>Archive Completed</span>
                  </button>
                </div>
              </div>
            )}

            {/* --- SCREEN 5: ADD / EDIT CHORE --- */}
            {activeComposeScreen === 'AddTask' && (
              <div className="flex-1 flex flex-col p-4 overflow-y-auto animate-fade-in justify-between h-full">
                <div className="space-y-3.5 text-left">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      {editMode ? 'Edit Family Chore' : 'Compose Family Chore'}
                    </h3>
                    <button 
                      onClick={() => {
                        setEditMode(false);
                        setValidationError(null);
                        triggerScreenChange('TaskList');
                      }} 
                      className="text-slate-450 hover:text-slate-650"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {validationError && (
                    <div className="p-2.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-[10px] font-medium rounded-xl border border-rose-100 dark:border-rose-900/50 flex items-center gap-1.5 leading-snug animate-fade-in">
                      <AlertCircle size={12} className="shrink-0" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateOrEditTask} className="space-y-3">
                    
                    {/* Title */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-450 uppercase tracking-widest block">CHORE HEADLINE</label>
                      <input
                        type="text"
                        required
                        value={taskTitle}
                        onChange={e => setTaskTitle(e.target.value)}
                        placeholder="e.g., Wash family car"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-600"
                      />
                    </div>

                    {/* Desc */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-450 uppercase tracking-widest block">DETAILED WORK INSTRUCTIONS</label>
                      <textarea
                        value={taskDesc}
                        onChange={e => setTaskDesc(e.target.value)}
                        placeholder="e.g., Clean inside dash and check tire air levels."
                        className="w-full px-3 py-2 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 h-16 resize-none"
                      />
                    </div>

                    {/* Urgency and Status Selectors in Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-450 uppercase tracking-widest block">URGENCY</label>
                        <select
                          value={taskPriority}
                          onChange={e => setTaskPriority(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-705 rounded-xl text-xs text-slate-75 * dark:text-slate-300 outline-none"
                        >
                          <option value="LOW">LOW</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="HIGH">HIGH</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-450 uppercase tracking-widest block font-sans">STATUS</label>
                        <select
                          value={taskStatus}
                          onChange={e => setTaskStatus(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-705 rounded-xl text-xs text-slate-75 * dark:text-slate-300 outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>

                    {/* Assignee & Creator Fields */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-450 uppercase tracking-widest block font-sans">ASSIGNEE</label>
                        <select
                          value={taskAssignee}
                          onChange={e => setTaskAssignee(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-705 rounded-xl text-xs text-slate-75 * dark:text-slate-300 outline-none"
                        >
                          <option value="Everyone">Everyone</option>
                          <option value="Wikihadi (You)">You (Wikihadi)</option>
                          <option value="Ali (Dad)">Ali (Dad)</option>
                          <option value="Maryam (Mom)">Maryam (Mom)</option>
                          <option value="Sarah">Sarah</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-450 uppercase tracking-widest block font-sans">CREATOR</label>
                        <select
                          value={taskCreator}
                          onChange={e => setTaskCreator(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-705 rounded-xl text-xs text-slate-75 * dark:text-slate-300 outline-none"
                        >
                          <option value="Wikihadi (You)">You (Wikihadi)</option>
                          <option value="Ali (Dad)">Ali (Dad)</option>
                          <option value="Maryam (Mom)">Maryam (Mom)</option>
                          <option value="TaskBot (AI)">TaskBot (AI)</option>
                        </select>
                      </div>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-450 uppercase tracking-widest block">DUE TARGET DATE</label>
                      <input
                        type="date"
                        required
                        value={taskDueDate}
                        onChange={e => setTaskDueDate(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs shadow-md mt-2 cursor-pointer transition-transform duration-100 active:scale-95"
                    >
                      {editMode ? 'Save Chore Changes' : 'Publish Chore to Board'}
                    </button>
                  </form>
                </div>

                <button 
                  onClick={() => {
                    setEditMode(false);
                    triggerScreenChange('TaskList');
                  }}
                  className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 py-3 block hover:underline"
                >
                  Cancel and discard
                </button>
              </div>
            )}

            {/* --- SCREEN 6: TASK DETAILS INSPECTOR (WITH COMMENTS & ATTACHMENTS) --- */}
            {activeComposeScreen === 'TaskDetails' && (
              <div className="flex-1 flex flex-col p-4 overflow-y-auto animate-fade-in justify-between h-full">
                {selectedTaskForDetails ? (
                  <div className="space-y-3.5 text-left pb-4">
                    <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                      <button 
                        onClick={() => triggerScreenChange('TaskList')} 
                        className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-[10px]"
                      >
                        <ChevronLeft size={12} stopColor="currentColor" />
                        <span>Chore Board</span>
                      </button>
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-500">
                        Chore Inspection
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-slate-905 dark:text-white leading-snug">
                        {selectedTaskForDetails.title}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${
                          selectedTaskForDetails.status === 'Completed' 
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400' 
                            : 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400'
                        }`}>
                          {selectedTaskForDetails.status}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                          Prio: {selectedTaskForDetails.priority}
                        </span>
                      </div>
                    </div>

                    {/* Description Body */}
                    <div className="p-3 bg-white dark:bg-slate-850 rounded-xl space-y-1 border border-slate-150 dark:border-slate-800">
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">INSTRUCTIONS</label>
                      <p className="text-[10.5px] text-slate-600 dark:text-slate-350 leading-relaxed font-sans">
                        {selectedTaskForDetails.description || "No specific instructions listed."}
                      </p>
                    </div>

                    {/* Metadata attributes */}
                    <div className="space-y-1.5 border-t border-slate-200/50 dark:border-slate-800/80 pt-2 text-[10px] font-sans text-slate-500">
                      <div className="flex justify-between">
                        <span>Creator of Goal:</span>
                        <strong className="text-slate-700 dark:text-slate-200">{selectedTaskForDetails.creator}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Assigned family:</span>
                        <strong className="text-slate-700 dark:text-slate-200">{selectedTaskForDetails.assignedUser}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Logged date:</span>
                        <strong className="text-slate-700 dark:text-slate-200">{new Date(selectedTaskForDetails.creationDate).toLocaleDateString()}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Target Due:</span>
                        <strong className="text-rose-600 font-bold">{selectedTaskForDetails.dueDate}</strong>
                      </div>
                    </div>

                    {/* --- ATTACHMENTS SECTION --- */}
                    <div className="space-y-1.5 border-t border-slate-200/50 dark:border-slate-800/85 pt-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block flex items-center gap-1">
                          <Paperclip size={10} />
                          <span>Attachments ({selectedTaskForDetails.attachments?.length || 0})</span>
                        </label>
                        <button 
                          onClick={() => setShowAttachmentForm(!showAttachmentForm)}
                          className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                        >
                          {showAttachmentForm ? 'Hide' : '+ Add link'}
                        </button>
                      </div>

                      {/* Add Attachment form */}
                      {showAttachmentForm && (
                        <form onSubmit={handleAddAttachment} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-1.5 mt-1">
                          <input
                            type="text"
                            required
                            placeholder="File name (e.g. Shopping receipt)"
                            value={attachmentNameInput}
                            onChange={e => setAttachmentNameInput(e.target.value)}
                            className="w-full px-2 py-1 bg-white dark:bg-slate-850 rounded text-[10px] outline-none"
                          />
                          <input
                            type="text"
                            placeholder="url (e.g. http://...)"
                            value={attachmentUrlInput}
                            onChange={e => setAttachmentUrlInput(e.target.value)}
                            className="w-full px-2 py-1 bg-white dark:bg-slate-850 rounded text-[10px] outline-none"
                          />
                          <button type="submit" className="w-full py-1 bg-indigo-600 text-white rounded font-bold text-[9px]">
                            Attach Document
                          </button>
                        </form>
                      )}

                      {/* Attachments List */}
                      <div className="space-y-1.5">
                        {!selectedTaskForDetails.attachments || selectedTaskForDetails.attachments.length === 0 ? (
                          <p className="text-[9px] text-slate-400 italic">No attachments added.</p>
                        ) : (
                          selectedTaskForDetails.attachments.map((att, idx) => (
                            <a
                              key={idx}
                              href={att.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 px-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-750 rounded-lg text-[9.5px] text-indigo-600 dark:text-indigo-300 flex items-center justify-between border border-transparent hover:border-indigo-150 transition-all font-medium"
                            >
                              <span className="truncate max-w-[200px]">📎 {att.name}</span>
                              <ExternalLink size={9} />
                            </a>
                          ))
                        )}
                      </div>
                    </div>

                    {/* --- COMMENTS SECTION --- */}
                    <div className="space-y-2 border-t border-slate-200/50 dark:border-slate-800 pt-3">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                        Family Comments ({selectedTaskForDetails.comments?.length || 0})
                      </label>
                      
                      {/* Comments Feed list */}
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {!selectedTaskForDetails.comments || selectedTaskForDetails.comments.length === 0 ? (
                          <p className="text-[9px] text-slate-400 italic">No comments yet. Start the synchronization conversation!</p>
                        ) : (
                          selectedTaskForDetails.comments.map((com, idx) => (
                            <div key={com.id || idx} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-0.5 border border-slate-100 dark:border-slate-800">
                              <div className="flex justify-between items-center text-[8.5px] font-bold text-indigo-600 dark:text-indigo-400">
                                <span>{com.author}</span>
                                <span className="text-slate-405 font-normal">{new Date(com.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                              <p className="text-[9.5px] text-slate-700 dark:text-slate-300 font-sans leading-tight mt-0.5">{com.text}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add Comment Inline form */}
                      <form onSubmit={handleAddComment} className="flex gap-1.5 mt-2">
                        <input
                          type="text"
                          required
                          value={commentInput}
                          onChange={e => setCommentInput(e.target.value)}
                          placeholder="Type comment details..."
                          className="flex-1 px-2.5 py-1 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-[10.5px] text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                        />
                        <button 
                          type="submit" 
                          className="p-1 px-3 bg-indigo-600 text-white font-bold rounded-lg text-[10px]"
                        >
                          Send
                        </button>
                      </form>
                    </div>

                    {/* Task Actions: Edit/Delete */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                      <button
                        onClick={async () => {
                          setEditMode(true);
                          setEditingTaskId(selectedTaskForDetails.id);
                          setTaskTitle(selectedTaskForDetails.title);
                          setTaskDesc(selectedTaskForDetails.description || '');
                          setTaskPriority(selectedTaskForDetails.priority);
                          setTaskStatus(selectedTaskForDetails.status);
                          setTaskAssignee(selectedTaskForDetails.assignedUser);
                          setTaskCreator(selectedTaskForDetails.creator);
                          setTaskDueDate(selectedTaskForDetails.dueDate);
                          triggerScreenChange('AddTask');
                        }}
                        className="flex-1 py-1 px-2.5 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-[10.5px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1 border dark:border-slate-800 cursor-pointer"
                      >
                        <Edit2 size={11} />
                        <span>Edit Chore</span>
                      </button>
                      <button
                        onClick={() => handleDeleteTask(selectedTaskForDetails.id)}
                        className="p-1 px-3 bg-rose-50/50 hover:bg-rose-100/35 border border-rose-100 text-rose-500 dark:border-transparent rounded-xl text-[10.5px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={11} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <p className="text-xs text-slate-400">Select a chore from the board list to inspect</p>
                  </div>
                )}
              </div>
            )}

            {/* --- SCREEN 7: COMPLETED TASKS TIMELINE LOG --- */}
            {activeComposeScreen === 'CompletedTasks' && (
              <div className="flex-1 flex flex-col p-4 overflow-y-auto animate-fade-in h-full select-none justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">Timeline Log</h3>
                    <button onClick={() => triggerScreenChange('TaskList')} className="text-[10px] text-indigo-600 font-bold hover:underline">
                      Back to Board
                    </button>
                  </div>
                  <p className="text-[10px] text-left text-slate-400 mb-4 block leading-relaxed">
                    Timeline ledger of completed family duties. De-select boxes to restore them to active task board.
                  </p>

                  <div className="space-y-2.5">
                    {tasks.filter(t => t.status === 'Completed').length === 0 ? (
                      <p className="text-center text-[10px] text-slate-400 py-12">No accomplished duties in this timeline cycle.</p>
                    ) : (
                      tasks.filter(t => t.status === 'Completed').map(t => (
                        <div key={t.id} className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between gap-3 shadow-sm">
                          <div className="min-w-0 flex-1 text-left">
                            <h4 className="text-xs font-bold line-through text-slate-400 truncate">{t.title}</h4>
                            <p className="text-[9px] text-indigo-500 uppercase font-mono tracking-widest mt-0.5">Checked by {t.assignedUser}</p>
                          </div>
                          <button
                            onClick={() => handleToggleTaskStatusDirectly(t)}
                            className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0 border border-green-200"
                          >
                            <Check size={11} strokeWidth={4} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <button 
                    onClick={handleArchiveCompletedTasks}
                    className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow"
                  >
                    <Archive size={12} />
                    <span>Archive All Completed ({tasks.filter(t => t.status === 'Completed' && !t.isArchived).length})</span>
                  </button>
                  
                  <button
                    onClick={handleRestoreArchivedTasks}
                    className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border dark:border-transparent rounded-xl text-xs font-bold flex items-center justify-center gap-2 "
                  >
                    <RefreshCw size={12} />
                    <span>Restore Archived Items ({tasks.filter(t => t.isArchived).length})</span>
                  </button>
                </div>
              </div>
            )}

            {/* --- SCREEN 8: FAMILY ROSTER MEMBERS --- */}
            {activeComposeScreen === 'FamilyMembers' && (
              <div className="flex-1 flex flex-col p-4 overflow-y-auto animate-fade-in justify-between h-full">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-850">
                    <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 font-sans">Family Circle</h3>
                    <button onClick={() => triggerScreenChange('InviteMember')} className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                      <Plus size={11} />
                      <span>{strings.joinWorkspace} / Invite</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {workspaceMembers.map((member) => {
                      const isMe = member.uid === user?.uid;
                      
                      // Identify role privilege hierarchy:
                      const canModifyRole = (currentUserRole === 'owner' && !isMe) ||
                        (currentUserRole === 'admin' && member.role === 'member' && !isMe);
                      const canDelete = (currentUserRole === 'owner' && !isMe) ||
                        (currentUserRole === 'admin' && member.role === 'member' && !isMe);

                      return (
                        <div key={member.uid || member.id} className="p-3 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex flex-col gap-2 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span role="img" aria-label="avatar" className="text-xl shrink-0">{member.avatarUrl || "👤"}</span>
                              <div className="text-left">
                                <h4 className="text-xs font-bold dark:text-white flex items-center gap-1">
                                  {member.name}
                                  {isMe && <span className="text-[8.5px] text-slate-400 font-normal font-sans">(You)</span>}
                                </h4>
                                <p className="text-[8.5px] text-slate-400 font-sans leading-tight">{member.email}</p>
                              </div>
                            </div>
                            
                            {/* Role code-badge */}
                            <div className="flex items-center gap-1.5 pt-0.5">
                              <span className={`text-[8.5px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                                member.role === 'owner' 
                                  ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400' 
                                  : member.role === 'admin'
                                    ? 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}>
                                {member.role}
                              </span>
                              
                              {canDelete && (
                                <button
                                  onClick={() => handleRemoveMember(member.uid)}
                                  className="p-1 text-slate-400 hover:text-rose-500 rounded bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 hover:dark:bg-rose-950/20 active:scale-95 transition-transform"
                                  title="Remove Member"
                                >
                                  <Trash2 size={11} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Role changer dropdown */}
                          {canModifyRole && (
                            <div className="flex items-center gap-2 mt-1 pt-1.5 border-t border-slate-105 dark:border-slate-800">
                              <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Change Role:</span>
                              <div className="flex gap-1">
                                {['member', 'admin', 'owner'].map((r) => {
                                  // Admins can't promote to owners
                                  if (currentUserRole === 'admin' && r === 'owner') return null;
                                  return (
                                    <button
                                      key={r}
                                      onClick={() => handleChangeRole(member.uid, r as any)}
                                      className={`text-[8px] px-2 py-0.5 rounded border transition-all ${
                                        member.role === r
                                          ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                                          : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                                      }`}
                                    >
                                      {r}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2 mt-4 pt-1">
                  <button
                    onClick={() => triggerScreenChange('InviteMember')}
                    className="w-full py-2.5 bg-indigo-600 font-bold text-white rounded-xl text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition-transform"
                  >
                    <Users size={12} />
                    <span>Invite & Simulate Members</span>
                  </button>
                </div>
              </div>
            )}

            {/* --- SCREEN 9: INVITE MEMBER SYSTEM --- */}
            {activeComposeScreen === 'InviteMember' && (
              <div className="flex-1 flex flex-col p-4 overflow-y-auto animate-fade-in justify-between h-full">
                <div className="space-y-4">
                  <div className="text-center pt-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 font-sans">Invite Members</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Share the secret join code with household members to sync rosters in real time.
                    </p>
                  </div>

                  {/* Join code layout */}
                  <div className="p-4 bg-white dark:bg-slate-850 rounded-2xl border border-slate-150 dark:border-slate-800 text-center shadow-xs space-y-3">
                    <span className="text-[8.5px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block font-sans">
                      SECRET SYSTEM JOIN CODE
                    </span>
                    <h2 className="text-2xl font-black font-mono tracking-widest text-slate-800 dark:text-white leading-none">
                      {workspace?.inviteCode || "FAM-2026"}
                    </h2>
                    <button
                      onClick={() => {
                        const code = workspace?.inviteCode || "FAM-2026";
                        navigator.clipboard.writeText(code);
                        setCopiedCode(true);
                        triggerNotification(strings.copiedCode);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="py-1 px-3.5 text-[9.5px] font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity active:scale-95"
                    >
                      <Copy size={10} />
                      <span>{copiedCode ? 'Copied!' : 'Copy Join Code'}</span>
                    </button>
                  </div>

                  {/* SIMULATED MEMBER INVITATION FORM */}
                  <div className="p-3.5 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-left shadow-xs space-y-3">
                    <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                      <span className="text-xs">👋</span>
                      <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-wide font-sans">Simulate Family Join</h4>
                    </div>
                    
                    <form onSubmit={handleSimulateInviteJoin} className="space-y-2">
                      <div>
                        <label className="text-[8.5px] font-black uppercase text-slate-400 block mb-0.5">Choose Member Profile</label>
                        <div className="flex gap-1.5 overflow-x-auto pb-1">
                          {[
                            { name: "Maryam (Mom)", avatar: "👩" },
                            { name: "Ali (Dad)", avatar: "👨" },
                            { name: "Sarah (Sister)", avatar: "👧" },
                            { name: "Grandma Ava", avatar: "👵" },
                            { name: "Uncle David", avatar: "🧔" }
                          ].map((profile) => (
                            <button
                              key={profile.name}
                              type="button"
                              onClick={() => {
                                setSimInviteName(profile.name);
                                setSimInviteAvatar(profile.avatar);
                              }}
                              className={`px-2 py-1 text-[9px] rounded-lg border shrink-0 text-left font-sans ${
                                simInviteName === profile.name 
                                  ? 'bg-indigo-50 border-indigo-400 font-bold text-indigo-600'
                                  : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}
                            >
                              <span className="mr-1">{profile.avatar}</span>
                              {profile.name.split(" ")[0]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[8.5px] font-black uppercase text-slate-400 block mb-0.5">Custom Name</label>
                          <input
                            type="text"
                            placeholder="Type a name..."
                            value={simInviteName}
                            onChange={(e) => setSimInviteName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-250 dark:border-slate-700 rounded-lg p-1.5 text-xs font-sans"
                          />
                        </div>
                        <div>
                          <label className="text-[8.5px] font-black uppercase text-slate-400 block mb-0.5">Role Assignment</label>
                          <select
                            value={simInviteRole}
                            onChange={(e) => setSimInviteRole(e.target.value as any)}
                            className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-250 dark:border-slate-700 rounded-lg p-1 text-xs font-sans"
                          >
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 font-bold text-white text-[10px] uppercase tracking-wider rounded-xl shadow-xs active:scale-95 transition-all"
                      >
                        Join Workspace Instantly ➜
                      </button>
                    </form>
                  </div>
                </div>

                <div className="space-y-1.5 mt-4">
                  <button
                    onClick={() => triggerScreenChange('FamilyMembers')}
                    className="w-full py-2 text-center text-[10px] font-bold text-slate-400 hover:text-slate-600"
                  >
                    Back to family roster
                  </button>
                </div>
              </div>
            )}

            {/* --- SCREEN 10: REAL-TIME SECURE GROUP CHAT --- */}
            {activeComposeScreen === 'GroupChat' && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden h-full animate-fade-in relative bg-slate-50 dark:bg-slate-900 text-left">
                
                {/* Chat header */}
                <div className="p-3 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-850">
                  <div className="flex items-center gap-2">
                    <span role="img" aria-label="avatar" className="text-sm">💬</span>
                    <div className="text-left">
                      <h4 className="text-[11px] font-bold leading-tight dark:text-white select-none">Family Sync Room</h4>
                      <p className="text-[8px] text-slate-400">FAM-2026 REAL-TIME BRIDGE</p>
                    </div>
                  </div>
                  <HelpCircle size={12} className="text-indigo-600 hover:text-indigo-750 cursor-pointer animate-pulse shrink-0" onClick={() => triggerNotification("Tip: Say 'Add task buy milk' or share images!")} />
                </div>

                {/* Messages feed */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {messages.map((m, idx) => {
                    const isMe = user ? (m.senderName === user.name) : m.senderName.includes("Wikihadi");
                    return (
                      <div 
                        key={m.id || idx} 
                        className={`flex items-start gap-1.5 ${isMe ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}
                      >
                        <span className="text-xs bg-slate-200 dark:bg-slate-800 p-1 rounded-full select-none">{m.avatarUrl || '👤'}</span>
                        <div className="max-w-[75%]">
                          <div className={`p-2.5 rounded-2xl text-[10px] text-left leading-relaxed ${
                            isMe 
                              ? 'bg-indigo-600 text-white rounded-tr-none' 
                              : m.isAi 
                              ? 'bg-indigo-50 dark:bg-indigo-950/45 text-indigo-950 dark:text-indigo-305 border border-indigo-150 rounded-tl-none font-sans font-medium' 
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-800/80 shadow-xs'
                          }`}>
                            <div className="font-extrabold text-[8.5px] opacity-80 mb-0.5">{m.senderName}</div>
                            <div className="font-sans whitespace-pre-wrap tracking-wide">{m.text}</div>

                            {/* Render Inline Image Attachment */}
                            {m.imageUrl && (
                              <div className="mt-1.5 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-w-[190px] shadow-sm">
                                <img src={m.imageUrl} alt="Shared Photo" className="w-full object-cover max-h-32" referrerPolicy="no-referrer" />
                              </div>
                            )}

                            {/* Render Inline File Attachment Card */}
                            {m.fileAttachment && (
                              <a 
                                href={m.fileAttachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`mt-1.5 p-2 rounded-xl border flex items-center gap-1.5 transition-all max-w-[190px] ${
                                  isMe 
                                    ? 'bg-indigo-700/60 border-indigo-500 hover:bg-indigo-800/60 text-indigo-50' 
                                    : 'bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                <FileText size={13} className="text-indigo-400 shrink-0" />
                                <div className="min-w-0 text-left flex-1">
                                  <div className="text-[9px] font-black truncate leading-tight">{m.fileAttachment.name}</div>
                                  <div className="text-[7.5px] opacity-75 font-mono uppercase">Open sync file</div>
                                </div>
                              </a>
                            )}

                            {/* Seen receipts tick indicator inside me balloon */}
                            {isMe && (
                              <div className="flex items-center justify-end gap-1 mt-1 text-[8px] opacity-80 select-none">
                                <span className="text-[7.5px] uppercase font-bold text-indigo-200 font-mono scale-90">
                                  {m.readBy && m.readBy.filter((n: string) => n !== m.senderName).length > 0 
                                    ? `Seen by ${m.readBy.filter((n: string) => n !== m.senderName).join(', ')}` 
                                    : 'Delivered'}
                                </span>
                                {m.readBy && m.readBy.filter((n: string) => n !== m.senderName).length > 0 ? (
                                  <CheckCheck size={11} className="text-emerald-300 stroke-3 shrink-0" />
                                ) : (
                                  <Check size={11} className="text-slate-300 stroke-3 shrink-0" />
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-[7.5px] text-slate-400 mt-1 px-1 font-mono text-left">
                            {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Real-time typing indicators sync list */}
                  {typingUsers.map((tu) => (
                    <div key={tu.uid} className="flex items-start gap-1.5 flex-row animate-fade-in">
                      <span className="text-xs bg-slate-250 dark:bg-slate-800 p-1 rounded-full select-none">
                        {tu.name.includes("Maryam") ? "👩" : tu.name.includes("Ali") ? "👨" : tu.name.includes("Sarah") ? "👧" : "🤖"}
                      </span>
                      <div className="max-w-[70%]">
                        <div className="p-2 py-1.5 rounded-2xl text-[9px] rounded-tl-none bg-slate-100 dark:bg-slate-800 dark:text-slate-300 text-slate-550 border border-slate-150 dark:border-slate-800/80 flex items-center gap-1 font-sans leading-none">
                          <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{tu.name}</span>
                          <span>is writing...</span>
                          <span className="inline-flex gap-0.5 ml-1">
                            <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* AI Backing response Typing Indicator indicator */}
                  {isBotTyping && !typingUsers.some(tu => tu.uid === 'usr_bot') && (
                    <div className="flex items-start gap-1.5 flex-row animate-pulse">
                      <span className="text-xs bg-slate-200 dark:bg-slate-800 p-1 rounded-full">🤖</span>
                      <div className="p-2 px-3 bg-indigo-100/60 dark:bg-indigo-950/30 rounded-2xl text-[9px] rounded-tl-none text-indigo-700 dark:text-indigo-300">
                        <span>TaskBot is parsing chore directives...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* --- CHAT MULTIMEDIA UPLOAD PRESETS POP-UP --- */}
                <AnimatePresence>
                  {showMediaPane && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="p-3 bg-white dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 shrink-0 text-left space-y-3 z-10"
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 select-none">
                          <button 
                            onClick={() => setMediaPaneTab('image')}
                            className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg transition-all ${
                              mediaPaneTab === 'image' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-650'
                            }`}
                          >
                            Shared Photos preset
                          </button>
                          <button 
                            onClick={() => setMediaPaneTab('file')}
                            className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg transition-all ${
                              mediaPaneTab === 'file' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-650'
                            }`}
                          >
                            Document presets
                          </button>
                        </div>
                        <button onClick={() => setShowMediaPane(false)} className="text-slate-400 hover:text-rose-500">
                          <X size={12} />
                        </button>
                      </div>

                      {/* Presets List */}
                      {mediaPaneTab === 'image' ? (
                        <div className="space-y-2">
                          <p className="text-[8.5px] uppercase tracking-wider text-slate-400">Instantly share real photo evidence with family:</p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { label: "Laundry Loaded 🧺", url: "https://images.unsplash.com/photo-1545173168-9f1947eebd01?w=400" },
                              { label: "Grocery Fetched 🛒", url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400" },
                              { label: "Dinner Served 🍲", url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400" },
                              { label: "Garden Misted 🌿", url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400" }
                            ].map((img, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => sendChatAttachment('image', img.label, img.url)}
                                className="flex items-center gap-1.5 p-1 px-2.5 rounded-lg border border-slate-150 dark:border-slate-800 text-[10px] font-bold text-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 hover:bg-indigo-50/55 transition-all"
                              >
                                📷 <span>{img.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-[8.5px] uppercase tracking-wider text-slate-400">Attach guideline PDFs or warranty slips:</p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { name: "Water_Bill_Receipt.pdf", url: "https://pdfobject.com/pdf/sample.pdf" },
                              { name: "Car_Policy_Specs.pdf", url: "https://pdfobject.com/pdf/sample.pdf" },
                              { name: "Chore_Guidelines.docs", url: "https://pdfobject.com/pdf/sample.pdf" }
                            ].map((docItem, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => sendChatAttachment('file', docItem.name, docItem.url)}
                                className="flex items-center gap-1.5 p-1 px-2.5 rounded-lg border border-slate-150 dark:border-slate-800 text-[9.5px] font-extrabold text-slate-705 bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 hover:bg-indigo-50/55 transition-all text-left"
                              >
                                📄 <span className="truncate">{docItem.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Custom upload builder form */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <label className="text-[8.5px] font-black text-indigo-600 dark:text-indigo-400 block mb-1 uppercase tracking-widest">Or enter custom simulated media details</label>
                        <div className="flex gap-1">
                          <input 
                            type="text" 
                            placeholder="File name (e.g., Living_Room_Cleaned)"
                            value={customMediaName}
                            onChange={(e) => setCustomMediaName(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 px-2 text-[9px] outline-none flex-1 dark:text-white"
                          />
                          <input 
                            type="text" 
                            placeholder="Image URL or attachment link"
                            value={customMediaUrl}
                            onChange={(e) => setCustomMediaUrl(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 px-2 text-[9px] outline-none flex-1 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const name = customMediaName.trim() || "Uploaded_Item.jpg";
                              const url = customMediaUrl.trim() || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400";
                              const tabType = mediaPaneTab;
                              sendChatAttachment(tabType, name, url);
                              setCustomMediaName('');
                              setCustomMediaUrl('');
                            }}
                            className="bg-indigo-600 text-white rounded-lg p-1 px-2.5 text-[9px] font-bold active:scale-95"
                          >
                            Post Presets
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Message Send Form */}
                <form onSubmit={handleSendMessage} className="p-2 shrink-0 border-t border-slate-250/50 dark:border-slate-800 bg-white dark:bg-slate-850 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowMediaPane(p => !p)}
                    className={`p-1.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      showMediaPane ? 'bg-indigo-50 border-indigo-200 text-indigo-650' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-650'
                    }`}
                  >
                    <Paperclip size={13} />
                  </button>
                  
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => handleChatInputChange(e.target.value)}
                    placeholder={strings.chatPlaceholder}
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-[11px] text-slate-850 dark:text-white outline-none"
                  />
                  
                  <button 
                    type="submit"
                    className="p-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl inline-flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Send size={11} stopColor="currentColor" />
                  </button>
                </form>

              </div>
            )}

            {/* --- SCREEN 11: SETTINGS / OPTION CONFIGS --- */}
            {activeComposeScreen === 'Settings' && (
              <div className="flex-1 flex flex-col p-4 overflow-y-auto animate-fade-in text-left justify-between h-full h-full select-none">
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Settings</h3>
                  
                  {/* Language widget */}
                  <div className="p-3 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">{strings.languageLabel}</label>
                    <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      <button onClick={() => setLanguage('En')} className={`py-1 text-[10.5px] font-bold rounded-lg transition-all ${language === 'En' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-505 dark:text-slate-400'}`}>English</button>
                      <button onClick={() => setLanguage('Fa')} className={`py-1 text-[10.5px] font-bold rounded-lg transition-all ${language === 'Fa' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-550 dark:text-slate-400'}`}>فارسی</button>
                    </div>
                  </div>

                  {/* Dark mode toggle widget */}
                  <div className="p-3 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">{strings.themeLabel}</label>
                    <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      <button onClick={() => setTheme('Light')} className={`py-1 text-[10.5px] font-bold rounded-lg transition-all ${theme === 'Light' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-555 dark:text-slate-400'}`}>{strings.lightMode}</button>
                      <button onClick={() => setTheme('Dark')} className={`py-1 text-[10.5px] font-bold rounded-lg transition-all ${theme === 'Dark' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-555 dark:text-slate-400'}`}>{strings.darkMode}</button>
                    </div>
                  </div>

                  {/* --- FAMILY WORKSPACE HUB (NEW FEATURE) --- */}
                  <div className="p-3 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
                    <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                      <span className="text-sm">🏡</span>
                      <h4 className="text-[10.5px] font-black uppercase text-indigo-600 tracking-wide font-sans">Family Workspaces</h4>
                    </div>

                    {/* Active workspace display and switcher */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Active Household</span>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-36 overflow-y-auto pr-1">
                        {workspaces.map((ws) => {
                          const isActive = ws.id === (user?.workspaceId || "sweet-home");
                          return (
                            <button
                              key={ws.id}
                              onClick={async () => {
                                if (user) {
                                  let targetRole: 'owner' | 'admin' | 'member' = 'member';
                                  try {
                                    const snap = await getDocs(collection(db, "members"));
                                    snap.forEach((doc) => {
                                      const data = doc.data();
                                      if (data.workspaceId === ws.id && data.uid === user.uid) {
                                        targetRole = data.role;
                                      }
                                    });
                                  } catch (e) {
                                    console.error(e);
                                  }
                                  
                                  setUser({
                                    ...user,
                                    role: targetRole,
                                    workspaceId: ws.id
                                  });
                                  triggerNotification(`Switched to family "${ws.name}"`);
                                }
                              }}
                              className={`w-full py-2 px-2 rounded-xl text-left flex items-center justify-between text-xs font-bold transition-all ${isActive ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span>🏠</span>
                                <div className="text-left min-w-0 truncate">
                                  <p className="leading-tight truncate">{ws.name}</p>
                                  <p className="text-[8px] text-slate-400 font-mono tracking-wide">Code: {ws.inviteCode}</p>
                                </div>
                              </div>
                              {isActive ? (
                                <span className="bg-indigo-600 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 font-sans">Active</span>
                              ) : (
                                <span className="text-[9px] text-indigo-400 font-normal hover:underline shrink-0 font-sans">Switch</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Create Workspace Form */}
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">Create New Family Circle</span>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="e.g. Grandma's Cabin"
                          value={newWorkspaceName}
                          onChange={(e) => setNewWorkspaceName(e.target.value)}
                          className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 font-sans min-w-0"
                        />
                        <button
                          onClick={() => {
                            if (newWorkspaceName.trim()) {
                              handleCreateWorkspace(newWorkspaceName);
                            } else {
                              triggerNotification("Enter workspace name first!");
                            }
                          }}
                          className="bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-wide px-3 rounded-xl hover:bg-indigo-700 shadow-sm shrink-0 font-sans"
                        >
                          Create
                        </button>
                      </div>
                    </div>

                    {/* Join Workspace Form */}
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">Join with Join Code</span>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="e.g. FAM-1234"
                          value={joinInviteCode}
                          onChange={(e) => setJoinInviteCode(e.target.value)}
                          className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 font-sans min-w-0"
                        />
                        <button
                          onClick={() => {
                            if (joinInviteCode.trim()) {
                              handleJoinWorkspace(joinInviteCode);
                            } else {
                              triggerNotification("Enter invite code first!");
                            }
                          }}
                          className="bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-wide px-3 rounded-xl hover:bg-indigo-700 shadow-sm shrink-0 font-sans"
                        >
                          Join
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* App Version Info */}
                  <div className="p-3 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest leading-none">TaskTogether Mobile</p>
                    <span className="text-[9px] text-slate-405 mt-1 block">API SDK Version 2.0.1 (Live Firestore client)</span>
                  </div>

                  {/* SYSTEM ROBUSTNESS CONTROLS */}
                  <div className="p-3 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                    <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                      <span className="text-sm">🛡️</span>
                      <h4 className="text-[10.5px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wide font-sans">Robustness Controls</h4>
                    </div>

                    <div className="space-y-2.5 text-[10.5px]">
                      {/* Offline simulation switch */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-700 dark:text-slate-300">Force Offline Mode</p>
                          <p className="text-[8.5px] text-slate-400 leading-none mt-0.5">Disconnect network for local cache syncing</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const next = !forceOfflineSimulation;
                            setForceOfflineSimulation(next);
                            triggerNotification(next ? "Network link detached!" : "Network link restored!");
                          }}
                          className={`w-10 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${forceOfflineSimulation ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${forceOfflineSimulation ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Export Backup Trigger */}
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5">
                        <p className="font-bold text-slate-700 dark:text-slate-300">Disaster Data Backup</p>
                        <p className="text-[8.5px] text-slate-400 leading-relaxed mt-0.5 mb-1.5">Download structured cloud JSON snapshot of chores, chat archives, and roster roles.</p>
                        <button
                          type="button"
                          onClick={handleBackupExport}
                          className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                        >
                          <RefreshCw size={11} className="animate-spin-slow" />
                          <span>Export Workspace Data Backup</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => triggerScreenChange('AboutUs')}
                    className="w-full text-center text-[10px] font-bold text-slate-405 p-3 hover:underline"
                  >
                    About Us & Native Developers
                  </button>
                  <button
                    onClick={() => {
                      setUser(null);
                      triggerScreenChange('Login');
                    }}
                    className="w-full py-2 bg-rose-50 hover:bg-rose-100/50 border border-rose-10 border-indigo-150 text-rose-500 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 shrink-0"
                  >
                    <LogOut size={12} />
                    <span>{strings.logout}</span>
                  </button>
                </div>
              </div>
            )}

            {/* --- SCREEN 12: ABOUT KARAMANA & RELEASE SUITE --- */}
            {activeComposeScreen === 'AboutUs' && (
              <div className="flex-1 flex flex-col p-4 bg-slate-900 text-slate-100 justify-between h-full select-none animate-fade-in overflow-y-auto">
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      K
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider">About Karamana</h3>
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-none mt-0.5">Mobile Systems Group LLC</p>
                    </div>
                  </div>

                  <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 shadow-xs space-y-2">
                    <p className="text-[10.5px] leading-relaxed text-slate-300 font-light">
                      TaskTogether is a premium collaborative chore and chat synchronization engine, native-compiled following Kotlin MVVM Clean Architecture paradigms in dynamic cloud synchronization.
                    </p>
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                      <span>Publisher State:</span>
                      <span className="text-indigo-400 font-bold">READY FOR DISTRIBUTION</span>
                    </div>
                  </div>

                  {/* Operational Settings / Compliance files */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Legal & Production Compliance</span>
                    
                    {/* Privacy Policy navigation button */}
                    <button 
                      onClick={() => triggerScreenChange('PrivacyPolicy')}
                      className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl border border-slate-750 text-left flex items-center justify-between text-[11px] font-bold transition-all"
                    >
                      <span className="flex items-center gap-2">🛡️ Privacy Policy</span>
                      <span className="text-slate-500">➜</span>
                    </button>

                    {/* Terms of Service navigation button */}
                    <button 
                      onClick={() => triggerScreenChange('TermsOfService')}
                      className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl border border-slate-750 text-left flex items-center justify-between text-[11px] font-bold transition-all"
                    >
                      <span className="flex items-center gap-2">📜 Terms of Service</span>
                      <span className="text-slate-500">➜</span>
                    </button>
                  </div>

                  {/* Play Console metrics details */}
                  <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-900/30 space-y-1.5">
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block font-sans">Play Store Release Info</span>
                    <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-indigo-300">
                      <div>Version: <span className="text-slate-200">2.1.0</span></div>
                      <div>Build Code: <span className="text-slate-200">14</span></div>
                      <div>Min SDK: <span className="text-slate-200">API 26 (Oreo)</span></div>
                      <div>Target SDK: <span className="text-slate-200">API 34 (Upside)</span></div>
                      <div>Minified code: <span className="text-emerald-400">ENABLED</span></div>
                      <div>Shrink assets: <span className="text-emerald-400">ENABLED</span></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button 
                    onClick={() => triggerScreenChange('Settings')}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wide rounded-xl shadow-sm cursor-pointer transition-colors"
                  >
                    Back to Settings
                  </button>
                </div>
              </div>
            )}

            {/* --- SCREEN 13: PRIVACY POLICY --- */}
            {activeComposeScreen === 'PrivacyPolicy' && (
              <div className="flex-1 flex flex-col p-4 bg-slate-900 text-slate-100 justify-between h-full select-none animate-fade-in">
                <div className="text-left space-y-3 overflow-y-auto pr-1 flex-1 max-h-[420px]">
                  <div className="border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider">Privacy Policy</h3>
                    <p className="text-[8.5px] text-slate-400 font-mono">Last updated: June 17, 2026</p>
                  </div>
                  
                  <p className="text-[10px] leading-relaxed text-slate-350">
                    Karamana Mobile Systems Group LLC is committed to protecting your family's data. This Privacy Policy describes how TaskTogether collects, uses, and shares your information when using our mobile application.
                  </p>
                  
                  <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider font-mono">1. Data Synchronisation</h4>
                  <p className="text-[9.5px] leading-relaxed text-slate-400">
                    TaskTogether utilizes Google Firebase (Firestore and Authentication) to synchronize chores, rosters, and chat conversations in real-time across your designated family devices. All transmitted data is encrypted in transit and secured under Firestore Security Rules limiting access and synchronization strictly to validated workspace members.
                  </p>
                  
                  <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider font-mono">2. Location and Permission Policies</h4>
                  <p className="text-[9.5px] leading-relaxed text-slate-400">
                    TaskTogether does not track user background locations, sell data to third-party data aggregators, or execute secondary telemetry harvesting. System resource usage is restricted to network monitoring to guarantee local offline cache integrity.
                  </p>
                  
                  <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider font-mono">3. Analytics and Crashlytics</h4>
                  <p className="text-[9.5px] leading-relaxed text-slate-400">
                    This application uses Google Play Services and Google Firebase Analytics to track application usage patterns anonymously. No personally identifiable information (PII) is uploaded during this cycle.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 shrink-0">
                  <button 
                    onClick={() => triggerScreenChange('AboutUs')}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wide rounded-xl cursor-pointer transition-colors"
                  >
                    Back to Info HUB
                  </button>
                </div>
              </div>
            )}

            {/* --- SCREEN 14: TERMS OF SERVICE --- */}
            {activeComposeScreen === 'TermsOfService' && (
              <div className="flex-1 flex flex-col p-4 bg-slate-900 text-slate-100 justify-between h-full select-none animate-fade-in">
                <div className="text-left space-y-3 overflow-y-auto pr-1 flex-1 max-h-[420px]">
                  <div className="border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider">Terms of Service</h3>
                    <p className="text-[8.5px] text-slate-400 font-mono">Effective June 17, 2026</p>
                  </div>
                  
                  <p className="text-[10px] leading-relaxed text-slate-350">
                    By installing and accessing the TaskTogether application, you agree to comply with and be bound by these Terms of Service. Please review them carefully.
                  </p>
                  
                  <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider font-mono">1. Permitted Workspace Use</h4>
                  <p className="text-[9.5px] leading-relaxed text-slate-400">
                    TaskTogether is meant for family chore organization and cooperative task management. Users are prohibited from utilizing our sync servers for harassing communications, sharing unlawful files, or probing cloud endpoints.
                  </p>
                  
                  <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider font-mono">2. Account Ownership & Termination</h4>
                  <p className="text-[9.5px] leading-relaxed text-slate-400">
                    Workspace founders maintain absolute control over member rosters. Any member found infringing general cooperative safety guidelines can be removed. Account configurations can be expunged using the client profile controls.
                  </p>
                  
                  <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider font-mono">3. Disclaimer of Warranties</h4>
                  <p className="text-[9.5px] leading-relaxed text-slate-400">
                    The service is provided "as is" under Karamana Mobile Systems Group LLC licenses without warranty of any kind. Google Firebase local persistence protects current work offline, but we are not responsible for any lost task progress under database force majeure events.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 shrink-0">
                  <button 
                    onClick={() => triggerScreenChange('AboutUs')}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wide rounded-xl cursor-pointer transition-colors"
                  >
                    Back to Info HUB
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* BOTTOM DEVICE BAR NAVIGATION CONTROLLER */}
          <div className={`px-2 py-2 flex.shrink-0 flex justify-around items-center border-t select-none ${
            theme === 'Dark' ? 'border-slate-800 bg-slate-850 text-slate-400' : 'border-slate-200 bg-white text-slate-500'
          }`}>
            <button 
              onClick={() => triggerScreenChange('HomeDashboard')}
              className={`flex flex-col items-center gap-0.5 cursor-pointer flex-1 ${
                activeComposeScreen === 'HomeDashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'hover:text-indigo-500'
              }`}
            >
              <Grid size={15} />
              <span className="text-[8px] font-bold uppercase tracking-wider">Home</span>
            </button>
            <button 
              onClick={() => triggerScreenChange('TaskList')}
              className={`flex flex-col items-center gap-0.5 cursor-pointer flex-1 ${
                (activeComposeScreen === 'TaskList' || activeComposeScreen === 'AddTask' || activeComposeScreen === 'TaskDetails' || activeComposeScreen === 'CompletedTasks') ? 'text-indigo-600 dark:text-indigo-400' : 'hover:text-indigo-500'
              }`}
            >
              <CheckSquare size={15} />
              <span className="text-[8px] font-bold uppercase tracking-wider">Chores</span>
            </button>
            <button 
              onClick={() => triggerScreenChange('GroupChat')}
              className={`flex flex-col items-center gap-0.5 cursor-pointer flex-1 ${
                activeComposeScreen === 'GroupChat' ? 'text-indigo-600 dark:text-indigo-400' : 'hover:text-indigo-500'
              }`}
            >
              <MessageSquare size={15} />
              <span className="text-[8px] font-bold uppercase tracking-wider">Chat</span>
            </button>
            <button 
              onClick={() => triggerScreenChange('FamilyMembers')}
              className={`flex flex-col items-center gap-0.5 cursor-pointer flex-1 ${
                (activeComposeScreen === 'FamilyMembers' || activeComposeScreen === 'InviteMember') ? 'text-indigo-600 dark:text-indigo-400' : 'hover:text-indigo-500'
              }`}
            >
              <Users size={15} />
              <span className="text-[8px] font-bold uppercase tracking-wider">Circle</span>
            </button>
            <button 
              onClick={() => triggerScreenChange('Settings')}
              className={`flex flex-col items-center gap-0.5 cursor-pointer flex-1 ${
                (activeComposeScreen === 'Settings' || activeComposeScreen === 'AboutUs') ? 'text-indigo-600 dark:text-indigo-400' : 'hover:text-indigo-500'
              }`}
            >
              <Settings size={15} />
              <span className="text-[8px] font-bold uppercase tracking-wider">Config</span>
            </button>
          </div>

          {/* Android Home Navigation Pill */}
          <div className="py-2.5 flex justify-center shrink-0 items-center">
            <div className="w-28 h-1 bg-slate-400 dark:bg-slate-700 rounded-full cursor-pointer hover:bg-slate-600 transition-colors" onClick={() => triggerScreenChange('HomeDashboard')} />
          </div>

        </div>

      </div>

    </div>
  );
}
