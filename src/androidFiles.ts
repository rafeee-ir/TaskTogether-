export interface AndroidFile {
  path: string;
  language: 'kotlin' | 'xml' | 'gradle' | 'properties' | 'json';
  content: string;
}

export const androidProjectFiles: AndroidFile[] = [
  {
    path: "settings.gradle.kts",
    language: "gradle",
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "TaskTogether"
include(":app")`
  },
  {
    path: "build.gradle.kts",
    language: "gradle",
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.google.services) apply false
}`
  },
  {
    path: "app/build.gradle.kts",
    language: "gradle",
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.google.services)
}

android {
    namespace = "com.karamana.tasktogether"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.karamana.tasktogether"
        minSdk = 26
        targetSdk = 34
        versionCode = 14
        versionName = "2.1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    signingConfigs {
        create("release") {
            storeFile = file("release-keystore.jks")
            storePassword = System.getenv("RELEASE_STORE_PASSWORD") ?: "default_store_pass"
            keyAlias = System.getenv("RELEASE_KEY_ALIAS") ?: "default_key_alias"
            keyPassword = System.getenv("RELEASE_KEY_PASSWORD") ?: "default_key_pass"
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            signingConfig = signingConfigs.getByName("release")
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // Jetpack Compose & Core
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation(platform("androidx.compose:compose-bom:2024.01.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.navigation:navigation-compose:2.7.6")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")

    // Firebase Core & Auth & Firestore & Analytics
    implementation(platform("com.google.firebase:firebase-bom:32.7.1"))
    implementation("com.google.firebase:firebase-auth-ktx")
    implementation("com.google.firebase:firebase-firestore-ktx")
    implementation("com.google.firebase:firebase-analytics-ktx")
    implementation("com.google.android.gms:play-services-auth:20.7.0")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.7.3")

    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation(platform("androidx.compose:compose-bom:2024.01.00"))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}`
  },
  {
    path: "app/src/main/AndroidManifest.xml",
    language: "xml",
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.karamana.tasktogether">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.TaskTogether">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.TaskTogether">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`
  },
  {
    path: "app/src/main/res/values/strings.xml",
    language: "xml",
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">TaskTogether</string>
    <string name="sign_in_with_google">Sign in with Google</string>
    <string name="welcome_headline">Organize Family Tasks Together</string>
    <string name="welcome_subtitle">Keep track of your group responsibilities, set milestones, and sync in real-time with family chat.</string>
</resources>`
  },
  {
    path: "app/src/main/res/values-fa/strings.xml",
    language: "xml",
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">تسک‌توگدر</string>
    <string name="sign_in_with_google">ورود با گوگل</string>
    <string name="welcome_headline">سازمان‌دهی کارهای خانوادگی با هم</string>
    <string name="welcome_subtitle">وظایف گروهی خود را پیگیری کنید، نقاط عطف تعیین کنید و همزمان در چت خانوادگی هماهنگ باشید.</string>
</resources>`
  },
  {
    path: "app/src/main/java/com/karamana/tasktogether/MainActivity.kt",
    language: "kotlin",
    content: `package com.karamana.tasktogether

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.google.firebase.analytics.FirebaseAnalytics
import com.google.firebase.analytics.ktx.analytics
import com.google.firebase.ktx.Firebase
import com.karamana.tasktogether.ui.theme.TaskTogetherTheme
import com.karamana.tasktogether.ui.navigation.AppNavigation
import java.util.Locale

class MainActivity : ComponentActivity() {
    private lateinit var firebaseAnalytics: FirebaseAnalytics

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize Firebase Analytics for Production Metrics tracking
        firebaseAnalytics = Firebase.analytics
        
        // Log telemetry start event
        val bundle = Bundle().apply {
            putString(FirebaseAnalytics.Param.SUCCESS, "true")
            putString("release_channel", "production")
            putLong("build_version_code", 14L)
        }
        firebaseAnalytics.logEvent(FirebaseAnalytics.Event.APP_OPEN, bundle)

        setContent {
            TaskTogetherTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AppNavigation()
                }
            }
        }
    }
}`
  },
  {
    path: "app/src/main/java/com/karamana/tasktogether/data/model/User.kt",
    language: "kotlin",
    content: `package com.karamana.tasktogether.data.model

data class User(
    val uid: String = "",
    val name: String = "",
    val email: String = "",
    val photoUrl: String? = null,
    val workspaceId: String? = null,
    val role: String = "member" // owner, admin, member
)`
  },
  {
    path: "app/src/main/java/com/karamana/tasktogether/data/model/Workspace.kt",
    language: "kotlin",
    content: `package com.karamana.tasktogether.data.model

data class Workspace(
    val id: String = "",
    val name: String = "",
    val ownerId: String = "",
    val inviteCode: String = "",
    val memberIds: List<String> = emptyList(),
    val createdAt: Long = System.currentTimeMillis()
)`
  },
  {
    path: "app/src/main/java/com/karamana/tasktogether/data/model/Task.kt",
    language: "kotlin",
    content: `package com.karamana.tasktogether.data.model

enum class TaskPriority {
    LOW, MEDIUM, HIGH
}

data class Task(
    val id: String = "",
    val workspaceId: String = "",
    val title: String = "",
    val description: String = "",
    val assignedToUid: String? = null,
    val assignedToName: String? = null,
    val priority: TaskPriority = TaskPriority.MEDIUM,
    val isCompleted: Boolean = false,
    val dueDate: Long = 0,
    val createdBy: String = "",
    val createdAt: Long = System.currentTimeMillis()
)`
  },
  {
    path: "app/src/main/java/com/karamana/tasktogether/data/model/ChatMessage.kt",
    language: "kotlin",
    content: `package com.karamana.tasktogether.data.model

data class ChatMessage(
    val id: String = "",
    val workspaceId: String = "",
    val senderUid: String = "",
    val senderName: String = "",
    val senderPhotoUrl: String? = null,
    val text: String = "",
    val timestamp: Long = System.currentTimeMillis()
)`
  },
  {
    path: "app/src/main/java/com/karamana/tasktogether/data/repository/AuthRepository.kt",
    language: "kotlin",
    content: `package com.karamana.tasktogether.data.repository

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.firestore.FirebaseFirestore
import com.karamana.tasktogether.data.model.User
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class AuthRepository(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val db: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    val currentUser: FirebaseUser? get() = auth.currentUser

    fun observeCurrentUser(): Flow<User?> = callbackFlow {
        val listener = auth.addAuthStateListener { firebaseAuth ->
            val firebaseUser = firebaseAuth.currentUser
            if (firebaseUser != null) {
                // Fetch user data from firestore
                db.collection("users").document(firebaseUser.uid)
                    .addSnapshotListener { snapshot, _ ->
                        val user = snapshot?.toObject(User::class.java)
                        trySend(user)
                    }
            } else {
                trySend(null)
            }
        }
        awaitClose { auth.removeAuthStateListener(listener) }
    }

    suspend fun saveUserProfile(user: User) {
        db.collection("users").document(user.uid).set(user).await()
    }

    suspend fun joinWorkspace(uid: String, workspaceId: String) {
        db.collection("users").document(uid).update("workspaceId", workspaceId).await()
        db.collection("workspaces").document(workspaceId)
            .get().addOnSuccessListener { snapshot ->
                val members = snapshot.get("memberIds") as? List<String> ?: emptyList()
                if (!members.contains(uid)) {
                    val updated = members + uid
                    db.collection("workspaces").document(workspaceId).update("memberIds", updated)
                }
            }.await()
    }

    fun signOut() {
        auth.signOut()
    }
}`
  },
  {
    path: "app/src/main/java/com/karamana/tasktogether/data/repository/TaskRepository.kt",
    language: "kotlin",
    content: `package com.karamana.tasktogether.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.karamana.tasktogether.data.model.Task
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class TaskRepository(
    private val db: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    fun observeTasks(workspaceId: String): Flow<List<Task>> = callbackFlow {
        val registration = db.collection("workspaces")
            .document(workspaceId)
            .collection("tasks")
            .orderBy("createdAt")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val tasks = snapshot?.documents?.mapNotNull { doc ->
                    doc.toObject(Task::class.java)?.copy(id = doc.id)
                } ?: emptyList()
                trySend(tasks)
            }
        awaitClose { registration.remove() }
    }

    suspend fun upsertTask(task: Task) {
        if (task.id.isEmpty()) {
            db.collection("workspaces")
                .document(task.workspaceId)
                .collection("tasks")
                .add(task)
                .await()
        } else {
            db.collection("workspaces")
                .document(task.workspaceId)
                .collection("tasks")
                .document(task.id)
                .set(task)
                .await()
        }
    }

    suspend fun toggleTaskCompletion(task: Task) {
        db.collection("workspaces")
            .document(task.workspaceId)
            .collection("tasks")
            .document(task.id)
            .update("isCompleted", !task.isCompleted)
            .await()
    }

    suspend fun deleteTask(workspaceId: String, taskId: String) {
        db.collection("workspaces")
            .document(workspaceId)
            .collection("tasks")
            .document(taskId)
            .delete()
            .await()
    }
}`
  },
  {
    path: "app/src/main/java/com/karamana/tasktogether/data/repository/ChatRepository.kt",
    language: "kotlin",
    content: `package com.karamana.tasktogether.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.karamana.tasktogether.data.model.ChatMessage
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class ChatRepository(
    private val db: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    fun observeMessages(workspaceId: String): Flow<List<ChatMessage>> = callbackFlow {
        val registration = db.collection("workspaces")
            .document(workspaceId)
            .collection("messages")
            .orderBy("timestamp")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val messages = snapshot?.documents?.mapNotNull { doc ->
                    doc.toObject(ChatMessage::class.java)?.copy(id = doc.id)
                } ?: emptyList()
                trySend(messages)
            }
        awaitClose { registration.remove() }
    }

    suspend fun sendMessage(message: ChatMessage) {
        db.collection("workspaces")
            .document(message.workspaceId)
            .collection("messages")
            .add(message)
            .await()
    }
}`
  },
  {
    path: "app/src/main/java/com/karamana/tasktogether/ui/navigation/AppNavigation.kt",
    language: "kotlin",
    content: `package com.karamana.tasktogether.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.karamana.tasktogether.ui.screen.*
import com.karamana.tasktogether.ui.viewmodel.AuthViewModel

sealed class Screen(val route: String, val title: String) {
    object Login : Screen("login", "Login")
    object SetupWorkspace : Screen("setup_workspace", "Group Workspace")
    object TaskList : Screen("tasks", "Tasks")
    object FamilyChat : Screen("chat", "Chat")
    object Profile : Screen("profile", "Profile")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppNavigation(
    authViewModel: AuthViewModel = viewModel()
) {
    val navController = rememberNavController()
    val authState by authViewModel.authState.collectAsState()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    // Direct redirection based on authentication state
    LaunchedEffect(gameState) {
        when {
            authState.user == null -> {
                navController.navigate(Screen.Login.route) {
                    popUpTo(0) { inclusive = true }
                }
            }
            authState.user?.workspaceId == null -> {
                navController.navigate(Screen.SetupWorkspace.route) {
                    popUpTo(0) { inclusive = true }
                }
            }
            currentRoute == Screen.Login.route || currentRoute == Screen.SetupWorkspace.route -> {
                navController.navigate(Screen.TaskList.route) {
                    popUpTo(0) { inclusive = true }
                }
            }
        }
    }

    Scaffold(
        bottomBar = {
            if (authState.user != null && authState.user?.workspaceId != null) {
                NavigationBar {
                    NavigationBarItem(
                        icon = { Icon(Icons.Default.List, contentDescription = "Tasks") },
                        label = { Text("Tasks") },
                        selected = currentRoute == Screen.TaskList.route,
                        onClick = {
                            navController.navigate(Screen.TaskList.route) {
                                popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                    NavigationBarItem(
                        icon = { Icon(Icons.Default.Chat, contentDescription = "Chat") },
                        label = { Text("Chat") },
                        selected = currentRoute == Screen.FamilyChat.route,
                        onClick = {
                            navController.navigate(Screen.FamilyChat.route) {
                                popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                    NavigationBarItem(
                        icon = { Icon(Icons.Default.Person, contentDescription = "Profile") },
                        label = { Text("Profile") },
                        selected = currentRoute == Screen.Profile.route,
                        onClick = {
                            navController.navigate(Screen.Profile.route) {
                                popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = Screen.Login.route,
            modifier = Modifier.padding(paddingValues)
        ) {
            composable(Screen.Login.route) {
                LoginScreen(authViewModel = authViewModel)
            }
            composable(Screen.SetupWorkspace.route) {
                SetupWorkspaceScreen(authViewModel = authViewModel)
            }
            composable(Screen.TaskList.route) {
                TaskListScreen(workspaceId = authState.user?.workspaceId.orEmpty())
            }
            composable(Screen.FamilyChat.route) {
                ChatScreen(workspaceId = authState.user?.workspaceId.orEmpty())
            }
            composable(Screen.Profile.route) {
                ProfileScreen(authViewModel = authViewModel)
            }
        }
    }
}`
  },
  {
    path: "app/src/main/java/com/karamana/tasktogether/ui/theme/Color.kt",
    language: "kotlin",
    content: `package com.karamana.tasktogether.ui.theme

import androidx.compose.ui.graphics.Color

// Minimal Modern Theme Colors (Charcoal, Mint, Slate)
val Primary = Color(0xFF1E293B)
val OnPrimary = Color(0xFFFFFFFF)
val Secondary = Color(0xFF10B981)
val OnSecondary = Color(0xFFFFFFFF)
val Tertiary = Color(0xFF64748B)

val DarkPrimary = Color(0xFFF8FAFC)
val DarkOnPrimary = Color(0xFF0F172A)
val DarkBackground = Color(0xFF0F172A)
val DarkSurface = Color(0xFF1E293B)`
  },
  {
    path: "app/src/main/java/com/karamana/tasktogether/ui/theme/Theme.kt",
    language: "kotlin",
    content: `package com.karamana.tasktogether.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = DarkPrimary,
    onPrimary = DarkOnPrimary,
    background = DarkBackground,
    surface = DarkSurface,
    onBackground = Color(0xFFF8FAFC),
    onSurface = Color(0xFFE2E8F0)
)

private val LightColorScheme = lightColorScheme(
    primary = Primary,
    onPrimary = OnPrimary,
    secondary = Secondary,
    onSecondary = OnSecondary,
    background = Color(0xFFF8FAFC),
    surface = Color(0xFFFFFFFF),
    onBackground = Color(0xFF0F172A),
    onSurface = Color(0xFF1E293B)
)

@Composable
fun TaskTogetherTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) {
        DarkColorScheme
    } else {
        LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}`
  },
  {
    path: "app/src/main/java/com/karamana/tasktogether/ui/screen/TaskListScreen.kt",
    language: "kotlin",
    content: `package com.karamana.tasktogether.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.karamana.tasktogether.data.model.Task
import com.karamana.tasktogether.ui.viewmodel.TaskViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TaskListScreen(
    workspaceId: String,
    viewModel: TaskViewModel = viewModel()
) {
    val tasks by viewModel.observeTasks(workspaceId).collectAsState(initial = emptyList())
    var showAddDialog by remember { mutableStateOf(false) }
    var newTaskTitle by remember { mutableStateOf("") }
    var newTaskDesc by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Family Workspace Tasks") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { showAddDialog = true }) {
                Icon(Icons.Default.Add, contentDescription = "Add Task")
            }
        }
    ) { paddingValues ->
        Box(modifier = Modifier.padding(paddingValues).fillMaxSize()) {
            if (tasks.isEmpty()) {
                Text(
                    text = "No family tasks listed yet. Tap + to add one!",
                    modifier = Modifier.align(Alignment.Center),
                    style = MaterialTheme.typography.bodyLarge
                )
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(tasks) { task ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(
                                containerColor = if (task.isCompleted) 
                                    MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                                else MaterialTheme.colorScheme.surface
                            )
                        ) {
                            Row(
                                modifier = Modifier.padding(16.dp).fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = task.title,
                                        style = MaterialTheme.typography.titleMedium,
                                        textDecoration = if (task.isCompleted) 
                                            androidx.compose.ui.text.style.TextDecoration.LineThrough 
                                        else null
                                    )
                                    if (task.description.isNotEmpty()) {
                                        Text(
                                            text = task.description,
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                }
                                IconButton(onClick = { viewModel.toggleTask(task) }) {
                                    Icon(
                                        imageVector = if (task.isCompleted)
                                            Icons.Default.CheckCircle
                                        else Icons.Default.Check,
                                        contentDescription = "Toggle Complete"
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        if (showAddDialog) {
            AlertDialog(
                onDismissRequest = { showAddDialog = false },
                title = { Text("Create Task") },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = newTaskTitle,
                            onValueChange = { newTaskTitle = it },
                            label = { Text("Task Title") }
                        )
                        OutlinedTextField(
                            value = newTaskDesc,
                            onValueChange = { newTaskDesc = it },
                            label = { Text("Task Description") }
                        )
                    }
                },
                confirmButton = {
                    Button(onClick = {
                        if (newTaskTitle.isNotEmpty()) {
                            viewModel.addTask(workspaceId, newTaskTitle, newTaskDesc)
                            newTaskTitle = ""
                            newTaskDesc = ""
                            showAddDialog = false
                        }
                    }) {
                        Text("Add")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showAddDialog = false }) {
                        Text("Cancel")
                    }
                }
            )
        }
    }
}`
  },
  {
    path: "app/src/main/java/com/karamana/tasktogether/ui/screen/SplashScreen.kt",
    language: "kotlin",
    content: `package com.karamana.tasktogether.ui.screen

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckSquare
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.karamana.tasktogether.R
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(onNavigateNext: () -> Unit) {
    val scale = remember { Animatable(0f) }
    LaunchedEffect(true) {
        scale.animateTo(
            targetValue = 1f,
            animationSpec = springSpec(
                dampingRatio = Spring.DampingRatioMediumBouncy,
                stiffness = Spring.StiffnessLow
            )
        )
        delay(1500)
        onNavigateNext()
    }
    Box(
        modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.primary),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                imageVector = Icons.Default.CheckSquare,
                contentDescription = "Logo",
                tint = MaterialTheme.colorScheme.onPrimary,
                modifier = Modifier.size(80.dp).scale(scale.value)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "TaskTogether",
                color = MaterialTheme.colorScheme.onPrimary,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(48.dp))
            CircularProgressIndicator(
                color = MaterialTheme.colorScheme.onPrimary,
                modifier = Modifier.size(24.dp)
            )
        }
    }
}`
  },
  {
    path: "app/src/main/java/com/karamana/tasktogether/ui/screen/LoginScreen.kt",
    language: "kotlin",
    content: `package com.karamana.tasktogether.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.karamana.tasktogether.ui.viewmodel.AuthViewModel

@Composable
fun LoginScreen(authViewModel: AuthViewModel) {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Spacer(modifier = Modifier.height(48.dp))
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                imageVector = Icons.Default.Lock,
                contentDescription = "Lock",
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text("Welcome to TaskTogether", fontSize = 22.sp, fontWeight = FontWeight.Bold)
            Text("Sync tasks and chat in a live family group", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        
        Button(
            onClick = { authViewModel.signInWithGoogleMock() },
            modifier = Modifier.fillMaxWidth().height(50.dp)
        ) {
            Text("Sign in with Google")
        }
    }
}`
  },
  {
    path: "app/src/main/java/com/karamana/tasktogether/ui/screen/HomeDashboardScreen.kt",
    language: "kotlin",
    content: `package com.karamana.tasktogether.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun HomeDashboardScreen(
    familyTasksCount: Int,
    completedTasksCount: Int,
    onNavigateToTasks: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("Family Dashboard", fontSize = 24.sp, fontWeight = FontWeight.Bold)
        
        ElevatedCard(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp)
        ) {
            Row(
                modifier = Modifier.padding(16.dp).fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("Weekly Progress", fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("$completedTasksCount of $familyTasksCount tasks finished", fontSize = 12.sp)
                }
                CircularProgressIndicator(
                    progress = if (familyTasksCount > 0) completedTasksCount.toFloat() / familyTasksCount else 0f,
                    modifier = Modifier.size(48.dp)
                )
            }
        }
        
        OutlinedCard(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("TaskBot Suggestion", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                Spacer(modifier = Modifier.height(4.dp))
                Text("Water the plants is nearing its deadline today! Ali is assigned to take care of it.", fontSize = 12.sp)
            }
        }
        
        Button(onClick = onNavigateToTasks, modifier = Modifier.fillMaxWidth()) {
            Icon(Icons.Default.Dashboard, contentDescription = "Tasks")
            Spacer(modifier = Modifier.width(8.dp))
            Text("Go to Task Board")
        }
    }
}`
  },
  {
    path: "app/src/main/java/com/karamana/tasktogether/ui/screen/AddTaskScreen.kt",
    language: "kotlin",
    content: `package com.karamana.tasktogether.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.karamana.tasktogether.data.model.TaskPriority

@Composable
fun AddTaskScreen(
    onTaskCreated: (title: String, desc: String, priority: TaskPriority) -> Unit,
    onCancel: () -> Unit
) {
    var title by remember { mutableStateOf("") }
    var desc by remember { mutableStateOf("") }
    var priority by remember { mutableStateOf(TaskPriority.MEDIUM) }

    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Create Family Task", style = MaterialTheme.typography.headlineSmall)
        
        OutlinedTextField(
            value = title,
            onValueChange = { title = it },
            label = { Text("Task Title") },
            modifier = Modifier.fillMaxWidth()
        )
        
        OutlinedTextField(
            value = desc,
            onValueChange = { desc = it },
            label = { Text("Task Description") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 3
        )
        
        Text("Select Priority", style = MaterialTheme.typography.bodyMedium)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            TaskPriority.values().forEach { prio ->
                FilterChip(
                    selected = priority == prio,
                    onClick = { priority = prio },
                    label = { Text(prio.name) }
                )
            }
        }
        
        Spacer(modifier = Modifier.weight(1f))
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedButton(onClick = onCancel, modifier = Modifier.weight(1f)) {
                Text("Cancel")
            }
            Button(
                onClick = {
                    if (title.isNotEmpty()) {
                        onTaskCreated(title, desc, priority)
                    }
                },
                modifier = Modifier.weight(1f)
            ) {
                Text("Add Task")
            }
        }
    }
}`
  },
  {
    path: "app/src/main/java/com/karamana/tasktogether/ui/screen/TaskDetailsScreen.kt",
    language: "kotlin",
    content: `package com.karamana.tasktogether.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.karamana.tasktogether.data.model.Task

@Composable
fun TaskDetailsScreen(
    task: Task,
    onToggleCompletion: () -> Unit,
    onDelete: () -> Unit,
    onBack: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Task Details", fontSize = 20.sp, fontWeight = FontWeight.Bold)
            AssistChip(
                onClick = {},
                label = { Text(if (task.isCompleted) "Completed" else "Pending") }
            )
        }
        
        Text(task.title, fontSize = 24.sp, fontWeight = FontWeight.SemiBold)
        
        if (task.description.isNotEmpty()) {
            Text(task.description, style = MaterialTheme.typography.bodyLarge)
        }
        
        Divider()
        
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.Person, contentDescription = "Assignee")
            Spacer(modifier = Modifier.width(8.dp))
            Text("Assignee: \${task.assignedToName ?: \"Everyone\"}", fontSize = 14.sp)
        }
        
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.CalendarToday, contentDescription = "Due Date")
            Spacer(modifier = Modifier.width(8.dp))
            Text("Priority: \${task.priority.name}", fontSize = 14.sp)
        }
        
        Spacer(modifier = Modifier.weight(1f))
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = onToggleCompletion,
                modifier = Modifier.weight(1f)
            ) {
                Text(if (task.isCompleted) "Mark Pending" else "Complete Task")
            }
            Button(
                onClick = onDelete,
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                modifier = Modifier.weight(1f)
            ) {
                Text("Delete Task")
            }
        }
        
        TextButton(onClick = onBack, modifier = Modifier.fillMaxWidth()) {
            Text("Back to list")
        }
    }
}`
  },
  {
    path: "app/src/main/java/com/karamana/tasktogether/ui/screen/CompletedTasksScreen.kt",
    language: "kotlin",
    content: `package com.karamana.tasktogether.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.karamana.tasktogether.data.model.Task

@Composable
fun CompletedTasksScreen(
    completedTasks: List<Task>,
    onRestoreTask: (Task) -> Unit
) {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Completed History", fontSize = 22.sp, style = MaterialTheme.typography.titleLarge)
        Text("Keep track of what has been accomplished in your family circle.", fontSize = 12.sp)
        
        if (completedTasks.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = androidx.compose.ui.Alignment.Center) {
                Text("No completed chores yet. Get started today!")
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(completedTasks) { task ->
                    Card(modifier = Modifier.fillMaxWidth()) {
                        Row(modifier = Modifier.padding(16.dp)) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    task.title,
                                    textDecoration = TextDecoration.LineThrough,
                                    fontWeight = androidx.compose.ui.text.font.FontWeight.Medium
                                )
                                Text("Assignee: \${task.assignedToName ?: \"Anyone\"}", fontSize = 11.sp)
                            }
                            IconButton(onClick = { onRestoreTask(task) }) {
                                Icon(Icons.Default.CheckCircle, contentDescription = "Restore", tint = MaterialTheme.colorScheme.primary)
                            }
                        }
                    }
                }
            }
        }
    }
}`
  },
  {
    path: "app/src/main/java/com/karamana/tasktogether/ui/screen/FamilyMembersScreen.kt",
    language: "kotlin",
    content: `package com.karamana.tasktogether.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Face
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun FamilyMembersScreen(
    members: List<String>,
    onInviteMemberClick: () -> Unit
) {
    Scaffold(
        floatingActionButton = {
            FloatingActionButton(onClick = onInviteMemberClick) {
                Icon(Icons.Default.Add, contentDescription = "Invite")
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier.padding(paddingValues).fillMaxSize().padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text("Family Workspace Circle", fontSize = 22.sp, style = MaterialTheme.typography.titleLarge)
            
            LazyColumn(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(members) { name ->
                    Card(modifier = Modifier.fillMaxWidth()) {
                        Row(modifier = Modifier.padding(16.dp), verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                            Icon(Icons.Default.Face, contentDescription = "Avatar", modifier = Modifier.size(40.dp))
                            Spacer(modifier = Modifier.width(16.dp))
                            Column {
                                Text(name, fontSize = 16.sp)
                                Text("Role: member", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }
                }
            }
        }
    }
}`
  },
  {
    path: "app/src/main/java/com/karamana/tasktogether/ui/screen/InviteMemberScreen.kt",
    language: "kotlin",
    content: `package com.karamana.tasktogether.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun InviteMemberScreen(
    inviteCode: String,
    onBack: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Text("Invite Household", fontSize = 20.sp, style = MaterialTheme.typography.titleLarge)
        
        ElevatedCard(shape = RoundedCornerShape(16.dp)) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("Your Invitation Code", fontSize = 12.sp)
                Spacer(modifier = Modifier.height(12.dp))
                Text(inviteCode, fontSize = 32.sp, style = MaterialTheme.typography.headlineMedium)
                Spacer(modifier = Modifier.height(12.dp))
                Text("Share this secret code with family members to join your workspace.", fontSize = 12.sp, style = MaterialTheme.typography.bodySmall)
            }
        }
        
        Column(modifier = Modifier.fillMaxWidth()) {
            Button(onClick = {}, modifier = Modifier.fillMaxWidth()) {
                Icon(Icons.Default.Share, contentDescription = "Share")
                Spacer(modifier = Modifier.width(8.dp))
                Text("Share invite link")
            }
            Spacer(modifier = Modifier.height(8.dp))
            TextButton(onClick = onBack, modifier = Modifier.fillMaxWidth()) {
                Text("Back to active circle")
            }
        }
    }
}`
  },
  {
    path: "app/src/main/java/com/karamana/tasktogether/ui/screen/ChatScreen.kt",
    language: "kotlin",
    content: `package com.karamana.tasktogether.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.karamana.tasktogether.data.model.ChatMessage

@Composable
fun ChatScreen(
    workspaceId: String,
    messages: List<ChatMessage>,
    onSendMessage: (String) -> Unit
) {
    var textInput by remember { mutableStateOf("") }
    
    Column(modifier = Modifier.fillMaxSize()) {
        LazyColumn(
            modifier = Modifier.weight(1f).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(messages) { msg ->
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = if (msg.senderUid == "me") Alignment.End else Alignment.Start
                ) {
                    Card {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(msg.senderName, style = MaterialTheme.typography.labelSmall)
                            Text(msg.text, style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
            }
        }
        
        Row(modifier = Modifier.padding(8.dp).fillMaxWidth()) {
            OutlinedTextField(
                value = textInput,
                onValueChange = { textInput = it },
                modifier = Modifier.weight(1f),
                placeholder = { Text("How can TaskBot help?") }
            )
            IconButton(
                onClick = {
                    if (textInput.isNotEmpty()) {
                        onSendMessage(textInput)
                        textInput = ""
                    }
                }
            ) {
                Icon(Icons.Default.Send, contentDescription = "Send")
            }
        }
    }
}`
  },
  {
    path: "app/src/main/java/com/karamana/tasktogether/ui/screen/SettingsScreen.kt",
    language: "kotlin",
    content: `package com.karamana.tasktogether.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.karamana.tasktogether.ui.viewmodel.AuthViewModel

@Composable
fun SettingsScreen(
    isDarkTheme: Boolean,
    onThemeToggle: (Boolean) -> Unit,
    lang: String,
    onLangToggle: (String) -> Unit,
    authViewModel: AuthViewModel
) {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("Application Settings", style = MaterialTheme.typography.titleLarge)
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Interface Dark Mode")
            Switch(checked = isDarkTheme, onCheckedChange = onThemeToggle)
        }
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Language / زبان")
            Row {
                FilterChip(selected = lang == "En", onClick = { onLangToggle("En") }, label = { Text("English") })
                Spacer(modifier = Modifier.width(8.dp))
                FilterChip(selected = lang == "Fa", onClick = { onLangToggle("Fa") }, label = { Text("فارسی") })
            }
        }
        
        Spacer(modifier = Modifier.weight(1f))
        
        Button(
            onClick = { authViewModel.signOut() },
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Sign Out")
        }
    }
}`
  },
  {
    path: "app/src/main/java/com/karamana/tasktogether/ui/screen/AboutScreen.kt",
    language: "kotlin",
    content: `package com.karamana.tasktogether.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun AboutScreen(onBack: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("About TaskTogether", fontSize = 24.sp, style = MaterialTheme.typography.titleLarge)
        
        Text(
            "TaskTogether is built using modern Jetpack Compose 1.5.8 and Material Design 3. " +
            "It incorporates modern MVVM state handlers, bilingual layout adaptations (English & Persian) " +
            "incorporating dynamic RTL switching, and a server-side AI agent chat sync companion.",
            style = MaterialTheme.typography.bodyMedium
        )
        
        Spacer(modifier = Modifier.weight(1f))
        
        Button(onClick = onBack, modifier = Modifier.fillMaxWidth()) {
            Text("Back to Dashboard")
        }
    }
}`
  },
  {
    path: "app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml",
    language: "xml",
    content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>`
  },
  {
    path: "app/src/main/res/drawable/ic_launcher_background.xml",
    language: "xml",
    content: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#4F46E5"
        android:pathData="M0,0h108v108h-108z" />
</vector>`
  },
  {
    path: "app/src/main/res/drawable/ic_launcher_foreground.xml",
    language: "xml",
    content: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M30 45 L48 63 L78 33"
        android:strokeColor="#FFFFFF"
        android:strokeWidth="8"
        android:strokeLineCap="round"
        android:strokeLineJoin="round" />
</vector>`
  },
  {
    path: "app/src/main/java/com/karamana/tasktogether/ui/screen/PrivacyPolicyScreen.kt",
    language: "kotlin",
    content: `package com.karamana.tasktogether.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun PrivacyPolicyScreen(onBack: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Privacy Policy", fontSize = 22.sp, style = MaterialTheme.typography.titleLarge)
        Text("Last updated: June 17, 2026", style = MaterialTheme.typography.labelSmall)
        
        Text(
            "Karamana Mobile Systems Group LLC (\"we\", \"us\", \"our\") is committed to protecting your family\'s data. This Privacy Policy describes how TaskTogether collects, uses, and shares your information when you use our mobile application.",
            style = MaterialTheme.typography.bodyMedium
        )
        
        Text("1. Data Synchronisation", style = MaterialTheme.typography.titleMedium)
        Text(
            "TaskTogether utilizes Google Firebase (Firestore and Authentication) to synchronize chores, rosters, and chat conversations in real-time across your designated family devices. All transmitted data is encrypted in transit and secured under Firestore Security Rules limiting access and synchronization strictly to validated workspace members.",
            style = MaterialTheme.typography.bodyMedium
        )
        
        Text("2. Location and Hardware Permissions", style = MaterialTheme.typography.titleMedium)
        Text(
            "TaskTogether does not track user background locations, sell data to third-party data aggregators, or execute secondary telemetry harvesting. System resource usage is restricted to network monitoring to guarantee local offline cache integrity.",
            style = MaterialTheme.typography.bodyMedium
        )
        
        Text("3. Third-party SDKs", style = MaterialTheme.typography.titleMedium)
        Text(
            "This application uses Google Play Services and Google Firebase Analytics to track application usage patterns anonymously. No personally identifiable information (PII) is uploaded during this cycle.",
            style = MaterialTheme.typography.bodyMedium
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Button(onClick = onBack, modifier = Modifier.fillMaxWidth()) {
            Text("Back to Info HUB")
        }
    }
}`
  },
  {
    path: "app/src/main/java/com/karamana/tasktogether/ui/screen/TermsOfServiceScreen.kt",
    language: "kotlin",
    content: `package com.karamana.tasktogether.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun TermsOfServiceScreen(onBack: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Terms of Service", fontSize = 22.sp, style = MaterialTheme.typography.titleLarge)
        Text("Effective Date: June 17, 2026", style = MaterialTheme.typography.labelSmall)
        
        Text(
            "By installing TaskTogether, you agree to comply with and be bound by these Terms of Service. Please review them carefully.",
            style = MaterialTheme.typography.bodyMedium
        )
        
        Text("1. Permitted Workspace Use", style = MaterialTheme.typography.titleMedium)
        Text(
            "TaskTogether is meant for family chore organization and cooperative task management. Users are prohibited from utilizing our sync servers for harassing communications, sharing unlawful files, or probing cloud endpoints.",
            style = MaterialTheme.typography.bodyMedium
        )
        
        Text("2. Account Ownership & Termination", style = MaterialTheme.typography.titleMedium)
        Text(
            "Workspace founders maintain absolute control over member rosters. Any member found infringing general cooperative safety guidelines can be removed. Account configurations can be expunged using the client profile controls.",
            style = MaterialTheme.typography.bodyMedium
        )
        
        Text("3. Disclaimer of Warranties", style = MaterialTheme.typography.titleMedium)
        Text(
            "The service is provided \"as is\" under Karamana Mobile Systems Group LLC licenses without warranty of any kind. Google Firebase local persistence protects current work offline, but we are not responsible for any lost task progress under database force majeure events.",
            style = MaterialTheme.typography.bodyMedium
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Button(onClick = onBack, modifier = Modifier.fillMaxWidth()) {
            Text("Back to Info HUB")
        }
    }
}`
  }
];

