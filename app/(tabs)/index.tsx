import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';


type UserType = {
  id: string;
  email: string;
  username: string;
  password: string;
};

type TodoDataType = {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
};


const generateId = (): string => {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

export default function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
 
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  

  const [todos, setTodos] = useState<TodoDataType[]>([]);
  const [todoText, setTodoText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [oldTodos, setOldTodos] = useState<TodoDataType[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoDataType | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem('currentUser');
        if (userData) {
          const user = JSON.parse(userData);
          setCurrentUser(user);
          setIsLoggedIn(true);
          await fetchUserTodos(user.id);
        }
      } catch (error) {
        console.log('Error checking login status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkLoginStatus();
  }, []);

  const fetchUserTodos = async (userId: string) => {
    try {
      const storedTodos = await AsyncStorage.getItem(`todos_${userId}`);
      if (storedTodos !== null) {
        const parsedTodos = JSON.parse(storedTodos);
        setTodos(parsedTodos);
        setOldTodos(parsedTodos);
      }
    } catch (error) {
      console.log('Error fetching todos:', error);
    }
  };

  const handleSignUp = async () => {
    if (!email || !username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
     
      const existingUsers = await AsyncStorage.getItem('users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];
      
      const userExists = users.some((user: UserType) => 
        user.email === email || user.username === username
      );
      
      if (userExists) {
        Alert.alert('Error', 'User with this email or username already exists');
        return;
      }
      
     
      const newUser: UserType = {
        id: generateId(),
        email,
        username,
        password, 
      };
      
      
      users.push(newUser);
      await AsyncStorage.setItem('users', JSON.stringify(users));
      
      
      await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
      setCurrentUser(newUser);
      setIsLoggedIn(true);
      await fetchUserTodos(newUser.id);
      
      Alert.alert('Success', 'Account created successfully!');
    } catch (error) {
      console.log('Error during signup:', error);
      Alert.alert('Error', 'Failed to create account');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      const usersData = await AsyncStorage.getItem('users');
      if (!usersData) {
        Alert.alert('Error', 'No users found. Please sign up first.');
        return;
      }
      
      const users = JSON.parse(usersData);
      const user = users.find((u: UserType) => 
        u.email === email && u.password === password
      );
      
      if (user) {
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(user);
        setIsLoggedIn(true);
        await fetchUserTodos(user.id);
      } else {
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch (error) {
      console.log('Error during login:', error);
      Alert.alert('Error', 'Failed to login');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('currentUser');
      setIsLoggedIn(false);
      setCurrentUser(null);
      setEmail('');
      setPassword('');
      setUsername('');
      setConfirmPassword('');
      setTodos([]);
      setOldTodos([]);
    } catch (error) {
      console.log('Error during logout:', error);
    }
  };

  const addTodo = async () => {
    if (todoText.trim() === '') return;
    
    try {
      if (!currentUser) {
        Alert.alert('Error', 'Please login again');
        handleLogout();
        return;
      }
      
      const newTodo: TodoDataType = {
        id: generateId(),
        title: todoText,
        completed: false,
        userId: currentUser.id,
      };
      
      const updatedTodos = [...todos, newTodo];
      setTodos(updatedTodos);
      setOldTodos(updatedTodos);
      
      
      await AsyncStorage.setItem(`todos_${currentUser.id}`, JSON.stringify(updatedTodos));
      setTodoText('');
      Keyboard.dismiss();
    } catch (error) {
      console.log('Error adding todo:', error);
      Alert.alert('Error', 'Failed to add todo');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const updatedTodos = todos.filter(todo => todo.id !== id);
      setTodos(updatedTodos);
      setOldTodos(updatedTodos);
      
      if (currentUser) {
        await AsyncStorage.setItem(`todos_${currentUser.id}`, JSON.stringify(updatedTodos));
      }
    } catch (error) {
      console.log('Error deleting todo:', error);
      Alert.alert('Error', 'Failed to delete todo');
    }
  };

  const handleTodo = async (id: string) => {
    try {
      const updatedTodos = todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
      setTodos(updatedTodos);
      setOldTodos(updatedTodos);
      
      if (currentUser) {
        await AsyncStorage.setItem(`todos_${currentUser.id}`, JSON.stringify(updatedTodos));
      }
    } catch (error) {
      console.log('Error updating todo:', error);
      Alert.alert('Error', 'Failed to update todo');
    }
  };

  
  const editTodo = async () => {
    if (!editingTodo || editText.trim() === '') return;
    
    try {
      const updatedTodos = todos.map(todo =>
        todo.id === editingTodo.id ? { ...todo, title: editText } : todo
      );
      
      setTodos(updatedTodos);
      setOldTodos(updatedTodos);
      
      if (currentUser) {
        await AsyncStorage.setItem(`todos_${currentUser.id}`, JSON.stringify(updatedTodos));
      }
      
      setIsEditModalVisible(false);
      setEditingTodo(null);
      setEditText('');
    } catch (error) {
      console.log('Error editing todo:', error);
      Alert.alert('Error', 'Failed to edit todo');
    }
  };

  
  const openEditModal = (todo: TodoDataType) => {
    setEditingTodo(todo);
    setEditText(todo.title);
    setIsEditModalVisible(true);
  };

  const onSearch = (query: string) => {
    setSearchQuery(query);
    if (query === '') {
      setTodos(oldTodos);
    } else {
      const filteredTodos = oldTodos.filter(todo =>
        todo.title.toLowerCase().includes(query.toLowerCase())
      );
      setTodos(filteredTodos);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
    setEmail('');
    setPassword('');
    setUsername('');
    setConfirmPassword('');
  };

  if (isLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={[styles.container, styles.centerContent]}>
          <Text>Loading...</Text>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  if (!isLoggedIn) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.authContainer}>
            <Image 
              source={require('../../assets/images/original.jpeg')} 
              style={styles.logo} 
            />
            <Text style={styles.authTitle}>
              {authMode === 'login' ? 'NeuroNote Login' : 'Create Account'}
            </Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color="#777" style={styles.inputIcon} />
              <TextInput
                placeholder="Email"
                style={styles.authInput}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                placeholderTextColor="#999"
                keyboardType="email-address"
              />
            </View>
            
            {authMode === 'signup' && (
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color="#777" style={styles.inputIcon} />
                <TextInput
                  placeholder="Username"
                  style={styles.authInput}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color="#777" style={styles.inputIcon} />
              <TextInput
                placeholder="Password"
                style={styles.authInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#999"
              />
            </View>
            
            {authMode === 'signup' && (
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#777" style={styles.inputIcon} />
                <TextInput
                  placeholder="Confirm Password"
                  style={styles.authInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholderTextColor="#999"
                />
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.authButton} 
              onPress={authMode === 'login' ? handleLogin : handleSignUp}
            >
              <Text style={styles.authButtonText}>
                {authMode === 'login' ? 'Login' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={toggleAuthMode} style={styles.authToggle}>
              <Text style={styles.authToggleText}>
                {authMode === 'login' 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Login"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => console.log('Menu pressed')}>
            <Ionicons name="menu" size={24} color="black" />
          </TouchableOpacity>
          <View style={styles.headerUser}>
            <Text style={styles.username}>{currentUser?.username}</Text>
            <Image source={require('../../assets/images/original.jpeg')} style={styles.logo} />
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#777" />
          <TextInput
            placeholder="Search tasks..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={onSearch}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.todoListContainer}>
          {todos.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-done-circle" size={50} color="#ddd" />
              <Text style={styles.emptyStateText}>No tasks yet</Text>
              <Text style={styles.emptyStateSubtext}>Add a task to get started</Text>
            </View>
          ) : (
            <ScrollView style={styles.todoList}>
              {[...todos].reverse().map((item) => (
                <TodoItems 
                  key={item.id} 
                  todo={item} 
                  deleteTodo={deleteTodo} 
                  handleTodo={handleTodo}
                  editTodo={openEditModal}
                />
              ))}
            </ScrollView>
          )}
        </View>

        <KeyboardAvoidingView
          style={styles.footer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <TextInput
            placeholder="Add a new task..."
            value={todoText}
            onChangeText={setTodoText}
            autoCorrect={false}
            style={styles.TextInput}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.addbutton} onPress={addTodo}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </KeyboardAvoidingView>

        {/* Edit Todo Modal */}
        <Modal
          visible={isEditModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsEditModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Task</Text>
              
              <TextInput
                style={styles.modalInput}
                value={editText}
                onChangeText={setEditText}
                placeholder="Edit your task..."
                autoFocus={true}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsEditModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={editTodo}
                >
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const TodoItems = ({
  todo,
  deleteTodo,
  handleTodo,
  editTodo,
}: {
  todo: TodoDataType;
  deleteTodo: (id: string) => void;
  handleTodo: (id: string) => void;
  editTodo: (todo: TodoDataType) => void;
}) => (
  <View style={styles.todoContainer}>
    <View style={styles.todoInfoContainer}>
      <Checkbox
        value={todo.completed}
        onValueChange={() => handleTodo(todo.id)}
        color={todo.completed ? '#ccc' : '#007AFF'}
      />
      <Text style={[styles.todoText, todo.completed && styles.completedTodo]}>
        {todo.title}
      </Text>
    </View>
    <View style={styles.todoActions}>
      <TouchableOpacity
        onPress={() => editTodo(todo)}
        style={styles.editButton}
      >
        <Ionicons name="create-outline" size={20} color="#007AFF" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          Alert.alert(
            "Delete Task",
            "Are you sure you want to delete this task?",
            [
              {
                text: "Cancel",
                style: "cancel"
              },
              { 
                text: "Delete", 
                onPress: () => deleteTodo(todo.id),
                style: "destructive"
              }
            ]
          );
        }}
        style={styles.deleteButton}
      >
        <Ionicons name="trash" size={20} color="#ff3b30" />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  authContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#4361ee',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '##f8f9fa',
  },
  inputIcon: {
    marginRight: 10,
  },
  authInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  authButton: {
    backgroundColor: '#4361ee',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  authToggle: {
    marginTop: 15,
  },
  authToggleText: {
    color: '#4361ee',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    marginRight: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  todoListContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  todoList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#888',
    marginTop: 15,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 5,
  },
  todoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  todoInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  todoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  completedTodo: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  todoActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 5,
    marginRight: 10,
  },
  deleteButton: {
    padding: 5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  TextInput: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f9fa',
  },
  addbutton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
    marginLeft: 10,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
