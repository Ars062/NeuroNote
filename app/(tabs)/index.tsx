import { Image } from 'expo-image';
import { Platform, View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Keyboard } from 'react-native';

import { FlatList } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

type todoDataType = {
  id: string;
  title: string;
  completed: boolean;
};

export default function HomeScreen() {
  const [todos, setTodos] = useState<todoDataType[]>([]);
  const [todoText, setTodoText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [oldTodos, setOldTodos] = useState<todoDataType[]>([]);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const storedTodos = await AsyncStorage.getItem('todos');
        if (storedTodos != null) {
          const parsedTodos = JSON.parse(storedTodos);
          setTodos(parsedTodos);
          setOldTodos(parsedTodos);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (todoText.trim() === '') return;
    try {
      const newTodo: todoDataType = {
        id: uuidv4(),
        title: todoText,
        completed: false,
      };
      const updatedTodos = [...todos, newTodo];
      setTodos(updatedTodos);
      setOldTodos(updatedTodos);
      await AsyncStorage.setItem('todos', JSON.stringify(updatedTodos));
      setTodoText('');
      Keyboard.dismiss();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const updatedTodos = todos.filter(todo => todo.id !== id);
      setTodos(updatedTodos);
      setOldTodos(updatedTodos);
      await AsyncStorage.setItem('todos', JSON.stringify(updatedTodos));
    } catch (error) {
      console.log(error);
    }
  };

  const handleTodo = async (id: string) => {
    try {
      const updatedTodos = todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
      setTodos(updatedTodos);
      setOldTodos(updatedTodos);
      await AsyncStorage.setItem('todos', JSON.stringify(updatedTodos));
    } catch (error) {
      console.log(error);
    }
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => console.log('Menu pressed')}>
          <Ionicons name="menu" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log('Logo')}>
          <Image source={require('../../assets/images/original.jpeg')} style={styles.logo} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={24} color="black" />
        <TextInput
          placeholder="Search"
          style={styles.searchInput}
          clearButtonMode="always"
          value={searchQuery}
          onChangeText={onSearch}
        />
      </View>

      <FlatList
        data={[...todos].reverse()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TodoItems todo={item} deleteTodo={deleteTodo} handleTodo={handleTodo} />
        )}
      />

      <KeyboardAvoidingView
        style={styles.footer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <TextInput
          placeholder="Add a new task"
          value={todoText}
          onChangeText={setTodoText}
          autoCorrect={false}
          style={styles.TextInput}
        />
        <TouchableOpacity style={styles.addbutton} onPress={addTodo}>
          <Ionicons name="add" size={34} color="#fff" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const TodoItems = ({
  todo,
  deleteTodo,
  handleTodo,
}: {
  todo: todoDataType;
  deleteTodo: (id: string) => void;
  handleTodo: (id: string) => void;
}) => (
  <View style={styles.todoContainer}>
    <View style={styles.todoInfoContainer}>
      <Checkbox
        value={todo.completed}
        onValueChange={() => handleTodo(todo.id)}
        color={todo.completed ? '#ccc' : undefined}
      />
      <Text style={[styles.todoText, todo.completed && { textDecorationLine: 'line-through', color: 'gray' }]}>
        {todo.title}
      </Text>
    </View>
    <TouchableOpacity
      onPress={() => {
        deleteTodo(todo.id);
        alert('Deleted ' + todo.title);
      }}
    >
      <Ionicons name="trash" size={24} color="red" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  searchBar: {
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  todoContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  todoInfoContainer: {
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  todoText: {
    fontSize: 16,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 10,
  },
  TextInput: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 10,
    borderRadius: 10,
    fontSize: 16,
    color: '#333',
  },
  addbutton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 10,
    marginLeft: 10,
  },
});
