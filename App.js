import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Switch,
  Platform,
  NativeModules,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';

const STORAGE_KEY = '@todo_items';

// Add widget update function
const updateWidget = (activeTasks) => {
  if (Platform.OS === 'android' && NativeModules.WidgetModule) {
    try {
      NativeModules.WidgetModule.updateWidget(activeTasks);
    } catch (error) {
      console.log('Widget update failed:', error);
    }
  }
};

export default function App() {
  const [todos, setTodos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'active'
  const [editingTodo, setEditingTodo] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState('personal');
  const [priority, setPriority] = useState('medium');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'priority', 'category'
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState([
    { id: 'personal', name: 'Personal', color: '#6C5CE7' },
    { id: 'work', name: 'Work', color: '#00B894' },
    { id: 'shopping', name: 'Shopping', color: '#FF7675' },
  ]);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#6C5CE7' });

  useEffect(() => {
    loadTodos();
  }, []);

  // Update widget when todos change
  useEffect(() => {
    const activeTasks = todos.filter(todo => !todo.completed).length;
    updateWidget(activeTasks);
  }, [todos]);

  const loadTodos = async () => {
    try {
      const storedTodos = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTodos !== null) {
        setTodos(JSON.parse(storedTodos));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load todos');
    }
  };

  const saveTodos = async (updatedTodos) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTodos));
      setTodos(updatedTodos);
    } catch (error) {
      Alert.alert('Error', 'Failed to save todos');
    }
  };

  const addTodo = () => {
    if (newTodo.trim() === '') return;
    
    const newTodoItem = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      category: selectedCategory,
      priority: priority,
      dueDate: selectedDate,
      notes: '',
      createdAt: new Date().toISOString(),
      subtasks: [],
    };

    saveTodos([...todos, newTodoItem]);
    setNewTodo('');
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedDate(new Date());
    setSelectedCategory('personal');
    setPriority('medium');
    setNewTodo('');
  };

  const toggleTodo = (id) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos(updatedTodos);
  };

  const deleteTodo = (id) => {
    Alert.alert(
      'Delete Todo',
      'Are you sure you want to delete this todo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedTodos = todos.filter(todo => todo.id !== id);
            saveTodos(updatedTodos);
          },
        },
      ]
    );
  };

  const editTodo = (todo) => {
    setEditingTodo(todo);
    setNewTodo(todo.text);
    setModalVisible(true);
  };

  const updateTodo = () => {
    if (newTodo.trim() === '') return;

    const updatedTodos = todos.map(todo =>
      todo.id === editingTodo.id ? { ...todo, text: newTodo.trim() } : todo
    );
    saveTodos(updatedTodos);
    setNewTodo('');
    setModalVisible(false);
    setEditingTodo(null);
  };

  const addSubtask = (todoId, subtaskText) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === todoId) {
        const newSubtask = {
          id: Date.now().toString(),
          text: subtaskText,
          completed: false,
        };
        return {
          ...todo,
          subtasks: [...todo.subtasks, newSubtask],
        };
      }
      return todo;
    });
    saveTodos(updatedTodos);
  };

  const toggleSubtask = (todoId, subtaskId) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === todoId) {
        return {
          ...todo,
          subtasks: todo.subtasks.map(subtask =>
            subtask.id === subtaskId
              ? { ...subtask, completed: !subtask.completed }
              : subtask
          ),
        };
      }
      return todo;
    });
    saveTodos(updatedTodos);
  };

  const addCategory = () => {
    if (newCategory.name.trim() === '') return;
    
    const newCat = {
      id: Date.now().toString(),
      name: newCategory.name.trim(),
      color: newCategory.color,
    };
    
    setCategories([...categories, newCat]);
    setNewCategory({ name: '', color: '#6C5CE7' });
    setShowCategoryModal(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#FF7675';
      case 'medium':
        return '#FDCB6E';
      case 'low':
        return '#00B894';
      default:
        return '#6C5CE7';
    }
  };

  const sortTodos = (todosToSort) => {
    return [...todosToSort].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });
  };

  const filteredAndSortedTodos = sortTodos(
    todos.filter(todo => {
      const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' 
        ? true 
        : filter === 'completed' 
          ? todo.completed 
          : !todo.completed;
      return matchesSearch && matchesFilter;
    })
  );

  const renderTodoItem = ({ item }) => (
    <View style={[
      styles.todoItem,
      { borderLeftColor: categories.find(cat => cat.id === item.category)?.color || '#6C5CE7' }
    ]}>
      <TouchableOpacity
        style={styles.todoContent}
        onPress={() => toggleTodo(item.id)}
      >
        <View style={[styles.checkbox, item.completed && styles.checked]} />
        <View style={styles.todoTextContainer}>
          <Text style={[styles.todoText, item.completed && styles.completedText]}>
            {item.text}
          </Text>
          {item.subtasks && item.subtasks.length > 0 && (
            <View style={styles.subtasksContainer}>
              {item.subtasks.map(subtask => (
                <View key={subtask.id} style={styles.subtaskItem}>
                  <TouchableOpacity
                    onPress={() => toggleSubtask(item.id, subtask.id)}
                    style={styles.subtaskCheckbox}
                  >
                    <View style={[styles.subtaskCheckboxInner, subtask.completed && styles.checked]} />
                  </TouchableOpacity>
                  <Text style={[styles.subtaskText, subtask.completed && styles.completedText]}>
                    {subtask.text}
                  </Text>
                </View>
              ))}
            </View>
          )}
          <View style={styles.todoMeta}>
            <Text style={styles.todoDate}>
              {new Date(item.dueDate).toLocaleDateString()}
            </Text>
            <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(item.priority) }]} />
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.todoActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => editTodo(item)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteTodo(item.id)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>Todo List</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.themeToggle}
            onPress={() => setIsDarkMode(!isDarkMode)}
          >
            <Text style={[styles.themeToggleText, isDarkMode && styles.darkText]}>
              {isDarkMode ? '☀️' : '🌙'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setEditingTodo(null);
              resetForm();
              setModalVisible(true);
            }}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.searchContainer, isDarkMode && styles.darkSearchContainer]}>
        <TextInput
          style={[styles.searchInput, isDarkMode && styles.darkInput]}
          placeholder="Search tasks..."
          placeholderTextColor={isDarkMode ? '#A0A0A0' : '#666'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={[styles.filterContainer, isDarkMode && styles.darkFilterContainer]}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={styles.filterButtonText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'active' && styles.activeFilter]}
          onPress={() => setFilter('active')}
        >
          <Text style={styles.filterButtonText}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.activeFilter]}
          onPress={() => setFilter('completed')}
        >
          <Text style={styles.filterButtonText}>Completed</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.sortContainer, isDarkMode && styles.darkSortContainer]}>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'date' && styles.activeSort]}
          onPress={() => setSortBy('date')}
        >
          <Text style={styles.sortButtonText}>Date</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'priority' && styles.activeSort]}
          onPress={() => setSortBy('priority')}
        >
          <Text style={styles.sortButtonText}>Priority</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'category' && styles.activeSort]}
          onPress={() => setSortBy('category')}
        >
          <Text style={styles.sortButtonText}>Category</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredAndSortedTodos}
        renderItem={renderTodoItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />

      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modal}
      >
        <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
          <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
            {editingTodo ? 'Edit Todo' : 'Add New Todo'}
          </Text>
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            value={newTodo}
            onChangeText={setNewTodo}
            placeholder="Enter todo text"
            placeholderTextColor={isDarkMode ? '#A0A0A0' : '#666'}
            autoFocus
          />
          
          <View style={styles.categorySelector}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>Category:</Text>
            <View style={styles.categoryButtons}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    { backgroundColor: category.color },
                    selectedCategory === category.id && styles.selectedCategory
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text style={styles.categoryButtonText}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.prioritySelector}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>Priority:</Text>
            <View style={styles.priorityButtons}>
              {['low', 'medium', 'high'].map(p => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityButton,
                    { backgroundColor: getPriorityColor(p) },
                    priority === p && styles.selectedPriority
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={styles.priorityButtonText}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.dateButtonText, isDarkMode && styles.darkText]}>
              Due Date: {selectedDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setSelectedDate(selectedDate);
                }
              }}
              textColor={isDarkMode ? '#000000' : '#000000'}
              themeVariant={isDarkMode ? 'dark' : 'light'}
              style={{color: isDarkMode ? '#000000' : '#000000'}}
            />
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setModalVisible(false);
                setEditingTodo(null);
                resetForm();
              }}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={editingTodo ? updateTodo : addTodo}
            >
              <Text style={styles.modalButtonText}>
                {editingTodo ? 'Update' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        isVisible={showCategoryModal}
        onBackdropPress={() => setShowCategoryModal(false)}
        style={styles.modal}
      >
        <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
          <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>Add New Category</Text>
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            value={newCategory.name}
            onChangeText={(text) => setNewCategory({ ...newCategory, name: text })}
            placeholder="Category name"
            placeholderTextColor={isDarkMode ? '#A0A0A0' : '#666'}
          />
          <View style={styles.colorPicker}>
            {['#6C5CE7', '#00B894', '#FF7675', '#FDCB6E', '#0984E3'].map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  newCategory.color === color && styles.selectedColor
                ]}
                onPress={() => setNewCategory({ ...newCategory, color })}
              />
            ))}
          </View>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={addCategory}
            >
              <Text style={styles.modalButtonText}>Add Category</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  darkContainer: {
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  darkHeader: {
    backgroundColor: '#2D2D2D',
    borderBottomColor: '#404040',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3436',
    letterSpacing: 0.5,
  },
  darkText: {
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggle: {
    marginRight: 15,
    padding: 8,
  },
  themeToggleText: {
    fontSize: 24,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C5CE7',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  darkSearchContainer: {
    backgroundColor: '#2D2D2D',
    borderBottomColor: '#404040',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  darkInput: {
    backgroundColor: '#404040',
    color: '#FFFFFF',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  darkFilterContainer: {
    backgroundColor: '#2D2D2D',
    borderBottomColor: '#404040',
  },
  filterButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#6C5CE7',
  },
  filterButtonText: {
    color: '#2D3436',
    fontSize: 14,
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  darkSortContainer: {
    backgroundColor: '#2D2D2D',
    borderBottomColor: '#404040',
  },
  sortButton: {
    flex: 1,
    padding: 8,
    marginHorizontal: 5,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  activeSort: {
    backgroundColor: '#6C5CE7',
  },
  sortButtonText: {
    color: '#2D3436',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    flex: 1,
    paddingTop: 15,
  },
  todoItem: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginVertical: 6,
    marginHorizontal: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  todoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#6C5CE7',
    marginRight: 15,
    marginTop: 2,
  },
  checked: {
    backgroundColor: '#6C5CE7',
  },
  todoTextContainer: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
    color: '#2D3436',
    fontWeight: '500',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#B2BEC3',
  },
  subtasksContainer: {
    marginTop: 8,
    marginLeft: 43,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  subtaskCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6C5CE7',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtaskCheckboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6C5CE7',
  },
  subtaskText: {
    fontSize: 14,
    color: '#2D3436',
  },
  todoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  todoDate: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  todoActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 10,
    marginLeft: 10,
    borderRadius: 10,
    backgroundColor: '#6C5CE7',
    minWidth: 70,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF7675',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  darkModalContent: {
    backgroundColor: '#2D2D2D',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2D3436',
    textAlign: 'center',
  },
  input: {
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
  },
  categorySelector: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 10,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedCategory: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  categoryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  prioritySelector: {
    marginBottom: 20,
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityButton: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectedPriority: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  priorityButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  dateButton: {
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    marginBottom: 20,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#2D3436',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  modalButton: {
    padding: 12,
    borderRadius: 12,
    marginLeft: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF7675',
  },
  saveButton: {
    backgroundColor: '#6C5CE7',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#6C5CE7',
  },
});
