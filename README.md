# Todo List Application

## Description
Todo List is a modern mobile task management application developed using React Native and Expo. The app provides an intuitive and user-friendly interface for creating, editing, and tracking your tasks.

## Key Features
- ✅ Create new tasks
- ✏️ Edit existing tasks
- 🗑️ Delete tasks with confirmation
- ✓ Mark tasks as completed/incomplete
- 🔍 Filter tasks (all/active/completed)
- 💾 Automatic task saving
- 📱 Adaptive design for various devices
- 🌙 Dark theme support
- 📅 Add due dates for tasks
- 📊 Android widget showing active tasks count

## Technical Features
- React Native + Expo
- AsyncStorage for local data storage
- Native Android widget
- Adaptive design
- Animations and visual effects
- Gesture support

## Installation and Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation
1. Clone the repository:
```bash
git clone https://github.com/mr2726/todoApp__expo.git
cd todo_app
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npx expo start
```

### Building APK
To create an APK file, run:
```bash
eas build -p android --profile preview
```

## Application Usage

### Basic Operations
1. **Adding a Task**
   - Tap the "+" button at the bottom of the screen
   - Enter task name
   - Optionally set due date
   - Tap "Save"

2. **Editing a Task**
   - Tap on the task
   - Make necessary changes
   - Tap "Save"

3. **Deleting a Task**
   - Tap the trash icon next to the task
   - Confirm deletion

4. **Filtering Tasks**
   - Use filter buttons at the top of the screen
   - Choose desired filter: "All", "Active", or "Completed"

### Android Widget
- Add widget to home screen
- Widget automatically updates when task list changes
- Shows count of active tasks

## Project Architecture
```
todo_app/
├── App.js              # Main application component
├── android/            # Native Android files
│   └── app/
│       └── src/
│           └── main/
│               ├── java/
│               │   └── com/
│               │       └── todolist/
│               │           └── widget/    # Widget code
│               └── res/                   # Android resources
├── assets/            # Images and other resources
└── node_modules/      # Project dependencies
```

## Technologies
- React Native
- Expo
- AsyncStorage
- React Native Modal
- React Native DateTimePicker
- Native Android Widget API

## Planned Improvements
- [ ] Add task categories
- [ ] Set task priorities
- [ ] Cloud synchronization
- [ ] Task reminders
- [ ] Task completion statistics
- [ ] Task export/import
- [ ] Multiple task lists support
- [ ] Calendar integration

## Contributing
We welcome contributions to the project! If you want to make changes:
1. Fork the repository
2. Create a branch for your changes
3. Make your changes
4. Create a Pull Request

## Authors
- MR.2726

## Acknowledgments
- React Native team
- Expo team
- All project contributors 
